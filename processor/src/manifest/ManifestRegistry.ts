import * as fs from "fs";
const yaml = require("js-yaml");
import {ComponentType} from "../model/Types";
import {Constants} from "../config/Constants";

interface Manifests {
    services: {[name: string]: ComponentManifest};
    databases: {[name: string]: ComponentManifest};
}

export interface ComponentManifest {
    dir: string;
    name: string;
    description: string;
    constants: {[name: string]: string};
    docker: {
        image: string;
        environment: {[key: string]: string};
    };
    interfaces: {
        downstream: {[name: string]: {protocol: string, port: string, environment: {[key: string]: string}}};
        upstream: {[name: string]: {protocol: string, environment: {[key: string]: string}}};
    };
    databases: {[type: string]: {environment: {[key: string]: string}, profile?: string}};
    config: {[name: string]: string | number | boolean};
}

export class ManifestRegistry {
    private manifests: Manifests = {services: {}, databases: {}};

    public constructor() {
        this.collectSpecs();
    }

    public getService(name: string): ComponentManifest {
        return this.manifests.services[name];
    }

    public getDatabase(name: string): ComponentManifest {
        return this.manifests.databases[name];
    }

    private collectSpecs(): void {
        this.collectComponentSpecs(ComponentType.SERVICE);
        this.collectComponentSpecs(ComponentType.DATABASE);
    }

    private collectComponentSpecs(type: string): void {
        const dirs = fs.readdirSync(`${Constants.COMPONENTS_DIR}/${type}`, {withFileTypes: true}).filter(entry => entry.isDirectory()).map(entry => entry.name);
        return dirs
          .map(dir => ManifestRegistry.loadComponentSpec(type, dir))
          .filter(spec => spec)
          .forEach(spec => this.manifests[`${type}s`][spec.name] = spec);
    }

    private static loadComponentSpec(type: string, dir: string): ComponentManifest {
        const filepath = `${Constants.COMPONENTS_DIR}/${type}/${dir}/${Constants.CONFIG_YML}`;
        try {
            const content = fs.readFileSync(filepath, 'utf8');
            return {dir, ...yaml.load(content)};
        }
        catch (error) {
            console.log(`Error reading file from ${filepath}: ${error}`);
            return undefined;
        }
    }
}
