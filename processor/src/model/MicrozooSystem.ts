export interface MicrozooService {
    name: string;
    type: string;
    config: {[key: string]: string};
    interfaces?: {
        upstream?: MicrozooUpstreamInterface[];
        database?: MicrozooDatabaseInterface
    }
}

export interface MicrozooUpstreamInterface {
    service: string;
    name: string;
    type: string;
}

export interface MicrozooDatabaseInterface {
    database: string;
    type: string;
}

export interface MicrozooDatabase {
    name: string;
    type: string;
    config: {[key: string]: string};
}

export interface MicrozooSystem {
    services: MicrozooService[];
    databases: MicrozooDatabase[];
}
