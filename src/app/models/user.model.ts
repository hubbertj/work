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
		this.brokerSettings = [];
		if (object.divisions && object.divisions.length) {
			this.divisions = object.divisions.map((div) => new Division(div));	
		}
	};
	email: string;
	firstname: string;
	lastname: string;
	id: number;
	isVelocity: boolean;
	menu: Array<any> = [];
	divisions: Array<Division>;
	brokerSettings: Array<BrokerSettings> = [];
}