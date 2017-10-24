import { Component, OnInit } from '@angular/core';
import {CORE_DIRECTIVES, FORM_DIRECTIVES, NgClass} from '@angular/common';
import {DROPDOWN_DIRECTIVES, MODAL_DIRECTVES, BS_VIEW_PROVIDERS} from 'ng2-bootstrap';
import { LoadsService, UserService, DivisionService } from '../../services';
import { Router, OnActivate, RouteParams } from '@angular/router-deprecated';
import {MessagesDirective} from '../../directives';



@Component({
    selector: 'tendering',
    directives: [DROPDOWN_DIRECTIVES, MODAL_DIRECTVES, NgClass, CORE_DIRECTIVES, FORM_DIRECTIVES, MessagesDirective],
    viewProviders: [BS_VIEW_PROVIDERS],
    providers: [LoadsService, DivisionService],
    template: require('./tendering.component.html')
})

export class TenderingComponent implements OnActivate {

	private isCarrier;
	private divisionId;
	private loadId;


	private loading: boolean;
	private lastUrl;
	private carriers: any = [];

	public load:any = {};
	public shipments: any = [];
	public stops:any = [];
	public drivers: any = [];
	public cleanDrivers: any = [];


	public searchString:string = '';
	public onlyFavorites:boolean = false;
	public acceptedDrivers:any = [];
	public acceptedCarriers:any = [];
	public cleanCarriers:any = [];


	public cantAssign:boolean = false;

	constructor (
		private router:Router,
		private routeParams: RouteParams,
		private loadsService: LoadsService,
		private userService: UserService,
		private divisionService: DivisionService
	){};

	ngOnInit () {
		this.divisionId = +this.routeParams.params['divId'];
		this.loadId = +this.routeParams.params['loadId'];
		this.loading = true;
		this.userService.getUser(this.setCarrier.bind(this));
	};

	public gotoLast () {
		this.router.navigate([this.lastUrl.name,  this.lastUrl.params]);	
	};

	public favoriteChecked() {
		this.filter();
	};

	private searchFunc(driver) {
		let driverName = driver.name.toUpperCase();

		if (this.onlyFavorites) {
			return driver.isFavorite && driverName.indexOf(this.searchString.toUpperCase()) != -1;
		};

		return driverName.indexOf(this.searchString.toUpperCase()) != -1;
	};

	public filter () {
		if (this.isCarrier) {
			this.mergeDrivers();	
		} else {
			this.mergeCarriers();
		};
	};

	routerOnActivate (next, prev) {
		if (prev) {
			this.lastUrl = {
				name: prev.routeName,
				params: prev.params
			};	
		} else {
			this.lastUrl = {
				name: 'Loads',
				params: {
					divId: next.params.divId
				}
			};
		};		
	};

	public deserealizeLoad (res) {
		if (res) {
			let body = res.json();

			this.load = body;
			this.shipments = this.load.shipments;
			this.stops = this.load.stops;
			
			this.stops.sort((a,b) => a.stopNum - b.stopNum);

			if (this.isCarrier) {
				this.divisionService.getDrivers(+this.divisionId, null)
					.then(this.setDrivers.bind(this));
			} else {
				this.divisionService.getCarriers(+this.divisionId)
					.then(this.setCarriers.bind(this));
			};
		}
	};

	public parseDriver (res) {
		let statuses = res.json();

		this.load.carrierTenderingInfo = statuses;

		this.mergeDrivers();
	};

	public parseCarrier (res) {
		let statuses = res.json();

		this.load.brokerTenderingInfo = statuses;

		this.mergeCarriers();
	}

	public changeStatus (unit, status) {
		if (this.isCarrier) {
			unit.assignmentStatus = status;

			this.saveDrivers();
		} else {
			if (this.acceptedCarriers.length < 1 || !status) {
				unit.assignmentStatus = status;

				this.saveCarriers();
			}
		}
	};

	public removeOffers () {
		for (let driver of this.drivers) {
			if (driver.assignmentStatus == 'Offered') {
				driver.assignmentStatus = null;	
			}
		};
	}

	public saveDrivers () {
		let driversWithStatuses;

		if (this.drivers.filter((dr)=>dr.assignmentStatus == 'Assigned') > 0) {
			this.removeOffers();
		}
		
		driversWithStatuses = this.drivers.filter((dr)=>!!dr.assignmentStatus);

		this.loadsService
			.updateTenderingCarrier(driversWithStatuses, this.loadId)
			.then(this.parseDriver.bind(this));
	};


	public saveCarriers () {
		let carriersWithStatuses = this.carriers.filter((cr)=>!!cr.assignmentStatus);

		this.loadsService
			.updateTenderingBroker(carriersWithStatuses, this.loadId)
			.then(this.parseCarrier.bind(this));
	}

	public mergeCarriers () {
		this.acceptedCarriers = [];
		this.cleanCarriers = [];

		for (let carrier of this.carriers) {
			carrier.assignmentStatus = null;
		};

		if (this.load.brokerTenderingInfo) {
			for (let carrier of this.load.brokerTenderingInfo) {
				let foundIdx = this.carriers.findIndex((cr)=> cr.id == carrier.id);

				if (foundIdx != -1) {
					this.carriers[foundIdx].assignmentStatus = carrier.assignmentStatus;
				}
			}
		}

		this.acceptedCarriers = this.carriers.filter((cr)=>cr.assignmentStatus == 'Assigned');
		this.cleanCarriers = this.carriers.filter((cr)=> {
			return	(!cr.assignmentStatus || cr.assignmentStatus == 'Offered') && this.searchFunc(cr);
		});

	};

	public mergeDrivers () {
		this.acceptedDrivers = [];
		this.cleanDrivers = [];
		
		for (let driver of this.drivers) {
			driver.assignmentStatus = null;
		};

		if (!!this.load.carrierTenderingInfo) {
			for(let driver of this.load.carrierTenderingInfo) {
				let foundIdx = this.drivers.findIndex((dr)=> dr.id == driver.id);

				if (foundIdx != -1) {
					this.drivers[foundIdx].assignmentStatus = driver.assignmentStatus;
				}
			}
		}

        this.acceptedDrivers = this.drivers.filter((dr) => dr.assignmentStatus == 'Assigned' || dr.assignmentStatus == 'Accepted');

		this.cantAssign = this.acceptedDrivers.length > 0;


		if (this.cantAssign) {
			this.removeOffers();
		}

		this.cleanDrivers = this.drivers.filter((dr)=> {
			return	(!dr.assignmentStatus || dr.assignmentStatus == 'Offered' || dr.assignmentStatus == 'Rejected') && this.searchFunc(dr);
		});
	};

	public setDrivers (res) {
		let body = res.json();

		this.drivers = body;
		this.cleanDrivers = body;

		this.mergeDrivers();

		this.loading = false;

	};

	public setCarriers (res) {
		let body = res.json();

		this.carriers = body;
		this.cleanCarriers = body;

		this.mergeCarriers();
		this.loading = false;

	}

	public setCarrier (user) {
		this.isCarrier = user.divisions.find((div) => {
			return div.id == +this.divisionId
		}).type == 'carrier';

		//this.carriers = user.divisions.filter((div)=>div.type == 'carrier');

        this.loadsService.getLoad(this.loadId, this.divisionId)
			.then(this.deserealizeLoad.bind(this));
	};
}
