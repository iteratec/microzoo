import * as fs from "fs";
const yaml = require("js-yaml");
import {MicrozooSystem} from "../model/MicrozooSystem";
import {ComponentType} from "../model/Types";
import {Constants} from "../config/Constants";

interface Specs {
    services: {[name: string]: ComponentSpec};
    databases: {[name: string]: ComponentSpec};
}
interface ComponentSpec {
    name: string;
    description: string;

    config: {[name: string]: string | number | boolean};
}

export default class MicrozooValidator {
    private specs: Specs = {services: {}, databases: {}};

    constructor(private system: MicrozooSystem) {
        this.collectSpecs();
    }

    public validate(): boolean {
        return true;
    }

    private collectSpecs(): void {
        this.collectComponentSpecs(ComponentType.SERVICE);
        this.collectComponentSpecs(ComponentType.DATABASE);
    }

    private collectComponentSpecs(type: string): void {
        const dirs = fs.readdirSync(`${Constants.COMPONENTS_DIR}/${type}`, {withFileTypes: true}).filter(entry => entry.isDirectory()).map(entry => entry.name);
        return dirs
          .map(dir => MicrozooValidator.loadComponentSpec(type, dir))
          .filter(spec => spec)
          .forEach(spec => this.specs[`${type}s`][spec.name] = spec);
    }

    private static loadComponentSpec(type: string, dir: string): ComponentSpec {
        const filepath = `${Constants.COMPONENTS_DIR}/${type}/${dir}/${Constants.CONFIG_YML}`;
        try {
            const content = fs.readFileSync(filepath, 'utf8');
            return yaml.load(content);
        }
        catch (error) {
            console.log(`Error reading file from ${filepath}: ${error}`);
            return undefined;
        }
    }
}
