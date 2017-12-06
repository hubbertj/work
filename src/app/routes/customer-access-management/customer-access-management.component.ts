import { Component, OnInit, ViewChild, EventEmitter } from '@angular/core';
import { MODAL_DIRECTVES, BS_VIEW_PROVIDERS} from 'ng2-bootstrap';
import { DivisionService, UserService } from '../../services/index';

@Component({
  selector: 'app-customer-access-management',
  directives: [MODAL_DIRECTVES],
  viewProviders: [BS_VIEW_PROVIDERS],
  template: require('./customer-access-management.component.html'),
  providers: [ DivisionService, UserService ]
})


export class CustomerAccessManagementComponent implements OnInit {
	@ViewChild('addNewUserModal') addNewUserModal;

	private users: Array<any> = [];
	private filteredUsers: Array<any> = [];
	private filterStr: string;
	private emailSearchStr: string;
	private userTableData: Array<any> = [];
	private newUserData: any = {
		id: null,
		company: null,
		firstName: null,
		lastName: null,
		email: null,
		password: null
	};

	private loading: boolean = false;

	private alerts: Array<any> = [];

  constructor(
    private divisionService: DivisionService,
    private userService: UserService
  ) {};

  /**
   * Standard init fucntion
   */
  ngOnInit() {
     //the loading shoul be done with a observable.
  	this.loading = false;
  	this.users = [];
  	//fake data;
  	this.users.push({
  		company: 'Allison Shipping',
  		firstName: 'Allison',
  		lastName: 'Fentriss',
  		email: 'allison@amfshipping.com',
  		fleet: [{
  			name: 'Fleet A',
  			permissions:{
  				attribute: 'asd asd',
  				bol: 'bool',
  				state: '123'
  			},
  			delivery: {
  				state: 'state',
  				delivery: 'delivery',
  				states: 'tx;az;ny'
  			}
  		}]
  	});


  	this.users.push({
  		company: "Bod's Shipping",
  		firstName: 'Bob',
  		lastName: 'Somebody',
  		email: 'bob@somewhere.com',
  		fleet: [{
  			name: 'Fleet A',
  			permissions:{
  				attribute: 'asd asd',
  				bol: 'bool',
  				state: '123'
  			},
  			delivery: {
  				state: 'state',
  				delivery: 'delivery',
  				states: 'tx;az;ny'
  			}
  		}]
  	});

  	this.users.push({
  		company: '3PL Mangement',
  		firstName: 'Able',
  		lastName: 'Body',
  		email: 'ablebody@3plmanagement.com',
  		fleet: [{
  			name: 'Fleet A',
  			permissions:{
  				attribute: 'asd asd',
  				bol: 'bool',
  				state: '123'
  			},
  			delivery: {
  				state: 'state',
  				delivery: 'delivery',
  				states: 'tx;az;ny'
  			}
  		}]
  	});

  	this.filteredUsers = this.users;
  	
  };

  /**
   * using the passed in string to search thru our array
   * @param {string} val search String
   */
  private onFilter(val: string){
  	let filterArray: Array<any> = [];

  	if(typeof 'undefined' === val || !val || val === ''){
  		this.filteredUsers = this.users;
  		return false;
  	}

  	for(var user in this.users){
  		var jsonUser = JSON.stringify(this.users[user]);
  		if(jsonUser.search(val) > -1) filterArray.push(this.users[user]);
  	}

  	this.filteredUsers = filterArray;
  };

  /**
   * [onCloseNewUserModal description]
   */
  private onCloseNewUserModal(){
    this.clearForms();
    this.emailSearchStr = '';
  	
  	return false;
  };

  /**
   * [onEdit description]
   */
  private onEdit(){
  	console.log(arguments);
  };

  /**
   * [clearForms description]
   */
  private clearForms(){
  	this.alerts = [];
  	this.userTableData = [];
  	for(let x in this.newUserData){
  		this.newUserData[x] = null;
  	}
  };

  private removeAlert(index){
  	this.alerts.splice(index, 1);
  };

  /**
   * [onUserSeach description]
   */
  private onUserSeach(email: string){
  	this.clearForms();

    this.divisionService.getPermissions(email)
      .then((response) => {
         let code: number = (response === undefined || response.status === undefined || !response.status) ? 500 : response.status;
         switch(code){
           case 200:
             this.userTableData.push(response);
           break;
           case 400:
             this.alerts = [];
             this.alerts.push({
               message: 'Email is missing',
               class: 'alert-danger'
             });
           break;
           case 403:
             this.alerts = [];
             this.alerts.push({
               message: 'AdminUser is a common carrier or a valid AdminUser is attempting to add another AdminUser as a third party which is currently disallowed',
               class: 'alert-danger'
             });
           break;
           case 404:
             this.alerts = [];
             this.alerts.push({
               message: 'User was not found',
               class: 'alert-success'
              });
             this.newUserData.id = -1;
             this.newUserData.email = email;
           break;
           default:
             this.alerts = [];
             this.alerts.push({
               message: 'Unknown error',
               class: 'alert-danger'
            });
           break;
        };
      });
      return false;
    };

  /**
   * [onAddSearchUser description]
   * @param {[type]} users [description]
   */
  private onAddUserPermission(aUser){
    let user: any = (aUser instanceof Array && aUser.length > 0) ? aUser[0] : aUser;
    this.divisionService.addUserPermission(null, user.company, user.firstName, user.lastName, user.email, user.password)
      .then((response) => {
        let code: number = (response === undefined || response.status === undefined || !response.status) ? 500 : response.status;
        switch(code){
           case 200:
             this.ngOnInit();
             this.onCloseNewUserModal();
             this.addNewUserModal.hide();
             break;
           case 400:
             this.alerts = [];
             this.alerts.push({
               message: 'Required field was missing in request',
               class: 'alert-danger'
             });
           break;
           case 403:
             this.alerts = [];
             this.alerts.push({
               message: 'AdminUser is a common carrier or a valid AdminUser is attempting to add another AdminUser as a third party which is currently disallowed',
               class: 'alert-danger'
             });
           break;
           case 409:
             this.alerts = [];
             this.alerts.push({
               message: 'The user already exists',
               class: 'alert-success'
              });
           break;
           default:
             this.alerts = [];
             this.alerts.push({
               message: 'Unknown error',
               class: 'alert-danger'
            });
           break;
        }
      });
  	return false;
  };

  /**
   * funtion which is call when the form is submitted
   */
  private onSubmit(){
  	console.log(arguments);
  	return false;
  };

}
