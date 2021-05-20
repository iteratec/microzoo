const path = require('path');
const PlantUmlToJson = require('puml2json');
import PumlValidator from "../validation/PumlValidator";
import PumlTransformer from "../transformation/PumlTransformer";
import MicrozooValidator from "../validation/MicrozooValidator";
import {DeployerFactory} from "../deployment/MicrozooDeployer";

function getFilePath(sourceFolder: string, source: string): string {
    if (!source.match(/.*\.puml/)) {
        source += ".puml";
    }

    return path.join(sourceFolder, source);
}

export default async function deploy(source, sourceFolder, target) {
    const filePath = getFilePath(sourceFolder, source);
    const converter = PlantUmlToJson.fromFile(filePath);
    const pumlSystem = await converter.generate();
    console.log(`- Parsing puml file '${filePath}' succeeded`);
    let success = new PumlValidator(pumlSystem).validate();
    console.log(`- Formal Validation ${success ? "succeeded" : "failed"}`);
    const microzooSystem = new PumlTransformer(pumlSystem).transform();
    console.log(`- Transformation ${success ? "succeeded" : "failed"}`);
    success = new MicrozooValidator(microzooSystem).validate();
    console.log(`- Semantic Validation ${success ? "succeeded" : "failed"}`);
    success = DeployerFactory.get(target, microzooSystem).deploy();
    console.log(`- Deployment ${success ? "succeeded" : "failed"}`);
}
