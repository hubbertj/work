import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-customer-access-management',
  template: require('./customer-access-management.component.html')
})


export class CustomerAccessManagementComponent implements OnInit {
	private users: Array<any> = [];
	private filteredUsers: Array<any> = [];
	private filterStr: string;

  constructor() { }

  /**
   * Standard init fucntion
   */
  ngOnInit() {

  	//fake data;
  	this.users.push({
  		company: 'Allison Shipping',
  		firstName: 'Allison',
  		lastName: 'Fentriss',
  		email: 'allison@amfshipping.com',
  		fleet: [{
  			name: 'Fleet A',
  			checked: true,
  			attribute: 'asd asd',
  			bol: 'bool',
  			state: 'tx'
  		},
  		{
  			name: 'Fleet B',
  			checked: false,
  			attribute: 'asd asd',
  			bol: 'bool',
  			state: 'tx'
  		}]
  	});

  	this.users.push({
  		company: "Bod's Shipping",
  		firstName: 'Bob',
  		lastName: 'Somebody',
  		email: 'bob@somewhere.com',
  		fleet: [{
  			name: 'Fleet C',
  			checked: true,
  			attribute: 'asd asd',
  			bol: 'bool',
  			state: 'tx'
  		},
  		{
  			name: 'Fleet D',
  			checked: false,
  			attribute: 'asd asd',
  			bol: 'bool',
  			state: 'tx'
  		}]
  	});

  	this.users.push({
  		company: '3PL Mangement',
  		firstName: 'Able',
  		lastName: 'Body',
  		email: 'ablebody@3plmanagement.com',
  		fleet: [{
  			name: 'Fleet E',
  			checked: true,
  			attribute: 'asd asd',
  			bol: 'bool',
  			state: 'tx'
  		},
  		{
  			name: 'Fleet F',
  			checked: false,
  			attribute: 'asd asd',
  			bol: 'bool',
  			state: 'tx'
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
   * funtion which is call when the form is submitted
   */
  private onSubmit(){
  	console.log(arguments);
  	return false;
  };

}
