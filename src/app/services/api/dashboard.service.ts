import { Injectable, Inject  } from '@angular/core';
import { Headers, RequestOptions, Response } from '@angular/http';

import { HttpService } from '../http/http.service';
import { PopoverService } from '../popover-service/popover-service.service';
import { Router } from '@angular/router-deprecated';
import { BaseService} from './base.service';
import { LocalStorageService } from '../localstorage/localstorage.service';




@Injectable()
export class DashboardService extends BaseService {
	private authUrl = 'auth';
	private statisticsUrl = 'statistics';
	private mappointsUrl = 'mappoints';

	constructor (private httpService:HttpService, protected popoverService: PopoverService, protected router: Router, protected localStorageService: LocalStorageService) {
		//this.popoverService = popoverService;
		super(popoverService, router, localStorageService);
	};

	public getAuthorized () {
		return this.httpService.get(this.authUrl)
			.toPromise()
			.catch(this.error.bind(this));
	};

	public getLocations (filters) {
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

		return this.httpService.get(this.mappointsUrl + filtersStr)
			.toPromise()
			.catch(this.error.bind(this));
	};

	public getStatistics (divisionId) {
		return this.httpService.get(this.statisticsUrl + '?division=' + divisionId)
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
