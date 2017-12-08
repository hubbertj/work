import { Permission } from './permission.model';

export class Fleet {
    constructor() {
        this.FleetName = "Fleet";
        this.fleetId = -1;
        this.Permissions = []
    };
    FleetName: string;
    fleetId: number;
    Permissions: Array<Permission>
}