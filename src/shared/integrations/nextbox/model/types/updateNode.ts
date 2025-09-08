export interface IUpdateNode {
    fullPath: string;
    data: unknown;
}

export interface IUpdateNodeOptions {
    writeAsJSON?: boolean;
    normalizePath?: boolean;
}