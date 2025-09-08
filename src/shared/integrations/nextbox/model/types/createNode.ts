import { StorageElementType } from "next-box";

type CreatableNodeType = StorageElementType.Dir | StorageElementType.File

export interface ICreateNode {
    path: string;
    name: string;
    type: CreatableNodeType;
}

export interface ICreateNodeOptions {
    force?: boolean;
}