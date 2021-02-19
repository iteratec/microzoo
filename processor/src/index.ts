import {PlantUmlToJson} from 'puml2json';

async function main() {
    const converter = PlantUmlToJson.fromFile("../scenarios/simple.puml");
    const system = await converter.generate();
    console.log(JSON.stringify(system));
}

main().catch(reason => console.log(reason));
