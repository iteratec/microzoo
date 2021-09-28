import * as fs from "fs";
const execSh = require("exec-sh").promise;
const Handlebars = require("handlebars");

import {MicrozooDeployer} from "./MicrozooDeployer";
import {MicrozooDatabase, MicrozooService, MicrozooSystem, MicrozooUpstreamInterface} from "../model/MicrozooSystem";
import {ComponentManifest, ManifestRegistry} from "../manifest/ManifestRegistry";
import {StringUtil} from "../common/StringUtil";
import {Mapper} from "../common/Mapper";

interface DockerComposeService {
    id: string;
    image: string;
    ports?: string[];
    environment: {[key: string]: string};
    dependencies?: string[];
}

export class DockerComposeDeployer implements MicrozooDeployer {
    private readonly template;

    public constructor(private manifestRegistry: ManifestRegistry, private microzooSystem: MicrozooSystem) {
        const templateRaw = fs.readFileSync("./src/deployment/template/compose.hbs").toString();
        this.template = Handlebars.compile(templateRaw);
    }

    public async compile(): Promise<boolean> {
        this.cleanStack();
        this.createComposeFile();
        return true;
    }

    public async deploy(): Promise<boolean> {
        await this.startDockerCompose();
        return true;
    }

    public async drop(): Promise<boolean> {
        await this.dropDockerCompose();
        return true;
    }

    private cleanStack(): void {
        if (fs.existsSync(`../stacks/${this.microzooSystem.name}/docker-compose`)) {
            fs.rmSync(`../stacks/${this.microzooSystem.name}/docker-compose`, {recursive: true});
        }
    }

    private createComposeFile(): void {
        const composeFile = this.template({services: this.getServices(), stack: this.microzooSystem.name});
        fs.mkdirSync(`../stacks/${this.microzooSystem.name}/docker-compose`, {recursive: true});
        fs.writeFileSync(`../stacks/${this.microzooSystem.name}/docker-compose/docker-compose.yml`, composeFile);
    }

    private getDatabaseByName(name: string): MicrozooDatabase {
        return this.microzooSystem.databases.find(database => database.name === name);
    }

    private getServiceByName(name: string): MicrozooService {
        return this.microzooSystem.services.find(service => service.name === name);
    }

    public async test(): Promise<boolean> {
        await this.execK6();
        return true;
    }

    private getServices(): DockerComposeService[] {
        const services = this.microzooSystem.services.map(service => this.getServiceFromService(service));
        const databases = this.microzooSystem.databases.map(database => this.getServiceFromDatabase(database));
        return [...services, ...databases];
    }

    private getServiceFromService(service: MicrozooService): DockerComposeService {
        const manifest = this.manifestRegistry.getService(service.type);
        return {
            id: service.id,
            image: manifest.docker.image,
            ports: DockerComposeDeployer.collectServicePorts(service, manifest),
            environment: this.getServiceEnvironment(service, manifest),
            dependencies: this.collectDependencies(service)
        };
    }

    private getServiceFromDatabase(database: MicrozooDatabase): DockerComposeService {
        const manifest = this.manifestRegistry.getDatabase(database.type);
        return {
            id: database.id,
            image: manifest.docker.image,
            ports: DockerComposeDeployer.collectDatabasePorts(database, manifest),
            environment: manifest.docker.environment
        };
    }

    private static collectServicePorts(service: MicrozooService, manifest: ComponentManifest): string[] {
        const servicePort = DockerComposeDeployer.getServicePort(manifest);

        if (service.interfaces.ports) {
            return service.interfaces.ports.map(port => `${port.targetPort}:${port.sourcePort || servicePort}`);
        }
    }

    private static collectDatabasePorts(database: MicrozooDatabase, manifest: ComponentManifest): string[] {
        const databasePort = DockerComposeDeployer.getDatabasePort(manifest);

        if (database.port) {
            return [`${database.port.targetPort}:${database.port.sourcePort || databasePort}`];
        }
    }

    private static getServicePort(manifest: ComponentManifest): string {
        const ports = Object.values(manifest.interfaces.downstream).map(iface => iface["port"]);
        for (let port of ports) {
            if (port) {
                return port;
            }
        }
    }

    private static getDatabasePort(manifest: ComponentManifest): string {
        return manifest.constants["port"];
    }

    private collectDependencies(service: MicrozooService): string[] {
        if (service.interfaces.database) {
            const database = this.getDatabaseByName(service.interfaces.database.database);
            return [database.id];
        }
    }

    private collectProfiles(service: MicrozooService, manifest: ComponentManifest): string {
        const profiles = [];

        if (service.interfaces.database) {
            const database = this.getDatabaseByName(service.interfaces.database.database);
            const profile = manifest.databases[database.type]?.profile;
            if (profile) {
                profiles.push(profile);
            }
        }
        else {
            profiles.push("nodatabase");
        }

        return profiles.join(",");
    }

    private getServiceBaseEnvironment(service: MicrozooService, manifest: ComponentManifest): {[key: string]: string} {
        if (manifest.docker.environment) {
            const profiles = this.collectProfiles(service, manifest);
            return this.resolveVariables(manifest.docker.environment, {profiles});
        }

        return {};
    }

    private getServiceDatabaseEnvironment(service: MicrozooService, manifest: ComponentManifest): {[key: string]: string} {
        if (service.interfaces.database) {
            const database = this.getDatabaseByName(service.interfaces.database.database);
            const databaseManifest = this.manifestRegistry.getDatabase(database.type);
            const environment = manifest.databases[database.type]?.environment;
            if (environment) {
                const variables = {database: database, manifest: databaseManifest};
                return this.resolveVariables(environment, variables)
            }
        }

        return {};
    }

    private getServiceServiceEnvironment(service: MicrozooService): {[key: string]: string} {
        if (service.interfaces.upstream) {
            const services = service.interfaces.upstream
              .map(upstreamInterface => this.getServiceUrl(upstreamInterface));

            return {
                MICROZOO_UPSTREAMSERVICES: services.join(",")
            };
        }
    }

    private getServiceUrl(upstreamInterface: MicrozooUpstreamInterface): string {
        const upstreamService = this.getServiceByName(upstreamInterface.service);
        const manifest = this.manifestRegistry.getService(upstreamService.type);
        const downstreamInterface = manifest.interfaces.downstream[upstreamInterface.name];

        if (downstreamInterface?.protocol === Mapper.toProtocol(upstreamInterface.type)) {
            return DockerComposeDeployer.getUrl(downstreamInterface.protocol, upstreamService.id, downstreamInterface.port);
        }
    }

    private static getUrl(protocol: string, host: string, port: string): string {
        return `${Mapper.toUrlProtocol(protocol)}://${host}:${port}`;
    }

    private getServiceConfigEnvironment(service: MicrozooService): {[key: string]: string} {
        const environmentConfig = {};

        if (service.config) {
            Object.keys(service.config).forEach(key => environmentConfig["MICROZOO_" + StringUtil.kebabToSnakeCase(key)] = service.config[key]);
        }

        return environmentConfig;
    }

    private resolveVariables(environment: {[key: string]: string}, variables: object): {[key: string]: string} {
        const environmentResolved = {};

        Object.keys(environment).forEach(key => {
            const template = Handlebars.compile(environment[key]);
            environmentResolved[key] = template(variables);
        });

        return environmentResolved;
    }

    private getServiceEnvironment(service: MicrozooService, manifest: ComponentManifest): {[key: string]: string} {
        let environmentResolved = {
            ...this.getServiceBaseEnvironment(service, manifest),
            ...this.getServiceDatabaseEnvironment(service, manifest),
            ...this.getServiceServiceEnvironment(service),
            ...this.getServiceConfigEnvironment(service)
        };

        if (Object.keys(environmentResolved).length) {
            return environmentResolved;
        }
    }

    private async startDockerCompose(): Promise<void> {
        return execSh(`docker-compose -f ../stacks/${this.microzooSystem.name}/docker-compose/docker-compose.yml up -d --remove-orphans`);
    }

    private async dropDockerCompose(): Promise<void> {
        return execSh(`docker-compose -f ../stacks/${this.microzooSystem.name}/docker-compose/docker-compose.yml down`);
    }

    private async execK6(): Promise<void> {
        return execSh(`docker run -i --rm loadimpact/k6 run - <../stacks/${this.microzooSystem.name}/tester/k6/script.js`)
    }
}
