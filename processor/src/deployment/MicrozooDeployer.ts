import {MicrozooSystem} from "../model/MicrozooSystem";
import {ManifestRegistry} from "../manifest/ManifestRegistry";

export interface MicrozooDeployer {
    compile(): Promise<boolean>;
    deploy(): Promise<boolean>;
    drop(): Promise<boolean>;
    test(): Promise<boolean>;
}

interface MicrozooSystemConstructable {
    new(manifestRegistry: ManifestRegistry, microzooSystem: MicrozooSystem): MicrozooDeployer;
}

export class DeployerFactory {
    protected static deployers: {[target: string]: (manifestRegistry: ManifestRegistry, microzoosystem: MicrozooSystem) =>  MicrozooDeployer} = {};

    public static register<T extends MicrozooDeployer>(target: string, type: MicrozooSystemConstructable) {
        DeployerFactory.deployers[target] = (manifestRegistry, microzoosystem) => new type(manifestRegistry, microzoosystem);
    }

    public static get(target: string, manifestRegistry?: ManifestRegistry, microzooSystem?: MicrozooSystem): MicrozooDeployer {
        return DeployerFactory.deployers[target]?.(manifestRegistry, microzooSystem);
    }
}
