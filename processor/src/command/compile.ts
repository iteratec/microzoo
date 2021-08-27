const path = require('path');
const PlantUmlToJson = require('puml2json');

import PumlValidator from "../validation/PumlValidator";
import PumlTransformer from "../transformation/PumlTransformer";
import MicrozooValidator from "../validation/MicrozooValidator";
import {DeployerFactory, MicrozooDeployer} from "../deployment/MicrozooDeployer";
import {ManifestRegistry} from "../manifest/ManifestRegistry";

function getFilePath(sourceFolder: string, source: string): string {
    if (!source.match(/.*\.puml/)) {
        source += ".puml";
    }

    return path.join(sourceFolder, source);
}

export async function doCompile(source: string, sourceFolder: string, target: string): Promise<MicrozooDeployer>  {
    const filePath = getFilePath(sourceFolder, source);
    const converter = PlantUmlToJson.fromFile(filePath);
    const pumlSystem = await converter.generate();
    console.log(`- Parsing puml file '${filePath}' succeeded`);
    let success = new PumlValidator(pumlSystem).validate();
    console.log(`- Validating dependencies ${success ? "succeeded" : "failed"}`);
    const microzooSystem = new PumlTransformer(source, pumlSystem).transform();
    const manifestRegistry = new ManifestRegistry();
    console.log(`- Loading manifests succeeded`);
    success = new MicrozooValidator(manifestRegistry, microzooSystem).validate();
    console.log(`- Validating configs ${success ? "succeeded" : "failed"}`);
    const deployer = DeployerFactory.get(target, manifestRegistry, microzooSystem)
    success = await deployer.compile();
    console.log(`- Compiling orchestration ${success ? "succeeded" : "failed"}`);
    return deployer;
}

export default async function compile(source: string, sourceFolder: string, target: string): Promise<void>  {
    await doCompile(source, sourceFolder, target);
}
