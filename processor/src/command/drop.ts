import {MicrozooDeployer} from "../deployment/MicrozooDeployer";
import {doCompile} from "./compile";

export async function doDrop(source: string, sourceFolder: string, target: string): Promise<MicrozooDeployer> {
    let deployer = await doCompile(source, sourceFolder, target)
    const success = await deployer.drop();
    console.log(`- Drop ${success ? "succeeded" : "failed"}`);
    return deployer;
}

export default async function drop(source: string, sourceFolder: string, target: string): Promise<void> {
    await doDrop(source, sourceFolder, target);
}
