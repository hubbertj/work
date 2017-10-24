import { Component, ViewChild, Renderer } from '@angular/core';
import {MODAL_DIRECTVES, BS_VIEW_PROVIDERS, DROPDOWN_DIRECTIVES} from 'ng2-bootstrap';

@Component({
    selector: 'transflo-about',
    template: require('./about.component.html'),
    directives: [MODAL_DIRECTVES, DROPDOWN_DIRECTIVES],
	viewProviders: [BS_VIEW_PROVIDERS]
})

export class AboutComponent {
	@ViewChild('serverModal') serverModal;
    public appVersion: string;
	constructor () {};

    public showModal(version: string) {
        this.appVersion = version;
			this.serverModal.show();
	}
}
