import { Injectable, Output, EventEmitter } from '@angular/core';

@Injectable()
export class PopoverService {
	@Output() eventShown = new EventEmitter();
	@Output() eventHidden = new EventEmitter();

	constructor () {};

	showPopover(type, divisionId, driverId, additional) {
		this.eventShown.emit({divisionId: divisionId, driverId: driverId, type: type, additional: additional});
	};

	hidePopovers (type) {
		this.eventHidden.emit(type);
	};

	showErrorBox (errorsList) {
		this.eventShown.emit({
			type: 'errors_list',
			errors: errorsList
		});
	};
}
