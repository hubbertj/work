import { Permission } from './permission.model';

export class Fleet {
    constructor() {
        this.fleetName = "Fleet";
        this.fleetId = -1;
        this.permissions = [];
    };
    fleetName: string;
    fleetId: number;
    permissions: Array<Permission>
    errorMessage: string;
}