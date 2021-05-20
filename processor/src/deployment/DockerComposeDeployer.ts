import * as fs from "fs";

import {MicrozooDeployer} from "./MicrozooDeployer";
import {MicrozooSystem} from "../model/MicrozooSystem";
const Handlebars = require("handlebars");

export class DockerComposeDeployer implements MicrozooDeployer {
    private template;

    public constructor(private microzooSystem: MicrozooSystem) {
        const templateRaw = fs.readFileSync("./src/deployment/template/compose.hbs").toString();
        console.log(templateRaw);
        this.template = Handlebars.compile(templateRaw);
    }

    public deploy(): boolean {
        console.log("Deploying...");
        console.log(this.template({message: "world"}));
        return true;
    }
}
