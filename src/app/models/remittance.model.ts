export class Remittance {
	constructor (object) {
        this.id = object.id;
        this.carrierId = object.carrierId;
        this.carrierName = object.carrierName;
        this.contactName = object.contactName;
        this.contactPhone = object.contactPhoneNumber;
        this.name = object.name;
        this.address1 = object.addressLine1;
        this.address2 = object.addressLine2;
        this.city = object.city;
        this.state = object.state;
        this.zipCode = object.zipCode;
        this.noticeOfAssignmentLanguage = object.noticeOfAssignmentLanguage;
    };
    id: number;
    carrierId: number;
    carrierName: string;
    contactName: string;
    contactPhone: string;
    name: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zipCode: string;
    noticeOfAssignmentLanguage: string;
}