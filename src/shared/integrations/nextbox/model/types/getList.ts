import { OrderDirection, StorageElementType } from 'next-box';

type GetListFilterType =
  | null
  | StorageElementType.Dir
  | StorageElementType.File;

export interface IGetListOptions {
  limit?: number;
  with_meta?: boolean;
  filter?: GetListFilterType;
  order_by?: string;
  order_direction?: OrderDirection;
  search?: string;
  exclude?: string;
  file_name_ext?: string[];
}
