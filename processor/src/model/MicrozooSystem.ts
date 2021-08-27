export interface MicrozooService {
    id: string;
    name: string;
    type: string;
    interfaces?: {
        upstream?: MicrozooUpstreamInterface[];
        database?: MicrozooDatabaseInterface;
        ports?: MicrozooPort[];
    }
    config: {[key: string]: string};
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
    id: string;
    name: string;
    type: string;
    port: MicrozooPort;
    config: {[key: string]: string};
}

export interface MicrozooPort {
    name: string;
    targetPort: string;
    sourcePort: string;
    type: string;
}

export interface MicrozooSystem {
    name: string;
    services: MicrozooService[];
    databases: MicrozooDatabase[];
}
