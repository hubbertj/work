import { Component, ViewChild, Renderer } from '@angular/core';
import {MODAL_DIRECTVES, BS_VIEW_PROVIDERS, DROPDOWN_DIRECTIVES} from 'ng2-bootstrap';

@Component({
    selector: 'transflo-help',
    template: require('./help.component.html'),
    directives: [MODAL_DIRECTVES, DROPDOWN_DIRECTIVES],
	viewProviders: [BS_VIEW_PROVIDERS]
})

export class HelpComponent {
	@ViewChild('serverModal') serverModal;

	constructor () {};

    public showModal() {
			this.serverModal.show();
	}
}
