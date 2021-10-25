import * as fs from "fs";
const Handlebars = require("handlebars");

import {MicrozooDeployer} from "./MicrozooDeployer";
import {MicrozooSystem} from "../model/MicrozooSystem";
import {ManifestRegistry} from "../manifest/ManifestRegistry";
import {StackServiceTransformer} from "./StackServiceTransformer";
import spawn from "../common/spawn";

export class DockerComposeDeployer implements MicrozooDeployer {
    private readonly template;

    public constructor(private manifestRegistry: ManifestRegistry, private microzooSystem: MicrozooSystem) {
        const templateRaw = fs.readFileSync("./src/deployment/template/compose.hbs").toString();
        this.template = Handlebars.compile(templateRaw);
    }

    public async compile(): Promise<boolean> {
        this.cleanStack();
        this.createStack();
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

    private createStack(): void {
        const transformer = new StackServiceTransformer(this.manifestRegistry, this.microzooSystem);
        const composeFile = this.template({services: transformer.getServices(), stack: this.microzooSystem.name});
        fs.mkdirSync(`../stacks/${this.microzooSystem.name}/docker-compose`, {recursive: true});
        fs.writeFileSync(`../stacks/${this.microzooSystem.name}/docker-compose/docker-compose.yml`, composeFile);
    }

    public async test(): Promise<boolean> {
        await this.execK6();
        return true;
    }

    private async startDockerCompose(): Promise<any> {
        return spawn.promise(`docker-compose -f ../stacks/${this.microzooSystem.name}/docker-compose/docker-compose.yml up -d --remove-orphans`, true);
    }

    private async dropDockerCompose(): Promise<any> {
        return spawn.promise(`docker-compose -f ../stacks/${this.microzooSystem.name}/docker-compose/docker-compose.yml down`, true);
    }

    private async execK6(): Promise<any> {
        return spawn.promise(`docker run -i --rm loadimpact/k6 run - <../stacks/${this.microzooSystem.name}/tester/k6/script.js`, true)
    }
}
