import {MicrozooSystem} from "../model/MicrozooSystem";
import {ManifestRegistry} from "../manifest/ManifestRegistry";

export default class MicrozooValidator {
    constructor(private manifestRegistry: ManifestRegistry, private system: MicrozooSystem) {
    }

    public validate(): boolean {
        return true;
    }

}
