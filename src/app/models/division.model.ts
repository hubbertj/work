export class Division {
	constructor (object) {
		this.id = object.id;
		this.code = object.code;
		this.type = object.type;
		this.name = object.name;
        this.menu = object.menu;
        this.isCommonCarrier = object.isCommonCarrier;
        this.isFavorite = object.isFavorite;
	};
	id: number;
	menu: Array<any>;
	code: string;
	type: string;
    name: string;
    isCommonCarrier: boolean;
    isFavorite: boolean;
}