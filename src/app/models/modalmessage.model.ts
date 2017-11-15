export class ModalMessage {
	constructor (object) {
        if (object){
            this.header = object.header;
            this.message = object.code;
        };
	};
	header: string;
	message: string;
}