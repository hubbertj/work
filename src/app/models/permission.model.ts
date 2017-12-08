export class Permission {
    constructor() {
        this.id = null;
        this.type = 0;
        this.key = "";
        this.value = "";
        this.isEnabled = false;
        this.errorMessage = "";
    };
    id: number;
    type: number;
    key: string;
    value: string;
    isEnabled: boolean;
    errorMessage: string;
}