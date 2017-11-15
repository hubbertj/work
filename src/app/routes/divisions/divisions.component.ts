import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router-deprecated';

import { UserService } from '../../services';


@Component({
	selector: 'divisions',
	template: ''
})

export class DivisionsComponent implements OnInit {
	constructor (
		private userService:UserService,
		private router:Router
	) {};

	ngOnInit () {
		this.userService.getUser((user)=>{
			this.router.navigate(['Home', { divId: user.divisions[0].id}]);
		})
	};	
}
