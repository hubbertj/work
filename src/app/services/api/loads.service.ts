import { Injectable, Inject } from '@angular/core';
import { Headers, RequestOptions, Response } from '@angular/http';

import { HttpService } from '../http/http.service';

import { Filter } from '../../models/filter.model';
import { PopoverService } from '../popover-service/popover-service.service';
import { Router } from '@angular/router-deprecated';
import { LocalStorageService } from '../localstorage/localstorage.service';

import { BaseService } from './base.service';



@Injectable()
export class LoadsService extends BaseService {
	private loadsUrl = 'loads';
	private loadUrl = (loadId)=> 'loads/' + loadId;
	private cloneUrl = 'loads/clone';
	private getStopsUrl = (loadId)=> 'loads/' + loadId + '/stops';
	private getNotificationsUrl = (loadId)=> 'loads/' + loadId + '/notifications';
	private getMessagesUrl = (loadId)=> 'loads/' + loadId + '/messages';
	private changeOwnerShipUrl = (loadId)=> 'loads/' + loadId + '/changeownership';
	private getShareLinkUrl = (loadId)=> 'loads/' + loadId + '/share';
	private getBreadcrumbsUrl = (loadId) => 'loads/' + loadId + '/breadcrumbs';
	private getTenderingCarriersUrl = (loadId) => 'loads/' + loadId + '/carriertendering';
	private getTenderingBrokersUrl = (loadId) => 'loads/' + loadId + '/brokertendering';
	private loadSummaryUrl = (loadId)=>'loads/' + loadId + '/summary';

	constructor (private httpService:HttpService, protected popoverService: PopoverService, protected router: Router, protected localStorageService: LocalStorageService) {
		super(popoverService, router, localStorageService);
	};

	public updateTenderingBroker (carriers, loadId) {
		let body = JSON.stringify(carriers.map((carrier)=>({
            id: carrier.id,
            carrierCode: carrier.code,
			assignmentStatus: carrier.assignmentStatus
		})));

		return this.httpService
			.put(this.getTenderingBrokersUrl(loadId), body)
			.toPromise()
			.catch(this.error.bind(this));
	}

	public updateTenderingCarrier (drivers, loadId) {
		let body = JSON.stringify(drivers.map((driver)=>({
			id: driver.id,
			assignmentStatus: driver.assignmentStatus
		})));
		
		return this.httpService
			.put(this.getTenderingCarriersUrl(loadId), body)
			.toPromise()
			.catch(this.error.bind(this));
	};

	public getBreadcrumbs (loadId) {
		return this.httpService
			.get(this.getBreadcrumbsUrl(loadId))
			.toPromise()
			.catch(this.error.bind(this));
	};

	public getMessages (loadId) {
		return this.httpService
			.get(this.getMessagesUrl(loadId))
			.toPromise()
			.catch(this.error.bind(this));
	};

	public saveNotifications (loadId, notifications) {
		let body = JSON.stringify(notifications);

		return this.httpService
			.put(this.getNotificationsUrl(loadId), body)
			.toPromise()
			.catch(this.error.bind(this));
	};

	public shareLink (loadId, info) {
		let body = JSON.stringify(info);

		return this.httpService
			.put(this.getShareLinkUrl(loadId), body)
			.toPromise()
			.catch(this.error.bind(this));
	};

	public getNotifications (loadId) {
		return this.httpService
			.get(this.getNotificationsUrl(loadId))
			.toPromise()
			.catch(this.error.bind(this));
	}

	public getShareLink (loadId) {
		return  this.httpService
			.get(this.getShareLinkUrl(loadId))
			.toPromise()
			.catch(this.error.bind(this));
	};

	public deleteLoad (loadId) {
		return this.httpService
			.delete(this.loadUrl(loadId))
			.toPromise()
			.catch(this.error.bind(this));
	};

    public getLoad(loadId, divisionId) {
		return this.httpService
            .get(this.loadUrl(loadId) + '?division=' + divisionId)
			.toPromise()
			.catch(this.error.bind(this));
	};

    public getLoadSummary(loadId, divisionId) {
		return this.httpService
            .get(this.loadSummaryUrl(loadId) + '?division=' + divisionId)
			.toPromise()
			.catch(this.error.bind(this));
	};

	public getStops(loadId, filters){

	let filtersStr = '?division=' + filters.divisionId;

	if (filters.status) {
		filtersStr += '&status=' + filters.status;
	}

	if (filters.shippingDatesRange) {
		filtersStr += '&shippingDatesRange=' + filters.shippingDatesRange;
	}

	if (filters.deliveryDatesRange) {
		filtersStr += '&deliveryDatesRange=' + filters.deliveryDatesRange;
	}

	return this.httpService
		.get(this.getStopsUrl(loadId + filtersStr))
		.toPromise()
		.catch(this.error.bind(this));
	};

	public createLoad (load) {
        let body = JSON.stringify(load);
		return this.httpService
			.post(this.loadsUrl, body)
			.toPromise()
			.catch(this.error.bind(this));
	}


	public clone (load) {
		let id = load.id;
		let body = JSON.stringify({
			load_id: id
		});

		return this.httpService
			.post(this.cloneUrl, body)
			.toPromise()
			.catch(this.error.bind(this));
	};

	public saveLoad (load) {
		let id = load.id;
        let body = JSON.stringify(load);
		return this.httpService
			.put(this.loadUrl(id), body)
			.toPromise()
			.catch(this.error.bind(this));
	};

	public moveLoad (divId, loadId) {
		let body = JSON.stringify({
			divisionId: divId
		});

		let id = loadId;

		return this.httpService
			.put(this.changeOwnerShipUrl(loadId), body)
			.toPromise()
			.catch(this.error.bind(this));
	};

	public get (divisionId, filters) : any {
		let filter = new Filter(filters);

		let body = JSON.stringify({
			division: divisionId
		});
		
		return this.httpService
			.get(this.loadsUrl + '?division=' + divisionId + filter.serialize())
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
