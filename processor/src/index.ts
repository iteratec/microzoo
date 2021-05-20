import {DeployerFactory} from "./deployment/MicrozooDeployer";
import {Command, Option} from 'commander';
import {DockerComposeDeployer} from "./deployment/DockerComposeDeployer";
import deploy from "./action/deploy";

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

try {
    DeployerFactory.register("docker-compose", DockerComposeDeployer);
    start(process.argv);
}
catch(error) {
    console.log(error);
}
