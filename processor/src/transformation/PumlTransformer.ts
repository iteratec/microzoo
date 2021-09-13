import {PumlComponent, PumlLink, PumlNote, PumlSystem} from "../model/PumlSystem";
import {
    MicrozooDatabase,
    MicrozooDatabaseInterface,
    MicrozooPort,
    MicrozooService,
    MicrozooSystem,
    MicrozooUpstreamInterface
} from "../model/MicrozooSystem";
import {ComponentType} from "../model/Types";
import {Mapper} from "../common/Mapper";

export default class PumlTransformer {
    private components: {[name: string]: PumlComponent} = {}
    private notes: {[ref: string]: PumlNote} = {}
    private upstreamLinks: {[source: string]: PumlLink[]} = {}
    private downstreamLinks: {[target: string]: PumlLink[]} = {}

    constructor(private source: string, private puml: PumlSystem) {
        puml.components.forEach(component => this.components[component.name] = component);
        puml.notes.forEach(note => this.notes[note.ref] = note);
        puml.links.forEach(link => this.addLink(link));
    }

    private addLink(link: PumlLink): void {
        PumlTransformer.addLink(this.upstreamLinks, link.source, link);
        PumlTransformer.addLink(this.downstreamLinks, link.target, link);
    }

    private static addLink(links: {[source: string]: PumlLink[]}, name: string, link: PumlLink): void {
        links[name] = [...links[name] || [], link];
    }

    public transform(): MicrozooSystem {
        return {
            name: this.source.replace(/\.puml$/, ""),
            services: this.transformServices(),
            databases: this.transformDatabases()
        };
    }

    private transformServices(): MicrozooService[] {
        return this.puml.components
          .filter(component => component.type === ComponentType.SERVICE)
          .map(component => this.transformService(component));
    }

    private transformService(component: PumlComponent): MicrozooService {
        const note = this.notes[component.name];
        const upstreamLinks = this.upstreamLinks[component.name] || [];
        const downstreamLinks = this.downstreamLinks[component.name] || [];

        return {
            id: Mapper.toId(component.name),
            name: component.name,
            type: note.props["type"],
            config: note.props,
            interfaces: {
                ports: this.transformPorts(downstreamLinks),
                upstream: this.transformUpstreamInterfaces(upstreamLinks),
                database: this.transformDatabaseInterfaces(upstreamLinks)
            }
        };
    }

    private transformPorts(links: PumlLink[]): MicrozooPort[] {
        return links
          .filter(link => this.components[link.source].type === ComponentType.INTERFACE)
          .map(link => this.transformPort(link));
    }

    private transformPort(link: PumlLink): MicrozooPort {
        const port = this.components[link.source];
        const details = port.name.split(":").map(detail => detail.trim());
        return {
            name: port.name,
            targetPort: details[1],
            sourcePort: details[2],
            type: link.type
        };
    }

    private transformUpstreamInterfaces(links: PumlLink[]): MicrozooUpstreamInterface[] {
        return links
          .filter(link => this.components[link.target].type === ComponentType.SERVICE)
          .map(link => PumlTransformer.transformUpstreamInterface(link));
    }

    private static transformUpstreamInterface(link: PumlLink): MicrozooUpstreamInterface {
        return {
            service: link.target,
            type: link.type,
            name: "base"
        };
    }

    private transformDatabaseInterfaces(links: PumlLink[]): MicrozooDatabaseInterface {
        return links
          .filter(link => this.components[link.target].type === ComponentType.DATABASE)
          .map(link => PumlTransformer.transformDatabaseInterface(link))[0];
    }

    private static transformDatabaseInterface(link: PumlLink): MicrozooDatabaseInterface {
        return {
            database: link.target,
            type: link.type,
        };
    }

    private transformDatabases(): MicrozooDatabase[] {
        return this.puml.components
          .filter(component => component.type === ComponentType.DATABASE)
          .map(component => this.transformDatabase(component));
    }

    private transformDatabase(component: PumlComponent): MicrozooDatabase {
        const note = this.notes[component.name];
        const downstreamLinks = this.downstreamLinks[component.name] || [];

        return {
            id: Mapper.toId(component.name),
            name: component.name,
            type: note.props["type"],
            port: this.transformPorts(downstreamLinks)?.[0],
            config: note.props
        };
    }
}
