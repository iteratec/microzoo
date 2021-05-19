import {MicrozooDeployer} from "./MicrozooDeployer";
import {MicrozooSystem} from "../model/MicrozooSystem";

export class DockerComposeDeployer implements MicrozooDeployer {
    public constructor(private microzooSystem: MicrozooSystem) {
        console.log("Deploying...");
    }

    public deploy(): boolean {
        return true;
    }
}
