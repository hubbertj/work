import { Component } from '@angular/core';
import { LocalStorageService } from '../../services/index';


@Component({
	selector: 'error',
	template: require('./error.component.html'),
})

export class ErrorComponent {
	private text = 'Client error occured';
	
	constructor (
		private localStorageService: LocalStorageService
	) {};


	ngOnInit () {
		let text = this.localStorageService.getItem('errorText');

		try {
			text = JSON.parse(text).errorMessage;
		} catch(e) {

		} finally {
			this.text && (this.text = text);
		}

		this.localStorageService.clearItem('errorText');
	};
}
