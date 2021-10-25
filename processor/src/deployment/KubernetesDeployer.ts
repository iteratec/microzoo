import * as fs from "fs";
const Handlebars = require("handlebars");

import {MicrozooDeployer} from "./MicrozooDeployer";
import {ManifestRegistry} from "../manifest/ManifestRegistry";
import {MicrozooSystem} from "../model/MicrozooSystem";
import {StackService, StackServiceTransformer} from "./StackServiceTransformer";
import delay from "../common/delay";
import spawn from "../common/spawn";
import {PortForwardManager} from "./PortForwardManager";

interface PodInfo {
    items: {
        status: {
            phase: string;
        };
    }[];
}

export class KubernetesDeployer implements MicrozooDeployer {
    private readonly deploymentTemplate;
    private readonly serviceTemplate;
    private services: StackService[];

    public constructor(private manifestRegistry: ManifestRegistry, private microzooSystem: MicrozooSystem) {
        let templateRaw = fs.readFileSync("./src/deployment/template/kube-deployment.hbs").toString();
        this.deploymentTemplate = Handlebars.compile(templateRaw);
        templateRaw = fs.readFileSync("./src/deployment/template/kube-service.hbs").toString();
        this.serviceTemplate = Handlebars.compile(templateRaw);
    }

    public async compile(): Promise<boolean> {
        this.cleanStack();
        this.services = this.createStack();
        return true;
    }

    public async deploy(): Promise<boolean> {
        await this.startKubernetes();
        await this.servicesRunning();
        this.startPortForwards();
        return true;
    }

    public async drop(): Promise<boolean> {
        await this.dropKubernetes();
        return true;
    }

    public async test(): Promise<boolean> {
        return true;
    }

    private cleanStack(): void {
        if (fs.existsSync(`../stacks/${this.microzooSystem.name}/kubernetes`)) {
            fs.rmSync(`../stacks/${this.microzooSystem.name}/kubernetes`, {recursive: true});
        }
    }

    private createStack(): StackService[] {
        fs.mkdirSync(`../stacks/${this.microzooSystem.name}/kubernetes`, {recursive: true});
        const transformer = new StackServiceTransformer(this.manifestRegistry, this.microzooSystem);
        const services = transformer.getServices();
        services.forEach(service => this.createServiceFiles(service));
        return services;
    }

    private createServiceFiles(service: StackService): void {
        const serviceFile = this.serviceTemplate({service, stack: this.microzooSystem.name});
        fs.writeFileSync(`../stacks/${this.microzooSystem.name}/kubernetes/${service.id}-service.yaml`, serviceFile);
        const deploymentFile = this.deploymentTemplate({service, stack: this.microzooSystem.name});
        fs.writeFileSync(`../stacks/${this.microzooSystem.name}/kubernetes/${service.id}-deployment.yaml`, deploymentFile);
    }

    private async startKubernetes(): Promise<any> {
        try {
            await spawn.promise(`kubectl create namespace ${this.microzooSystem.name}`, true);
        }
        catch (error) {
            console.log("* Namespace already exists, stack is probably running");
        }
        return spawn.promise(`kubectl apply -f ../stacks/${this.microzooSystem.name}/kubernetes/ --namespace="${this.microzooSystem.name}"`, true);
    }

    private async servicesRunning(): Promise<void> {
        let running = await this.areServicesRunning();

        while (!running) {
            await delay(100);
            running = await this.areServicesRunning();
        }
    }

    private startPortForwards(): void {
        const portInfos = [].concat(...this.services
          .map(service => service.ports
            .map(port => ({service, port: port}))));

        new PortForwardManager(this.microzooSystem.name).start(portInfos);
    }

    private async dropKubernetes(): Promise<any> {
        return spawn.promise(`kubectl delete namespace ${this.microzooSystem.name}`, true);
    }

    private async areServicesRunning(): Promise<boolean> {
        const running = await Promise.all(this.services.map(service => this.isServiceRunning(service)));
        return running.every(value => value);
    }

    private async isServiceRunning(service: StackService): Promise<boolean> {
        const podInfo = await this.getPodInfo(service);
        return podInfo.items.every(item => item.status.phase === "Running");
    }

    private async getPodInfo(service: StackService): Promise<PodInfo> {
        const {stdout} = await spawn.promise(`kubectl get pods -l microzoo.service=${service.id} -o json --namespace="${this.microzooSystem.name}"`, true);
        return JSON.parse(stdout);
    }
}
