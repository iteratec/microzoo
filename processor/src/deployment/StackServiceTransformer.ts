const Handlebars = require("handlebars");

import {MicrozooDatabase, MicrozooService, MicrozooSystem, MicrozooUpstreamInterface} from "../model/MicrozooSystem";
import {ComponentManifest, ManifestRegistry} from "../manifest/ManifestRegistry";
import {Mapper} from "../common/Mapper";
import {StringUtil} from "../common/StringUtil";

export interface StackPort {
    targetPort: string;
    sourcePort: string;
}

export interface StackService {
    id: string;
    image: string;
    ports?: StackPort[];
    environment: {[key: string]: string};
    dependencies?: string[];
}

export class StackServiceTransformer {
    public constructor(private manifestRegistry: ManifestRegistry, private microzooSystem: MicrozooSystem) {
    }

    public getServices(): StackService[] {
        const services = this.microzooSystem.services.map(service => this.getServiceFromService(service));
        const databases = this.microzooSystem.databases.map(database => this.getServiceFromDatabase(database));
        return [...services, ...databases];
    }

    private getDatabaseByName(name: string): MicrozooDatabase {
        return this.microzooSystem.databases.find(database => database.name === name);
    }

    private getServiceByName(name: string): MicrozooService {
        return this.microzooSystem.services.find(service => service.name === name);
    }

    private getServiceFromService(service: MicrozooService): StackService {
        const manifest = this.manifestRegistry.getService(service.type);
        return {
            id: service.id,
            image: manifest.docker.image,
            ports: StackServiceTransformer.collectServicePorts(service, manifest),
            environment: this.getServiceEnvironment(service, manifest),
            dependencies: this.collectDependencies(service)
        };
    }

    private getServiceFromDatabase(database: MicrozooDatabase): StackService {
        const manifest = this.manifestRegistry.getDatabase(database.type);
        return {
            id: database.id,
            image: manifest.docker.image,
            ports: StackServiceTransformer.collectDatabasePorts(database, manifest),
            environment: manifest.docker.environment
        };
    }

    private static collectServicePorts(service: MicrozooService, manifest: ComponentManifest): StackPort[] {
        const servicePort = StackServiceTransformer.getServicePort(manifest);

        if (service.interfaces.ports) {
            return service.interfaces.ports.map(port => ({ targetPort: port.targetPort, sourcePort: port.sourcePort || servicePort}));
        }
    }

    private static collectDatabasePorts(database: MicrozooDatabase, manifest: ComponentManifest): StackPort[] {
        const databasePort = StackServiceTransformer.getDatabasePort(manifest);

        if (database.port) {
            return [{targetPort: database.port.targetPort, sourcePort: database.port.sourcePort || databasePort}];
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
            return StackServiceTransformer.getUrl(downstreamInterface.protocol, upstreamService.id, downstreamInterface.port);
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

}
