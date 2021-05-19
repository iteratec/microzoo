import {PumlComponent, PumlSystem} from "../model/PumlSystem";

export default class PumlValidator {
    private components: {[name: string]: PumlComponent} = {};

    public constructor(private system: PumlSystem) {
        system.components.forEach(component => this.components[component.name] = component);
    }

    public validate(): boolean {
        if (Object.keys(this.components).length !== this.system.components.length) {
            return false;
        }

        return this.validateRefs();
    }

    private validateRefs(): boolean {
        return this.validateNoteRefs() && this.validateLinkRefs();
    }

    private validateNoteRefs(): boolean {
        return this.system.notes.every(note => this.components[note.ref]);
    }

    private validateLinkRefs(): boolean {
        return this.system.links.every(link => this.components[link.source] && this.components[link.target]);
    }
}
