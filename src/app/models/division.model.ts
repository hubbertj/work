import { Remittance } from './remittance.model';

export class Division {
	constructor (object) {
		this.id = object.id;
		this.code = object.code;
		this.type = object.type;
		this.name = object.name;
		this.menu = object.menu;
		this.isCarrier = this.type ? object.type.toLowerCase() === 'carrier' : false;
        this.isCommonCarrier = object.isCommonCarrier;
		this.isFavorite = object.isFavorite;
		if (object.remittanceData)
			this.remittance = new Remittance(object.remittanceData);
	};
	id: number;
	menu: Array<any>;
	code: string;
	type: string;
    name: string;
    isCarrier: boolean;
    isCommonCarrier: boolean;
	isFavorite: boolean;
	remittance: Remittance;
}