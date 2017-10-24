import { Component, OnInit } from '@angular/core';
import { RouteParams } from '@angular/router-deprecated';
import { UserService } from '../../services';


@Component({
	selector: 'reset',
	template: require('./reset.component.html'),
})

export class ResetComponent {
	private passToken;
	private password1;
	private password2;

	private error = '';

	public constructor (private routeParams: RouteParams, private userService: UserService) {

	}

	public ngOnInit () {
		this.passToken = this.routeParams.params['passtoken'];
	};

	public errorHandler (res) {
		this.error = res.text();
	};

	public reset () {
		this.error = '';

		if (this.password1 == this.password2 && this.password1) {
			this.userService
				.resetPassword(this.password1, this.passToken)
				.catch(this.errorHandler.bind(this));
		} else {
			if (this.password1) {
				this.error = 'Passwords do not match';
			} else {
				this.error = 'Password can`t be empty';	
			}
		}
	};
}
