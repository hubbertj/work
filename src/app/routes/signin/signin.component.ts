import { Component, ViewChild } from '@angular/core';
import { UserService } from '../../services/index';
import { ROUTER_DIRECTIVES, Router } from '@angular/router-deprecated';
import { EULAComponent } from '../../components/index';
import 'rxjs/add/operator/finally';

@Component({
    selector: 'signin',
    template: require('./signin.component.html'),
    directives: [ROUTER_DIRECTIVES, EULAComponent]
})

export class SigninComponent {
    @ViewChild(EULAComponent) eulaMsg: EULAComponent; 
	private login: string;
	private password: string;
	public error = false;
	public restoreShown = false;
	public email = '';
	public loading = false;

	constructor(private userService:UserService, private router: Router) {};

	private handleError (error) {
		if (error.status && error.status == 302) {
			let data = error.json();

			this.email = data.email;
			this.restoreShown = true;
		} else {
			this.error = true;	
		}

		this.toggleLoading();
	};
	
	private toggleLoading (){
		this.loading = !this.loading;
	};

    showEULA() {
        this.eulaMsg.showModal();
    }

	signin (login, pass) {
		this.restoreShown = false;
		this.error = false;
		this.toggleLoading();

		this.userService
			.signIn(login, pass)
			.then(((result)=>{
				this.error = false;	
				this.restoreShown = false;	
				this.userService.responseParser.apply(this.userService, [result]);	
				this.toggleLoading();
			}).bind(this))
			.catch(this.handleError.bind(this));
	};
}
