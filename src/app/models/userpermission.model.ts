import { Fleet } from './fleet.model';

export class UserPermission {
    constructor() {
        this.id = -1;
        this.email = "";
        this.firstName = "";
        this.lastName = "";
        this.company = "";
        this.isAssociated = false;
        this.fleets = [];
    };
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    company: string;
    isAssociated: boolean;
    fleets: Array < Fleet >
}
