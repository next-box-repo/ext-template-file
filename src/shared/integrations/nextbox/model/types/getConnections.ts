export interface IConnection {
    id: number;
    name: string;
    create_date?: string;
    update_date?: string;
    login?: string;
    type?: string;
    address?: string;
    owner_id?: number;
}