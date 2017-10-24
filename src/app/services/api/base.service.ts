import { Injectable, Inject,  } from '@angular/core';
import { Response } from '@angular/http';
import { Router } from '@angular/router-deprecated';
import { PopoverService } from '../popover-service/popover-service.service';
import { LocalStorageService } from '../index';


@Injectable()
export class BaseService {
	constructor (protected popoverService: PopoverService, protected router: Router, protected localStorageService:LocalStorageService) {

	};

	public showErrorBox (body = { details: null }) {
		if (body.details && body.details.length) {
			this.popoverService.showErrorBox(body.details.map(instance => instance.error));	
		} else {
			this.popoverService.showErrorBox([]);
		}
	}

	public error (error: Response) {
		let errorStatus = error && error.status;
		let body = error && error.text() && error.json(); // 

		switch (errorStatus) {
			case 500:
				// Unexpected server error
				this.showErrorBox();
				break;
			
			case 401: 
				// Unautorized
				if (this.router.root.currentInstruction && !this.localStorageService.getItem('lastUrl')) {
					this.localStorageService.setItem('lastUrl', JSON.stringify({
						route: this.router.root.currentInstruction.component.routeName,
						params: this.router.root.currentInstruction.component.params
					}));
				}


				this.popoverService.hidePopovers('all');
				this.router.navigate(['Signin']);

				break;

			case 400:
				// validation error in create load page
				if (this.router.root.currentInstruction.component.routeName == 'NewLoad') {
					throw error;
				} else {
					// Other cases with 400 error
					this.showErrorBox(body);
				}

				break;

			default:
				// other cases, FE App will expect array of error messages in details field.
				// otherwise it will show popup with text: `An unexpected error has occurred. If the problem persists please contact your system administrator`
				if (error.status > 400 && error.status < 500) {
					this.showErrorBox(body);	
				}

				break;
		};
	};
}