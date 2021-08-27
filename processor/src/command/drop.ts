import {DeployerFactory, MicrozooDeployer} from "../deployment/MicrozooDeployer";

export async function doDrop(source: string, sourceFolder: string, target: string): Promise<MicrozooDeployer> {
    const deployer = DeployerFactory.get(target);
    const success = await deployer.drop();
    console.log(`- Drop ${success ? "succeeded" : "failed"}`);
    return deployer;
}

export default async function drop(source: string, sourceFolder: string, target: string): Promise<void> {
    await doDrop(source, sourceFolder, target);
}
