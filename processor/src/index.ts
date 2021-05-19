import {DeployerFactory} from "./deployment/MicrozooDeployer";

const PlantUmlToJson = require('puml2json');
const path = require('path');

import {Command, Option} from 'commander';

import PumlValidator from "./validation/PumlValidator";
import PumlTransformer from "./transformation/PumlTransformer";
import MicrozooValidator from "./validation/MicrozooValidator";
import {DockerComposeDeployer} from "./deployment/DockerComposeDeployer";

function start(argv) {
    const program = new Command();
    program
      .version('0.9.0', '-v, --version', 'output the current version')
      .option('-s, --source-folder <folder>', 'set the source folder', '../scenarios')
      .addOption(new Option('-t, --target <type>', 'set the target system')
        .choices(["docker-compose", "kubernetes"]).default('docker-compose'))
      .command('deploy <source>')
      .description('deploys and runs a puml specification')
      .action((source, options) => {
          const sourceFolder = options.sourceFolder || program.opts().sourceFolder;
          const target = options.target || program.opts().target;
          deploy(source, sourceFolder, target)
            .catch(reason => console.log(reason));
      });
    program.parse(argv);
}

async function deploy(source, sourceFolder, target) {
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

function getFilePath(sourceFolder: string, source: string): string {
    if (!source.match(/.*\.puml/)) {
        source += ".puml";
    }

    return path.join(sourceFolder, source);
}

try {
    DeployerFactory.register("docker-compose", DockerComposeDeployer);
    start(process.argv);
}
catch(error) {
    console.log(error);
}
