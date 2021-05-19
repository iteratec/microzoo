import {ComponentType} from './Types';

export interface PumlComponent {
    name: string;
    type: ComponentType;
}

export interface PumlNote {
    ref: string;
    props: {[prop: string]: string};
}

export interface PumlLink {
    source: string;
    target: string;
    type: string;
}

export interface PumlSystem {
    components: PumlComponent[];
    notes: PumlNote[];
    links: PumlLink[];
}
