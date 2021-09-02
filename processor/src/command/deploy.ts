import {MicrozooDeployer} from "../deployment/MicrozooDeployer";
import {doCompile} from "./compile";

export async function doDeploy(source: string, sourceFolder: string, target: string): Promise<MicrozooDeployer> {
    let deployer = await doCompile(source, sourceFolder, target)
    let success = await deployer.deploy();
    console.log(`- Deployment ${success ? "succeeded" : "failed"}`);
    return deployer;
}

export default async function deploy(source: string, sourceFolder: string, target: string): Promise<void> {
    await doDeploy(source, sourceFolder, target);
}
