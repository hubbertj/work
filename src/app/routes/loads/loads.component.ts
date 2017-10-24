import { Component, OnInit, OnDestroy } from '@angular/core';
import {CORE_DIRECTIVES, NgClass} from '@angular/common';
import {SELECT_DIRECTIVES} from 'ng2-select/ng2-select';
import {DROPDOWN_DIRECTIVES, MODAL_DIRECTVES, TYPEAHEAD_DIRECTIVES, BS_VIEW_PROVIDERS} from 'ng2-bootstrap';
import { LoadsService, UserService, DivisionService, LocalStorageService } from '../../services';
import { Router, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { DropdownComponent } from '../../components/index';
import { DriversComponent} from '../../components/drivers/index';
import {DateComponent} from '../../components/date/index';
import {ShareComponent} from '../../components/share/index';

import {SkeletonComponent} from '../../components/skeleton/index';
import {AttributesComponent} from '../../components/attributes/index';


import { RangePickerDirective } from '../../directives/rangepicker/rangepicker.directive';

import { StatusFilterConst, UStates } from '../../constants/index';

import * as moment from 'moment';

declare var $: JQueryStatic;
import * as _ from 'lodash';


@Component({
	selector: 'loads',
	directives: [DROPDOWN_DIRECTIVES, ShareComponent, ROUTER_DIRECTIVES, SELECT_DIRECTIVES, NgClass, CORE_DIRECTIVES, RangePickerDirective, DropdownComponent, DriversComponent, DateComponent, AttributesComponent, MODAL_DIRECTVES, TYPEAHEAD_DIRECTIVES, SkeletonComponent],
	template: require('./loads.component.html'),
	styles: [`.dropdown-submenu:hover>.dropdown-menu {position:relative;display:block;} .dropdown-submenu>a:after {	display: block;	content: " ";		float: right;		width: 0;		height: 0;		border-color: transparent;		border-style: solid;		border-width: 5px 0 5px 5px;		border-left-color: #ccc;		margin-top: 5px;		margin-right: -10px;	} .dropdown-submenu>.dropdown-menu {
		top: 0;
		left: 100%;
		margin-top: -6px;
		margin-left: -1px;
		-webkit-border-radius: 0 6px 6px 6px;
		-moz-border-radius: 0 6px 6px;
		border-radius: 0 6px 6px 6px;
	}`],
	providers: [LoadsService, DivisionService, LocalStorageService],
	viewProviders: [BS_VIEW_PROVIDERS]
})

export class LoadsComponent implements OnInit, OnDestroy {
	private id;
	private moveDivision: any = {};
	private moveLoad: any = {};
	private loadMovePopupId;
	private loadSharePopupId;
	private docScansPopupId;
	private divisionId;
	private filterStatus = StatusFilterConst;
	private filterDivision:Array<string> = [];
	private states = UStates;
	private drivers = [];
	private carriers = [];
	private shownAll = false;
    private overLimit = false;
    private info: string;

	private carriersForMove:any = [];
	private brokersForMove: any = [];
	private openedPopups = 0;

	public loadLoading = false;
	public currentLoad: any = {};
	public sortingField = 'shipping';
	public sortingIsAsc = true;
	public filterDateShipping:any = {
		startDate: '',
		endDate:  ''
	};
	public filterDateDelivery:any = {
		startDate: '',
		endDate:  ''
	};
	public stateFilterShipping:any = '';
	public stateFilterDelivery:any = '';
	public statusFilter = [];
	public divisionFilter = [];
	public cityFilterShipping;
	public cityFilterDelivery;
	public paramsFilter;
	public offeredDriversFilter = [];
	public assignedDriversFilter = [];
	public offeredCarriersFilter = [];
	public assignedCarriersFilter = [];


	public divisionFilterRaw = [];
	public offeredDriversFilterRaw = [];
	public assignedDriversFilterRaw = [];
	public offeredCarriersFilterRaw = [];
	public assignedCarriersFilterRaw = [];


	public loads: Array<any>;

	public params: any = [];

	public pageNum = 0;
	public totalPages: number;
	public perPage = 20;
	public page: Array<any> = [];
	public pages: Array<any> = [];
	public loading: boolean = false;
	public isCarrier: boolean;
    public isCommonCarrier: boolean = false;
	public filter: any;
	public showPagination = true;

    public filtersOpened = false;

	constructor(
		private loadsService: LoadsService, 
		private router: Router,
		private userService: UserService,
		private divisionService: DivisionService,
		private localStorageService: LocalStorageService
	) {
		this.id  = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	};

	public hasFilters () {
		return (this.filterDateShipping && (this.filterDateShipping.endDate || this.filterDateShipping.startDate)) ||
				(this.filterDateDelivery && (this.filterDateDelivery.endDate || this.filterDateDelivery.startDate)) ||
		this.stateFilterShipping ||
		this.stateFilterDelivery ||
		this.cityFilterShipping ||
		this.cityFilterDelivery ||
		(this.offeredDriversFilter && this.offeredDriversFilter.length) ||
		(this.assignedDriversFilter && this.assignedDriversFilter.length) ||
		(this.offeredCarriersFilter && this.offeredCarriersFilter.length) ||
		(this.assignedCarriersFilter && this.assignedCarriersFilter.length);
	};

	public extractLink (res, load) {
		if (res) {
			let body = res.json();

			load.trackingLink = window.location.origin + window.location.pathname + '#' + body.link;
		}
	};


	public getLink(load, event) {
		this.closeAllPopups();
		this.loadSharePopupId = load.id;

		if (!load.trackingLink) {
			this.loadsService.getShareLink(load.id).then((res)=> {
				this.extractLink(res, load);
			});
        }
        
		this.formClicked(event);
	};

	public keyUp (load, event) {
		if (load.newEmail == '' && event.keyCode == 8) {
			this.removeEmail(load, load.trackedEmails.length - 1);
		}
	};

	public addEmail (load, lastCheck) {
		let lastSymbol = load.newEmail[load.newEmail.length - 1];
		let email: any;

		if (lastSymbol == ' ' || lastSymbol == ';' || lastSymbol == ',' || lastCheck) {
			email = load.newEmail.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);

			if (email) {
				load.trackedEmails.push(email[0]);
				load.newEmail = '';
			}
		}

	};

	public removeEmail (load, index) {
		load.trackedEmails.splice(index, 1);
	};

	public sendTackingLink (load) {
		this.addEmail(load, true);

		let sharingInfo = {
			link: load.trackingLink,
			expirationTime: load.time == 'hours' ? load.expired : load.expired * 24,
            emails: load.trackedEmails,
            additionalInfo: this.info
		}

		this.loadsService.shareLink(load.id, sharingInfo);
		this.hideSharePopup();
	};


	public formClicked (event) {
		event.stopPropagation();
		event.preventDefault();

		return false;
	};

	public showMoveLoadPopup (load, event) {
		if (load.status != 'InTransit') {
			this.closeAllPopups();

			this.moveLoad = load;
			this.loadMovePopupId = load.id;
			this.moveDivision = null;
	
		}
				
		event.stopPropagation();
		event.preventDefault();
	};

	public closeAllPopups () {
		this.hideSharePopup();
		this.hideMoveLoadPopup();
		this.hideDocumentScans();
	};

	public showDocumentScans (id, event) {
		this.closeAllPopups();
		this.docScansPopupId = id;

		event.stopPropagation();
		event.preventDefault();
	};

	public hideDocumentScans () {
		this.docScansPopupId = null;
	};

	public hideSharePopup () {
		this.loadSharePopupId = null;
	};

	public hideMoveLoadPopup() {
		this.loadMovePopupId = null;
	};

	public gotoDetails (id, event) {
		if (!this.hasNoOpenedPopups()) {
			this.router.navigate(['Load Details', { divId: this.divisionId, loadId: id}]);	
		} else {
			this.openedPopups = 0;
		}
	};

	public gotoTendering (id, event) {
		this.router.navigate(['TenderingLoad', { divId: this.divisionId, loadId: id}]);	

		event.stopPropagation();
		event.preventDefault();
	};

	private setOpenedPopups(isOpened) {
		if (isOpened) {
			this.closeAllPopups();
		};
		
		this.openedPopups = $('.dropdown.open').length;
	};

	private hasNoOpenedPopups () {
		return !!this.loadSharePopupId || !!this.loadMovePopupId || !!this.openedPopups || !!this.docScansPopupId;
	};

	public moveToDivision () {
		this.loadsService.moveLoad(this.moveDivision.id, this.moveLoad.id).then((res)=>{
			this.loads = this.loads.filter((load) => load.id != this.moveLoad.id);

			this.setPage(this.pageNum);
			this.hideMoveLoadPopup();
		});
	};

	public getLoad(load, event) {
		this.loadLoading = true;

		this.currentLoad = load;
		this.loadsService
            .getLoad(load.id, this.divisionId)
			.then(this.setLoad.bind(this));

		event.stopPropagation();
	};

	private setLoad (res) {
		this.loadLoading = false;

		if (res) {
			let body = res.json();

			this.currentLoad = body;
		}
	};


	public deleteLoad (load, event) {
		if (confirm('This load will be deleted permanently. Are you sure?')) {
			this.loading = true;

			this.loadsService
				.deleteLoad(load.id)
				.then(this.applyFilters.bind(this));
		}
		
		event.preventDefault();
  		event.stopPropagation();
	};

	public resetFilters (event) {
		this.filterDateShipping = {
			startDate: '',
			endDate:  ''
		};
		this.filterDateDelivery = {
			startDate: '',
			endDate:  ''
		};
		this.stateFilterShipping = '';
		this.stateFilterDelivery = '';
		this.statusFilter = [];
		this.divisionFilter = [];
		this.cityFilterShipping = '';
		this.cityFilterDelivery = '';
		this.paramsFilter = '';
		this.offeredDriversFilter = [];
		this.assignedDriversFilter = [];
		this.offeredCarriersFilter = [];
		this.assignedCarriersFilter = [];
		this.sortingField = 'shipping';
		this.sortingIsAsc = true;

		this.submit(event);
	};

	public submit(event) {
		this.router.navigate(['Loads', this.serializeFilters()]);
		event.preventDefault();
  		event.stopPropagation();
	};

	public applyFilters () {
		this.loads = [];
		this.page = [];
		this.pages = [];

		this.loadsService.get(+this.divisionId, {
				dateShipping: this.filterDateShipping,
				dateDelivery: this.filterDateDelivery,
				stateShipping: this.stateFilterShipping,
				stateDelivery: this.stateFilterDelivery,
				status: this.statusFilter,
				division: this.divisionFilter,
				cityShipping: this.cityFilterShipping,
				cityDelivery: this.cityFilterDelivery,
				params: this.paramsFilter,
				offeredDrivers: this.offeredDriversFilter,
				assignedDrivers: this.assignedDriversFilter,
				offeredCarriers: this.offeredCarriersFilter,
				assignedCarriers: this.assignedCarriersFilter,
				sortingField: this.sortingField,
				sortingType: this.sortingIsAsc ? 'asc' : 'desc'
			})
			.then((res) => this.setLoads(res))
			.catch(this.error);
	};

	public filterChanged(filter, type) {
		switch (type) {
			case 'shipping':
				this.filterDateShipping = filter;
				break;
			case 'delivery':
				this.filterDateDelivery = filter;
				break;
		}
	};

	public statusChanged(value) {
		this.statusFilter = value;
	};

	public divisionChanged(value) {
		this.divisionFilter = value;
	};

	public ngOnInit():any {
		this.loading = true;
		this.divisionId = this.router.root.currentInstruction.urlPath.split('/')[1];
		this.deserealizeFilters(this.router.root.currentInstruction.urlParams);
		this.userService.getUser((user) => this.setFilters(user));

		$('body').on('click.' + this.id, (event) => {
			this.closeAllPopups();
		});
	};

	public ngOnDestroy() {
		$('body').unbind('click.' + this.id);
	};

	public loadDrivers () {
		this.divisionService.getDrivers(+this.divisionId, null)
			.then((res) => this.setDrivers(res))
			.catch(this.error);

	};

	public carrierChanged (carriers, type) {
		switch (type) {
			case 'offered':
				this.offeredCarriersFilter = carriers;
				break;
			case 'assigned':
				this.assignedCarriersFilter = carriers;
				break;
		}
	}

	public driverChanged (drivers, type) {
		switch (type) {
			case 'offered':
				this.offeredDriversFilter = drivers;
				break;
			case 'assigned':
			case 'accepted':
				this.assignedDriversFilter = drivers;
				break;
		}
	};

	public deserealizeFilters (arrOfFilters) {
		let params = {};

		for (let filterStr of arrOfFilters) {
			let key = filterStr.split('=')[0];
			let value = filterStr.split('=')[1];
			let filterKey = '';

			params[key] = value;


			switch (key) {
				case 's':
					filterKey = 'sortingField';
					this[filterKey] = params[key];
					break;
				
				case 'asc':
					filterKey = 'sortingIsAsc';
					this[filterKey] = !!+params[key];
					break;

				case 'dsh':
					filterKey = 'filterDateShipping';

					this[filterKey] = {
						startDate: moment(params[key].split('--')[0]).toDate(),
						endDate: moment(params[key].split('--')[1]).toDate()
					};

					break;

				case 'ddl':
					filterKey = 'filterDateDelivery';

					this[filterKey] = {
						startDate: moment(params[key].split('--')[0]).toDate(),
						endDate: moment(params[key].split('--')[1]).toDate()
					};
					break;

				case 'ssh':
					filterKey = 'stateFilterShipping';
					
					this[filterKey] = params[key];

					break;

				case 'sdl':
					filterKey = 'stateFilterDelivery';
					
					this[filterKey] = params[key];

					break;

				case 'st':
					let checkedStatuses = JSON.parse(params[key]);

					filterKey = 'statusFilter';
					this[filterKey] = [];

					for (let status of checkedStatuses) {
						this[filterKey].push(this.filterStatus.find((st)=>st.id == status));
					}

					break;

				case 'div':
					filterKey = 'divisionFilterRaw';
					this[filterKey] = JSON.parse(params[key]);

					break;

				case 'csh':
					filterKey = 'cityFilterShipping';
					this[filterKey] = params[key];
					break;

				case 'cdl':
					filterKey = 'cityFilterDelivery';
					this[filterKey] = params[key];
					break;

				case 'prm':
					filterKey = 'paramsFilter';
					
					this[filterKey] = params[key];
					break;

				case 'odr':
					filterKey = 'offeredDriversFilterRaw';
					this[filterKey] = JSON.parse(params[key]);
					break;

				case 'adr':
					filterKey = 'assignedDriversFilterRaw';
					this[filterKey] = JSON.parse(params[key]);

					break;

				case 'ocr':
					filterKey = 'offeredCarriersFilterRaw';
					this[filterKey] = JSON.parse(params[key]);

					break;

				case 'acr':
					filterKey = 'assignedCarriersFilterRaw';
					this[filterKey] = JSON.parse(params[key]);

					break;
			}
		}
		
	};

	public serializeFilters () {
		let params = {};

		params['s'] = this.sortingField;
		params['asc'] = this.sortingIsAsc ? 1 : 0;

		if (this.filterDateShipping && this.filterDateShipping.startDate && this.filterDateShipping.endDate) {
			params['dsh'] = moment(this.filterDateShipping.startDate).format('MM/DD/YY') + '--' + moment(this.filterDateShipping.endDate).format('MM/DD/YY');	
		}

		if (this.filterDateDelivery && this.filterDateDelivery.startDate && this.filterDateDelivery.endDate) {
			params['ddl'] = moment(this.filterDateDelivery.startDate).format('MM/DD/YY') + '--' + moment(this.filterDateDelivery.endDate).format('MM/DD/YY');
		}

		params['ssh'] = this.stateFilterShipping;
		params['sdl'] = this.stateFilterDelivery;
		params['st'] = JSON.stringify(this.statusFilter.map((s)=>s.id));
		params['div'] = JSON.stringify(this.divisionFilter.map((s)=>s.id));
		params['csh'] = this.cityFilterShipping;
		params['cdl'] = this.cityFilterDelivery;
		params['prm'] = this.paramsFilter;
		params['odr'] = JSON.stringify(this.offeredDriversFilter.map((s)=>s.id));
		params['adr'] = JSON.stringify(this.assignedDriversFilter.map((s)=>s.id));
		params['ocr'] = JSON.stringify(this.offeredCarriersFilter.map((s)=>s.id));
		params['acr'] = JSON.stringify(this.assignedCarriersFilter.map((s)=>s.id));

		params['divId'] = this.divisionId;

		for (let key in params) {
			if ((!params[key] || params[key] == 'null' || params[key] == '[]' || params[key] == '') && (params[key] !== 0)) {
				delete params[key];
			}
		};

		return params;
	};

	private setBrokers (res) {
		if (res && res.text()) {
			let body = res.json();

			this.filterDivision = body;
			
			this.brokersForMove = this.filterDivision.map((div:any) => {
				return {
					type: div.type,
					text: _.compact([div.name, div.code]).join(' — '), 
					id: div.id
				}
			})
			.filter((broker:any)=>broker.id != this.divisionId);

			if (this.divisionFilterRaw && this.divisionFilterRaw.length) {

				this.divisionFilter = [];

				for (let div of this.divisionFilterRaw) {

					this.divisionFilter.push(this.filterDivision.find((d:any)=>d.id == div));
				}

				this.divisionFilterRaw = [];
			}

			this.applyFilters();
		}
	};

    private getBrokers() {
        this.userService.getUser((user) => this.setBrokerFilters(user));
    };

    private setBrokerFilters(user)
    {
        if (user.divisions) {

            this.brokersForMove = user.divisions.map((div) => {
                return {
                    type: div.type,
                    text: _.compact([div.name, div.code]).join(' — '), 
                    id: div.id
                }
            }).filter((div) => {
                return div.type == 'broker' && div.id != this.divisionId;
            });;


            if (this.divisionFilterRaw && this.divisionFilterRaw.length) {

                this.divisionFilter = [];

                for (let div of this.divisionFilterRaw) {

                    this.divisionFilter.push(this.filterDivision.find((d: any) => d.id == div));
                }

                this.divisionFilterRaw = [];
            }

            this.applyFilters();
        }
    }

	private setDrivers (res) {
		if (res && res.text()) {
			let body = res.json();

			this.drivers = body;

			if (this.offeredDriversFilterRaw && this.offeredDriversFilterRaw.length) {
				this.offeredDriversFilter = [];

				for (let driver of this.offeredDriversFilterRaw) {
					this.offeredDriversFilter.push(this.drivers.find((dr)=>dr.id == driver));
				}

				this.offeredDriversFilterRaw = [];
			}

			if (this.assignedDriversFilterRaw && this.assignedDriversFilterRaw.length) {
				this.assignedDriversFilter = [];

				for (let driver of this.assignedDriversFilterRaw) {
					this.assignedDriversFilter.push(this.drivers.find((dr)=>dr.id == driver));
				}

				this.assignedDriversFilterRaw = [];
			}

		}

		this.getBrokers();
	};

	public setLoads (results):void {
		this.serializeFilters();

		let body = results.json();
		let markedLoad = this.localStorageService.getItem('selectedItem');


		this.loads = (body && body.loads) || [];
		_.each(this.loads, (load) => {
			load.trackedEmails = [];
			load.newEmail = '';
			load.trackingLink = '';
			load.expired = 3;
			load.time = 'hours';
		});
		
		this.overLimit = body && body.isOverLimit;

		this.totalPages = Math.ceil(this.loads.length / this.perPage);
		this.pages = new Array(this.totalPages);

		if (markedLoad) {
			let found = this.loads.findIndex((load)=>load.id == markedLoad);
			
			if (found != -1) {
				this.setPage(Math.floor(found / this.perPage));
			} else {
				this.localStorageService.clearItem('selectedItem');
				this.createPage();
			}
		} else {
			this.createPage();
		};

		this.loading = false;

	};

	private cloneLoad (load, event) {
		this.formClicked(event);
		this.loadsService
			.clone(load)
			.then(this.parseClone.bind(this));
	};

	private parseClone(res) {
		if (res) {
			let body = res.json();

			this.router.navigate(['EditLoad', { divId: this.divisionId, loadId: body.id}]);
		}
	}

	private setFilters (user) {
        if (user.divisions) {
            let carrier = user.divisions.find((div) => {
                return div.id == +this.divisionId
            });
            this.isCarrier = carrier.type == 'carrier';
            this.isCommonCarrier = carrier.isCommonCarrier;

            this.carriers = user.divisions.map((div) => {
                return {
                    type: div.type,
                    text: div.name,
                    id: div.id
                }
            }).filter((div) => {
                return div.type == 'carrier';
            });

            this.carriersForMove = user.divisions.map((div) => {
                return {
                    type: div.type,
                    text: _.compact([div.name, div.code]).join(' — '),// ? div.name + ' — ' : '' + div.code ? div.code : '',
                    id: div.id
                }
            }).filter((div) => {
                return div.type == 'carrier' && div.id != this.divisionId;
            });;


            if (this.assignedCarriersFilterRaw && this.assignedCarriersFilterRaw.length) {

                this.assignedCarriersFilter = [];

                for (let div of this.assignedCarriersFilterRaw) {
                    this.assignedCarriersFilter.push(this.carriers.find((d) => d.id == div));
                }

                this.assignedCarriersFilterRaw = [];
            };

            if (this.offeredCarriersFilterRaw && this.offeredCarriersFilterRaw.length) {
                this.offeredCarriersFilter = [];

                for (let div of this.offeredCarriersFilterRaw) {
                    this.offeredCarriersFilter.push(this.carriers.find((d) => d.id == div));
                }

                this.offeredCarriersFilterRaw = [];
            };

            if (this.isCarrier) {
                this.loadDrivers();
            } else {
                this.setBrokerFilters(user);
            };
        }
	};

	private editLoad (load, event) {
		this.formClicked(event);
		this.router.navigate(['EditLoad', { divId: this.divisionId, loadId: load.id}]);
	};

	private createPage () {		
		let markedLoad = this.localStorageService.getItem('selectedItem');

		this.shownAll = false;
		this.page = this.loads.slice(this.pageNum * this.perPage, this.pageNum * this.perPage + this.perPage);

		if (markedLoad) {
			let found = this.page.findIndex((load)=>load.id == markedLoad);
			
			if (found != -1) {
				this.page[found].marked = true;

				this.localStorageService.clearItem('selectedItem');
			}
		} else {
			let found = this.page.findIndex((load)=>load.marked);

			if (found != -1) {
				this.page[found].marked = false;
			}
		}

		this.showPagination = this.page.length == this.loads.length;
	};

	public setPage(pageNum:number) {
		this.pageNum = pageNum;
		this.createPage();
	};

	public showAll () {
		this.shownAll = true;
		this.page = this.loads.slice();
	};

	public nextPage () {
		if (this.pageNum != this.totalPages - 1) {
			this.setPage(this.pageNum + 1);
		}
	};

	public prevPage () {
		if (this.pageNum != 0) {
			this.setPage(this.pageNum - 1);
		}
	};

	public error (error) {
		console.log('Error loading data');
	};
}
