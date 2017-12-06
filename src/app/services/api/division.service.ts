import { Injectable, Inject } from '@angular/core';
import { Headers, RequestOptions, Response } from '@angular/http';
import { BaseService} from './base.service';


import { HttpService } from '../http/http.service';
import { PopoverService } from '../popover-service/popover-service.service';
import { Router } from '@angular/router-deprecated';
import { LocalStorageService } from '../localstorage/localstorage.service';




@Injectable()
export class DivisionService extends BaseService {
	private divisionUrl = 'divisions';
	private attributesUrl = 'loadattributes';
	private permissionUrl = 'permissionuser';

	constructor (private httpService:HttpService, protected popoverService: PopoverService, protected router: Router, protected localStorageService: LocalStorageService) {
		super(popoverService, router, localStorageService);
	};

	public getPermissions (email) {
		let body = JSON.stringify({
			email: email
		});

		return this.httpService
			.post(this.permissionUrl + '/' + 'get', body)
			.toPromise()
			.catch(this.error);
	};

	public addUserPermission (id: number, company: string, firstName: string, lastName: string, email: string, password: string) {
		let body = JSON.stringify({
			id: id,
			company: company,
			firstName: firstName,
			lastName: lastName,
			email: email,
			password: password
		});

		return this.httpService
			.post(this.permissionUrl + '/' + 'post', body)
			.toPromise()
			.catch(this.error);
	};

	public getBrokers (divisionId) {
		return this.httpService
			.get(this.divisionUrl + '/' + divisionId + '/brokers/')
			.toPromise()
			.catch(this.error);
	};

	public getMessages (divisionId) {
		return this.httpService
			.get(this.divisionUrl + '/' + divisionId + '/messages/summary/')
			.toPromise()
			.catch(this.error.bind(this));
	};

	public sendNotifications (divisionId, driversIds, message) {
		let body = JSON.stringify({
			toIds: driversIds,
			message: message.message,
			title: message.title,
			type: message.type,
			random: +(Math.random() * 1000)
		});

		return this.httpService
			.post(this.divisionUrl + '/' + divisionId + '/notifications/', body)
			.toPromise()
			.catch(this.error.bind(this));
	}

	public sendMessages (divisionId, driverIds, message) {
		let body = JSON.stringify({
			toIds: driverIds,
			message: message,
			random: +(Math.random() * 1000)
		});

		return this.httpService
			.post(this.divisionUrl + '/' + divisionId + '/messages/', body)
			.toPromise()
			.catch(this.error.bind(this));
	};

	public getNotifications (divisionId, driverId) {
		return this.httpService
			.get(this.divisionUrl + '/' + divisionId + '/notifications?driver=' + driverId)
			.toPromise()
			.catch(this.error.bind(this));
	};

	public getMessagesDriver (divisionId, driverId, quantity, lastId, firstId) {
		let url;

		if (firstId) {
			url = this.divisionUrl + '/' + divisionId + '/messages/forward?driver=' + driverId + '&quantity=' + quantity;
			url += '&messageId=' + firstId;

		} else {
			url = this.divisionUrl + '/' + divisionId + '/messages/backward?driver=' + driverId + '&quantity=' + quantity;
		}

		if (lastId) {
			url += '&messageId=' + lastId;
		};


		return this.httpService
			.get(url)
			.toPromise()
			.catch(this.error.bind(this)); 
	};

	public getAttributes (divisionId) {
		return this.httpService
			.get(this.attributesUrl)
			.toPromise()
			.catch(this.error.bind(this));
	};


	public getCarriers (divisionId) {
		return this.httpService
			.get(this.divisionUrl + '/' + divisionId + '/carriers/')
			.toPromise()
			.catch(this.error.bind(this));
	};

	public getDrivers (divisionId, filters) : any {
		return this.httpService
			.get(this.divisionUrl + '/' + divisionId + '/drivers/')
			.toPromise()
			.catch(this.error.bind(this));
	};

	public getDriver (divisionId, driverId) {
		return this.httpService
			.get(this.divisionUrl + '/' + divisionId + '/drivers/' + driverId)
			.toPromise()
			.catch(this.error.bind(this));
	};

	public setAsFavorite (divisionId, relationId, isFavorite) {
		let body = JSON.stringify({
			relationId: relationId,
			isFavorite: isFavorite
		});
		
		return this.httpService
			.put(this.divisionUrl + '/' + divisionId + '/favorites', body)
			.toPromise()
			.catch(this.error.bind(this));
	};

	public getAddresses (divisionId, searchString, lastId) {
		let addition = '';
		
		if (lastId !== null) {
 			addition = '&lastId=' + lastId;
 		}

		if (searchString) {
			addition += '&address_entry=' + searchString;
		};

		return this.httpService
			.get(this.divisionUrl + '/' + divisionId + '/addresses?quantity=10' + addition)
			.toPromise()
			.catch(this.error.bind(this));
	};
    
    //override
	public error (error: Response) {
		super.error(error);
		let errorStatus = error && error.status;
		if(errorStatus == 401){
			this.httpService.token = '';
			this.router.navigate(['Signin']);
		}
	};
}
