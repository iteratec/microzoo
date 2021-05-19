import {PumlComponent, PumlLink, PumlNote, PumlSystem} from "../model/PumlSystem";
import {
    MicrozooDatabase,
    MicrozooDatabaseInterface,
    MicrozooService,
    MicrozooSystem,
    MicrozooUpstreamInterface
} from "../model/MicrozooSystem";
import {ComponentType} from "../model/Types";

export default class PumlTransformer {
    private components: {[name: string]: PumlComponent} = {}
    private notes: {[ref: string]: PumlNote} = {}
    private links: {[source: string]: PumlLink[]} = {}

    constructor(private puml: PumlSystem) {
        puml.components.forEach(component => this.components[component.name] = component);
        puml.notes.forEach(note => this.notes[note.ref] = note);
        puml.links.forEach(link => this.addLink(link));
    }

    private addLink(link: PumlLink): void {
        const links = this.links[link.source];

        if (!links) {
            this.links[link.source] = [link]
        }
        else {
            links.push(link);
        }
    }

    public transform(): MicrozooSystem {
        return {
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
        const links = this.links[component.name] || [];

        return {
            name: component.name,
            type: note.props["type"],
            config: note.props,
            interfaces: {
                upstream: this.transformUpstreamInterfaces(links),
                database: this.transformDatabaseInterfaces(links)
            }
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

        return {
            name: component.name,
            type: note.props["type"],
            config: note.props
        };
    }
}
