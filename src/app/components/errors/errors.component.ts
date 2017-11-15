import { Component, ViewChild, Renderer } from '@angular/core';
import { PopoverService } from '../../services/index';
import {MODAL_DIRECTVES, BS_VIEW_PROVIDERS, DROPDOWN_DIRECTIVES} from 'ng2-bootstrap';

@Component({
    selector: 'transflo-errors',
    template: require('./errors.component.html'),
    directives: [MODAL_DIRECTVES, DROPDOWN_DIRECTIVES],
	viewProviders: [BS_VIEW_PROVIDERS]
})

export class ErrorsComponent {
	@ViewChild('serverModal') serverModal;
	@ViewChild('errorsListModal') errorsListModal;

	public subscription;
	public text;
	public errors = [];

	constructor (private popoverService: PopoverService) {
		this.popoverService
			.eventShown
			.subscribe(this.showModal.bind(this));

		this.popoverService
			.eventShown
			.subscribe(this.showErrorBox.bind(this));

		this.popoverService
			.eventHidden
			.subscribe(this.closeModals.bind(this));
	};

	public closeModals () {
		this.serverModal.hide();
		this.errorsListModal.hide();
	}

	public showModal (values) {
		if (values.type == 'error') {
			this.serverModal.show();
			this.text = 'values.additional && values.additional.text';
		}
	}

	public showErrorBox (errorsListObject) {
		if (errorsListObject.type == 'errors_list') {
			if (errorsListObject.errors && errorsListObject.errors.length) {
				this.errors = errorsListObject.errors;
			} else {
				this.errors = ['An unexpected error has occurred. If the problem persists please contact your system administrator'];
			}

			this.errorsListModal.show();
		}
	}
}
