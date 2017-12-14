import { Division } from './division.model';
import { BrokerSettings } from './BrokerSettings.model';

export class User {
	constructor (object) {
		this.email = object.email;
		this.firstname = object.firstName;
		this.lastname = object.lastName;
		this.id = object.id;
		this.menu = object.menu;
		this.isVelocity = object.isVelocity;
		this.isPermissionUser = object.isPermissionUser;
		this.brokerSettings = [];
		if (object.divisions && object.divisions.length) {
			this.divisions = object.divisions.map((div) => new Division(div));	
		};
	};
	email: string;
	firstname: string;
	lastname: string;
	id: number;
	isPermissionUser: boolean;
	isVelocity: boolean;
	menu: Array<any> = [];
	divisions: Array<Division>;
	brokerSettings: Array<BrokerSettings> = [];
	
	public getIsCarrier (divisionId){
		let carrier = this.getCarrier(divisionId);
		return (carrier) ? carrier.type.toLowerCase() === 'carrier' : false;
	};
	
	public getIsCommonCarrier (divisionId){
		let carrier = this.getCarrier(divisionId);
		return (carrier) ? carrier.isCommonCarrier : false;
	};

	public getCarrier (divisionId){
		return (this.divisions) ? this.divisions.find((div) => {
			return div.id === +divisionId
		}) : null;
	}
}