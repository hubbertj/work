import { Component } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { ROUTER_DIRECTIVES, Router } from '@angular/router-deprecated';

@Component({
    selector: 'restore',
    template: require('./restore.component.html'),
    directives: [ROUTER_DIRECTIVES]
})

export class RestoreComponent {
	public sent = false;
	public error = '';
	public email: string;

	public restore() {
		this.userService.restore(this.email).then(()=>{
			this.sent = true;
		})
		.catch(this.errorHandler.bind(this));
	};

	public errorHandler (err) {
		this.error = err.text();
	};	

	constructor (private userService: UserService) {};

}
