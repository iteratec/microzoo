import {MicrozooDeployer} from "../deployment/MicrozooDeployer";
import {doCompile} from "./compile";

export async function doTest(source: string, sourceFolder: string, target: string): Promise<MicrozooDeployer> {
    let deployer = await doCompile(source, sourceFolder, target)
    let success = await deployer.test();
    console.log(`- Test ${success ? "succeeded" : "failed"}`);
    return deployer;
}

export default async function test(source: string, sourceFolder: string, target: string): Promise<void> {
    await doTest(source, sourceFolder, target);
}
