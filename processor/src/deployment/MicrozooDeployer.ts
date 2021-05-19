import {MicrozooSystem} from "../model/MicrozooSystem";

export interface MicrozooDeployer {
    deploy(): boolean;
}

interface MicrozooSystemConstrutable {
    new(microzooSystem: MicrozooSystem): MicrozooDeployer;
}

export class DeployerFactory {
    protected static deployers: {[target: string]: (microzoosystem: MicrozooSystem) =>  MicrozooDeployer} = {};

    public static register<T extends MicrozooDeployer>(target: string, type: MicrozooSystemConstrutable) {
        DeployerFactory.deployers[target] = (microzoosystem => new type(microzoosystem));
    }

    public static get(target: string, microzooSystem: MicrozooSystem): MicrozooDeployer {
        return DeployerFactory.deployers[target]?.(microzooSystem);
    }
}
