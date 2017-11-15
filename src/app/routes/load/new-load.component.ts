import { Component, OnInit, OnDestroy, EventEmitter, ViewChild } from '@angular/core';
import { Router, OnActivate, CanDeactivate } from '@angular/router-deprecated';
import { SimpleDropdownComponent } from '../../components/simple-dropdown/index';
import { NumberComponent } from '../../components/number/index';


import {CORE_DIRECTIVES, FORM_DIRECTIVES, NgClass} from '@angular/common';
import {SELECT_DIRECTIVES} from 'ng2-select/ng2-select';
import {DROPDOWN_DIRECTIVES,TAB_DIRECTIVES, MODAL_DIRECTVES, TYPEAHEAD_DIRECTIVES, BS_VIEW_PROVIDERS, TOOLTIP_DIRECTIVES} from 'ng2-bootstrap';
import { DatePickerDirective, AutosizeDirective, ScrollDirective } from '../../directives/index';
import {DateComponent} from '../../components/date/index';
import { EmailInputComponent } from '../../components/email-input/index';
import { PhoneInputComponent } from '../../components/phone-input/index';


import { UserService, DivisionService, LoadsService, LocalStorageService } from '../../services';

import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
	selector: 'new-load',
	providers: [DivisionService, LoadsService, LocalStorageService],
    directives: [DateComponent, ScrollDirective,
     DROPDOWN_DIRECTIVES, EmailInputComponent,
      NumberComponent, TYPEAHEAD_DIRECTIVES,
       MODAL_DIRECTVES, NgClass, CORE_DIRECTIVES,
        FORM_DIRECTIVES, SimpleDropdownComponent,
         DatePickerDirective, TOOLTIP_DIRECTIVES,
          AutosizeDirective, PhoneInputComponent],
	template: require('./new-load.component.html'),
	viewProviders: [BS_VIEW_PROVIDERS]
})

export class NewLoadComponent implements OnInit, OnActivate, OnDestroy {
	@ViewChild('stopModal') stopModal;
	@ViewChild('serviceStopModal') serviceStopModal;
	@ViewChild('shipmentModal') shipmentModal;
	
	private divisionId;
	private divisionCode;
	private loadId;
    private isCarrier;
    private isCommonCarrier;


	public scrollEmitter = new EventEmitter();

	private carrierLoadNumber;
	private brokerLoadNumber;
	private freightTerms;
	private carrierSpecialInstructions;
	private loadAttributes:any = [];
	private bolNumber;
	private rate;
	private orders;
	private shipments = [];
	private stops = [];
	private lastUrl:any = {};
	private dontCheck = false;
    private idCounter: number = 0;
    private tracking: boolean;
    private emailsList: Array<any> = [];
    private readOnly = false;
   

	private serviceStopButtonsDisabled:boolean = false;
	private searchStopInProgress:boolean = false;

	private stringValue = '';
	private searchStopsStr = '';
	private divisionAddresses = [];
	private addresses = [];
	private filteredStops = [];
	private timeValue = '';
	private detailsOpened = true;
	private loadValue;
	private loadAttrName;
	private currentShipment:any;
	private currentStopPickUp:any = {};
	private currentStopDropOff:any =  {};
	private currentStop:any = {};
	private selectedStop: any = {};
	private currentServiceStop:any = {};
	private prevStop: any = {};
    private attributeButtonDisabled = true;
    private submitting: boolean = false;
    public emailValid = true;

	private errors:any = [];
	private errorMessage: any = '';
	private loadErrors: any = [];
	private loadValidationErrors: any = {};

	private loading:boolean = false;

	private validationError;

	public allAttributes = [];
	public loadAttrType = 'string';
	public times = [{
		name: 'Morning'
	}, {
		name: 'Evening'
	}, {
		name: 'Night'
	}];

	public imperialMeasurments = ['lbs', 'ft', 'ft³'];


    public standartEvents = [3, 8];

	public weightUnits = ['lbs', 'kg'];
	public heightUnits = ['ft', 'cm'];
	public volumeUnits = ['ft³', 'cm³'];
	public packageUnits = ['box', 'crafted', 'drum', 'barrel', 'palette', 'upackaged', 'skid'];

	public feetToCm = 30.48;
	public lbsToKg = 0.453592;
	public ft3toCm3 = 28316.8;

	// We dont need to send request after each scroll -- just debounce it.
	public onScrollAddressesDebounced = _.debounce(this.onScrollAddresses.bind(this), 200);

	constructor (
		private userService:UserService,
		private router:Router,
		private divisionService:DivisionService,
		private loadsService: LoadsService,
		private localStorageService: LocalStorageService
	) {

	};

    isInvalid() {
        let errors = (this.shipments && !this.shipments.length) || !this.emailValid;
		return errors;
	}

	onScrollAddresses (event) {
		let element = event.target;

		if ((Math.trunc(element.scrollTop) + element.clientHeight + 10) >= element.scrollHeight) {
			let lastId = this.addresses[this.addresses.length - 1] && this.addresses[this.addresses.length - 1].id;

			this.divisionService
				.getAddresses(this.divisionId, this.searchStopsStr, lastId)
				.then(this.extractAddresses.bind(this));
		} 
	};

	generateTempId () {
		return -++this.idCounter;
	};

	scrollBottom () {
		this.scrollEmitter.emit({
			height: 0
		});
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
			}
		}
	};

    public emailsChanged(emailOutput) {
        
        if (emailOutput) {
            this.emailValid = emailOutput.emailValid;
            this.emailsList = emailOutput.emailsList;
        }
		
	};

	public openPopupWithEntityId (id, entityType) {
		let entity;

		if (entityType == 'shipment') {
			entity = _.find(this.shipments, (ship:any)=>(ship.id == id || ship._id == id));

			entity.errors = _.filter(this.errors, (error:any)=> error.objectId == id && error.entityType == 'shipment');

			this.startEditShipment(entity);
			this.shipmentModal.show();
		}

		if (entityType == 'stop') {
			entity = this.stops.find((stop)=>(stop.id == id || stop.stop_id == id || stop._id == id));

			entity.errors = _.filter(this.errors, (error:any)=> error.objectId == id && error.entityType == 'stop');
			
			this.selectStop(entity);

			if (entity.dropoffShipments.length || entity.pickupShipments.length) {
				this.stopModal.show();
			} else {
				this.serviceStopModal.show();
			}
		} 
	};

	public loadChanged () {
		if (!window.onbeforeunload) {
			window.onbeforeunload = (event) => {
				let dialogText = 'Dialog text here';
				event.returnValue = dialogText;

				return dialogText;
			};
		}
		
	};

	routerCanDeactivate (seg) {
		if (!this.dontCheck) {
			this.dontCheck = false;
			return confirm('You are about to leave this page, all data will be lost. Are you sure?');	
		}
		
	};

	ngOnDestroy () {
		window.onbeforeunload = null;
	};

    ngOnInit() {        
		this.divisionId = +this.router.root.currentInstruction.urlPath.split('/')[1];
		this.loadId = +this.router.root.currentInstruction.urlPath.split('/')[3];
        this.loadChanged();
        
		if (this.localStorageService.getItem('loadItem')) {
            this.deserealizeFromLocalStorage(JSON.parse(this.localStorageService.getItem('loadItem')));            
			this.localStorageService.clearItem('loadItem');
		} else {
			if (this.loadId) {
				this.loading = true;
				this.getNotifications();
                this.loadsService.getLoad(this.loadId, this.divisionId)
					.then(this.deserealizeLoad.bind(this));
			}
		}


		this.userService.getUser(this.setIsCarrier.bind(this));

		this.divisionService.getAttributes(this.divisionId)
            .then(this.extractAttributes.bind(this));

        this.submitting = false;                       
    
    };     

    public setIsCarrier(user) {
        let division = user.divisions.find((div) => {
             return div.id == this.divisionId;
		});

        this.isCarrier = division.type == 'carrier';
        this.isCommonCarrier = division.isCommonCarrier;
		this.divisionCode = division.code;

		if (!this.loadId && user.email && user.email !== "") {
			this.emailsList.push(user.email);	
		}
	};

    public searchStop() {
		if (!this.searchStopInProgress) {
			this.searchStopInProgress = true;

			this.addresses = [];

			if (this.searchStopsStr && this.searchStopsStr != '') {
				let lastId = this.addresses[this.addresses.length - 1] && this.addresses[this.addresses.length - 1].id;

				
				this.filteredStops = this.stops.filter((el)=>{
					let addresses = el.addressLines.map((adr)=>{
						return adr.val;
					});

					return (addresses.join(' ').toUpperCase().indexOf(this.searchStopsStr.toUpperCase()) != -1);
				});

				this.divisionService
					.getAddresses(this.divisionId, this.searchStopsStr, null)
					.then(this.extractAddresses.bind(this));
			} else {
				this.filteredStops = this.stops.slice(0);

				this.divisionService
					.getAddresses(this.divisionId, this.searchStopsStr, null)
					.then(this.extractAddresses.bind(this));
			}
		}
	};

	public getAddress (stop) {
		let result = [];
		for (let adrLine of stop.addressLines) {
			result.push(adrLine.val);
		};

		return  result.join(', ');
	};

	public fillStop (data, stop) {
		stop.addressLines = [];
		for(let i = 0; i <  data.addressLines.length; i ++ ) {
			if (!stop.addressLines[i]) {
				stop.addressLines.push({
					val: ''
				});
			}

			stop.addressLines[i].val = data.addressLines[i].val;
		} 

		stop.date = data.date;
		stop.time = data.time;
		stop.city = data.city;
		stop.state = data.state;
		stop.country = data.country;
		stop.postalCode = data.postalCode;
		stop.contactName = data.contactName;
		stop.company = data.company;
		stop.phoneNumber = data.phoneNumber;

		this.loadChanged();
	};

	public fillAddress (data, stop) {
		stop.addressLines = [];
		for(let i = 0; i <  data.addressLines.length; i ++ ) {
			if (!stop.addressLines[i]) {
				stop.addressLines.push({
					val: ''
				});
			}

			stop.addressLines[i].val = data.addressLines[i];
		} 

		stop.city = data.city;
		stop.state = data.state;
		stop.country = data.country;
		stop.postalCode = data.postalCode;
		stop.contactName = data.contactName;
		stop.company = data.company;
		stop.phoneNumber = data.phoneNumber;
	};

	public extractAddresses (res) {
		if (res) {
			let body = res.json();

			if (!this.addresses.length) {
				this.addresses = body.slice(0);	
			} else {
				this.addresses = this.addresses.concat(body.slice(0)).slice(0);
			}

			this.searchStopInProgress = false;
		}
	};

	public loadAttributeSelected (event) {
		let rawLoadAttr = this.allAttributes.find((attr)=> attr.name == event);

		this.loadAttrName = event;
		
		if (rawLoadAttr && rawLoadAttr.type != this.loadAttrType) {
			this.loadValue = '';
		}

		if (rawLoadAttr) {
			this.loadAttrType = rawLoadAttr.type;
		} else {
			this.loadAttrType = 'string';
		}

		this.attributeButtonDisabled = this.loadAttrType != 'boolean' && !this.loadValue;

		this.stringValue = event;
	};

	public attributeValueChanged () {
		this.attributeButtonDisabled = this.loadAttrType != 'boolean' && !this.loadValue;
	};

	public updateAttribute (attributeIndex) {
		let hasIconAttrs = ['Hazardous', 'High Value', 'Fragile'];

		this.loadAttributes[attributeIndex] = {
			name: this.loadAttrName,
			value: this.loadValue,
			hasIcon: !!(hasIconAttrs.indexOf(this.loadAttrName) + 1)
		};

		this.loadValue = null;
		this.loadAttrName = null;
		this.loadAttrType = 'string';
		this.stringValue = '';
		this.attributeButtonDisabled = true;
	};

	public onAttributesToggled (event, attribute) {
		if (event) {
			let rawLoadAttr = this.allAttributes.find((attr)=> attr.name == attribute.name);

			if (rawLoadAttr && rawLoadAttr.type != this.loadAttrType) {
				this.loadValue = '';
			}

			if (rawLoadAttr) {
				this.loadAttrType = rawLoadAttr.type;
			} else {
				this.loadAttrType = 'string';
			}

			this.stringValue = attribute.name;
			this.loadAttrName = attribute.name;
			this.loadValue = this.loadAttrType == 'boolean' ? '' : attribute.value;
			this.attributeButtonDisabled = this.loadAttrType != 'boolean' && !this.loadValue;
		}
	};

	public addAttribute () {
		let hasIconAttrs = ['Hazardous', 'High Value', 'Fragile'];

		this.loadAttributes.push({
			name: this.loadAttrName,
			value: this.loadValue,
			hasIcon: !!(hasIconAttrs.indexOf(this.loadAttrName) + 1)
		});

		this.loadValue = null;
		this.loadAttrName = null;
		this.loadAttrType = 'string';
		this.stringValue = '';
		this.attributeButtonDisabled = true;
	};

	public removeAttribute (index) {
		this.loadAttributes.splice(index, 1);
	};

	private deleteLoad () {
		if (confirm('This load will be deleted permanently. Are you sure?')) {
			this.loadsService
				.deleteLoad(this.loadId)
				.then(this.afterDelete.bind(this));	
		}
	};

	private afterDelete (res) {
		if (res) {
			if (this.lastUrl.name == 'Loads') {
				this.router.navigate([this.lastUrl.name,  this.lastUrl.params]);		
			} else {
				this.router.navigate(['Loads', {divId: this.divisionId}]);
			}
		}
	}

	private goToTable (res) {
		if (res) {
			let body = res.json();
			if (body && body.id && this.lastUrl.name == 'Loads') {
				this.localStorageService.setItem('selectedItem', body.id);	
			}

			// it's after error, go to loads, cuz we have no idea, what the last url is.
			if (this.lastUrl.name == 'Signin') {
				this.router.navigate(['Loads', {divId: this.divisionId}]);
			} else {
				this.router.navigate([this.lastUrl.name,  this.lastUrl.params]);		
			}

		} else {
			// this is error -- save payload.
			this.localStorageService.setItem('loadItem', JSON.stringify(this.serializeLoad()));
		}
	};

	private goToTableWithoutCheck (res) {
		if (res) {
			this.router.navigate([this.lastUrl.name,  this.lastUrl.params]);
		}
	}

	private deserealizeFromLocalStorage (body) {
        let hasIconAttrs = ['Hazardous', 'High Value', 'Fragile'];        
		this.bolNumber = body.bolNumber;
        this.rate = body.rate;
        this.tracking = body.loadTracking;
		this.carrierLoadNumber = body.carrierLoadNumber;
		this.brokerLoadNumber = body.brokerLoadNumber;
		this.freightTerms = body.freightTerms;
		this.carrierSpecialInstructions = body.carrierSpecialInstructions;
		this.loadAttributes = body.loadAttributes && body.loadAttributes.map((attr)=>({
			name: attr.key,
			value: attr.value,
			hasIcon: !!(hasIconAttrs.indexOf(attr.key) + 1)

		}));

		this.shipments = body.shipments;
		this.stops = body.stops;

		if (this.shipments) {
			this.shipments = this.shipments.map((shipment)=>{
				if (shipment.packages) {
					shipment.packages = shipment.packages.map((pack)=>{
						pack.heightMeasure = pack.sizeUnit;
						pack.weightMeasure = pack.weightUnit;
						pack.volumeMeasure = pack.sizeUnit == 'ft' ? 'ft³': 'cm³';

						return pack;
					});
				}

				return shipment;
			});
		};

		if (this.stops) {
			this.stops = this.stops.map((stop)=>{
				stop.addressLines = stop.addressLines && stop.addressLines.map((adr)=>({
					val: adr
				}));

				if (stop.id) {
					stop._id = stop.id;
				}

				return stop;
			});
		} else {
			this.stops = [];
		}

		this.stops.sort((a,b) => a.stopNum - b.stopNum);

		this.recalculateSkeleton();
	};

	private deserealizeLoad (res) {
		if (res) {
			let body = res.json();

            let hasIconAttrs = ['Hazardous', 'High Value', 'Fragile'];
                        
			this.bolNumber = body.bolNumber;
            this.rate = body.rate;
            this.tracking = body.loadTracking;
			this.carrierLoadNumber = body.carrierLoadNumber;
			this.brokerLoadNumber = body.brokerLoadNumber;
			this.freightTerms = body.freightTerms;
			this.carrierSpecialInstructions = body.carrierSpecialInstructions;
			this.loadAttributes = body.loadAttributes && body.loadAttributes.map((attr)=>({
				name: attr.key,
				value: attr.value,
				hasIcon: !!(hasIconAttrs.indexOf(attr.key) + 1)

            }));
            
            if (this.isCarrier || this.isCommonCarrier)
            {
                this.readOnly = this.brokerLoadNumber != "";                
            }            

			this.shipments = body.shipments;

			for (let i = 0, length = body.stops && body.stops.length; i < length; i++) {
				let foundPickUpShipment = this.shipments.filter((shipment)=>{
					return shipment.pickup == body.stops[i].id || shipment.pickup == body.stops[i].stop_id || shipment.pickup == body.stops[i]._id;
				});
				let foundDropOffShipment = this.shipments.filter((shipment)=>{
					return shipment.dropoff == body.stops[i].id || shipment.dropoff == body.stops[i].stop_id || shipment.dropoff == body.stops[i]._id;

				});

				if (!foundPickUpShipment.length && !foundDropOffShipment.length) {
					body.stops[i].isService = true;
				}
			}

			this.stops = body.stops;

			if (this.shipments) {
				this.shipments = this.shipments.map((shipment)=>{
					if (shipment.packages) {
						shipment.packages = shipment.packages.map((pack)=>{
							pack.heightMeasure = pack.sizeUnit;
							pack.weightMeasure = pack.weightUnit;
							pack.volumeMeasure = pack.sizeUnit == 'ft' ? 'ft³': 'cm³';

							return pack;
						});
					}

					return shipment;
				});
			};

			if (this.stops) {
				this.stops = this.stops.map((stop)=>{
					stop.addressLines = stop.addressLines && stop.addressLines.map((adr)=>({
						val: adr
					}));

					if (stop.id) {
						stop._id = stop.id;
					}

					return stop;
				});
			} else {
				this.stops = [];
			}

			this.stops.sort((a,b) => a.stopNum - b.stopNum);

			this.recalculateSkeleton();
			this.loading = false;
		}
    };    

	private serializeLoad () {
		let stops = this.stops && this.stops.map((stop)=>{
			let resultStop = Object.assign({}, stop);

			resultStop.addressLines = stop.addressLines && stop.addressLines.map((addr)=>addr.val);

			stop.id = stop._id;

			//cleans up number to send to backend
			resultStop.phoneNumber = resultStop.phoneNumber.replace(/-/g, '');

			delete resultStop.dropoffShipments;
			delete resultStop.pickupShipments;
			delete resultStop.invalid;
			delete resultStop.truckLoad;
			delete resultStop.errors;

			return resultStop;
		});

		let shipments = this.shipments && this.shipments.map((shipment)=>{

			if (shipment.packages) {
				shipment.packages = shipment.packages.map((pack)=>{
					pack.sizeUnit = pack.heightMeasure;
					pack.weightUnit = pack.weightMeasure;
					
					delete pack.volumeMeasure;
					delete pack.weightMeasure;
					delete pack.heightMeasure;

					return pack;
				});	
			}

			delete shipment.errors;
			
			return shipment;
		});


        let load = {
            
			id: this.loadId,
            rate: this.rate,            
			carrierLoadNumber: this.carrierLoadNumber,
			brokerLoadNumber: this.brokerLoadNumber,
			freightTerms: this.freightTerms,
			carrierSpecialInstructions: this.carrierSpecialInstructions,
			loadAttributes: this.loadAttributes && this.loadAttributes.map((attr)=>({
				key: attr.name,
				value: attr.value
			})),
			shipments: shipments,
			stops: stops,
            bolNumber: this.bolNumber,
            loadTracking: this.tracking
        };
        

        if (this.isCarrier || this.isCommonCarrier) {
			load['carrierId'] = this.divisionId;
			load['CarrierFleetId'] = this.divisionCode;
		} else {
            load['brokerId'] = this.divisionId;           
			load['BrokerFleetId'] = this.divisionCode;
        }
        
		return load;
    };



	public valid () {
		this.loadValidationErrors = {};

        if (this.isCarrier || this.isCommonCarrier) {
			this.loadValidationErrors = {
				carrierLoadNumber: !this.carrierLoadNumber
			};

            return !!this.carrierLoadNumber && !!this.emailValid;
        } else {
          
			this.loadValidationErrors = {
				brokerLoadNumber: !this.brokerLoadNumber,
				rate: !this.rate
			};

            return !!this.brokerLoadNumber && !!this.rate && !!this.emailValid;
		}
    }
 

	public getNotifications () {
		this.loadsService.getNotifications(this.loadId).then(this.extractEmails.bind(this));
	}

	public extractEmails (res) {
		if (res) {
			let body = res.json();

			this.emailsList = body.subscribers.map((val)=>val.email);
		}
	}

	public saveNotifications (loadRes) {

        if (loadRes) {
            let body = loadRes.json();
            this.loadId = body.id;

            let notifications = this.emailsList.map((value) => ({
                label: value,
                email: value,
                events: this.standartEvents
            }));

            this.loadsService.saveNotifications(this.loadId, notifications).then(() => {
                this.goToTable(loadRes);
            });
        }
	}

	public saveLoad () {
		let load = this.serializeLoad();
		this.submitting = true;

		this.dontCheck = true;

		if (this.loadId) {
			if (this.valid()) {
				if(this)
				this.loadsService
					.saveLoad(load)
					.then(this.saveNotifications.bind(this))
					.catch(this.validationErrorHandler.bind(this));
			} else{
				console.error("Error Unknown");
			}
			
		} else {
			if (this.valid()) {
				
				this.loadsService
					.createLoad(load)
                    .then(
                        this.saveNotifications.bind(this)
                        )
					.catch(this.validationErrorHandler.bind(this));
			} else {
				console.error("Error Unknown");
			}
		}
		return false;
	};

 

	private validationErrorHandler (error) {
		if (error) {
			let body = error.json();

            this.errorMessage = body.errorMessage;
            if (body.details) {
                this.errors = body.details;
                this.loadErrors = body.details.filter(er => er.entityType == 'load');
            } 
		}
	};

	private extractAttributes (res) {
		if (res) {
			let body = res.json();	

			this.allAttributes = body;
		}
	};

	public selectDateShipment (date, type) {
		if (type == 'pickup') {
			if (date != '') {
				this.currentStopPickUp.date = moment(date, 'M/D/YYYY').format('M/D/YYYY');	
			} else {
				this.currentStopPickUp.date = date;
			}
			if (!this.currentStopPickUp.time) this.currentStopPickUp.time = '00:00';
		} else {
			if (date != '') {
				this.currentStopDropOff.date = moment(date, 'M/D/YYYY').format('M/D/YYYY');
			} else {
				this.currentStopDropOff.date = date;
			}
			if (!this.currentStopDropOff.time) this.currentStopDropOff.time = '00:00';
		}
	};

	public timeSelectedStop (stop, time) {
		if (stop) {
			stop.time = time;
			//formate  the time just to make sure it correct again.
			stop.timeStamp = this.addTimeStamp(stop);
			stop.time = this.formateTime(stop.timeStamp, null);	
		}
	};

	public selectDateStop (stop, date) {
		if (date != '') {
			stop.date = moment(date, 'M/D/YYYY').format('M/D/YYYY');
		} else {
			stop.date = date;
		}
	};

	// not needed we are already have two way binding to currentStopPickUp & currentStopDropOff model
	// public timeSelectedShipment (time, type) {
	// 	if (type == 'pickup') {
	// 		this.currentStopPickUp.time = time;
	// 	} else {
	// 		this.currentStopDropOff.time = time;
	// 	}
	// };

	public createPackage () {
		if (!this.currentShipment.packages) {
			this.currentShipment.packages = [];
		}

		this.currentShipment.packages.push({
			heightMeasure: 'ft',
			weightMeasure: 'lb',
			volumeMeasure: 'ft³',
			type: 'box',
			quantity: '',
			height: '',
			volume: '',
			weight: '',
			freightClass: ''
		});
	};

	public removePackage (index) {
		this.currentShipment.packages.splice(index, 1);
	}

	public createOrder () {
		if( !this.currentShipment.orders ) {
			this.currentShipment.orders = [];
		}

		this.currentShipment.orders.push({
			orderNumber: '',
			purchaseOrderNumber: ''
		});
	};

	public removeOrder (index) {
		this.currentShipment.orders.splice(index, 1);
	};

	public getAffectedShipments (stop) {
		let affectedShipments = [];

		for (let shipment of this.shipments) {
			if (shipment.pickup == stop._id || shipment.dropoff == stop._id) {
				affectedShipments.push(shipment);
			}
		}

		return affectedShipments;
	};

	public cleanStops () {
		let newStops = [];
		let index = 0;

		for (let i = 0, length = this.stops && this.stops.length; i < length; i++) {
			let foundPickUpShipment = this.shipments.filter((shipment)=>shipment.pickup == this.stops[i]._id);
			let foundDropOffShipment = this.shipments.filter((shipment)=>shipment.dropoff == this.stops[i]._id);

			if (this.stops[i].isService || foundPickUpShipment.length || foundDropOffShipment.length) {
				newStops.push(this.stops[i]);
				newStops[index].stopNum = index;
				index++;
			}
		}

		this.stops = newStops;

		this.stops.sort((a,b) => a.stopNum - b.stopNum);
	};

	public removeShipment () {
		let found = this.shipments.findIndex((shipment)=>this.currentShipment.id ? this.currentShipment.id == shipment.id : this.currentShipment._id == shipment._id);

		if (found != -1) {
			this.shipments.splice(found, 1);
			this.cleanStops();
			this.recalculateSkeleton();
		}
	};

	public startEditShipment (shipment) {
        let stop;
        
        this.currentShipment = Object.assign({}, shipment);
        this.currentShipment.packages = (JSON.parse(JSON.stringify(shipment.packages)));
        

		stop = this.stops.find((stop)=>this.currentShipment.pickup == stop._id);
		this.currentStopPickUp = Object.assign({}, stop);

		this.currentStopPickUp.addressLines = new Array(stop.addressLines.length);
		this.currentStopPickUp._id = this.generateTempId();

		for (let i = 0; i < stop.addressLines.length; i++) {
			this.currentStopPickUp.addressLines[i] = Object.assign({}, stop.addressLines[i]);
		}

		// clone another stop
		stop = this.stops.find((stop)=>this.currentShipment.dropoff == stop._id);

		this.currentStopDropOff = Object.assign({}, stop);
		this.currentStopDropOff._id = this.generateTempId();

		this.currentStopDropOff.addressLines = new Array(stop.addressLines.length);

		for (let i = 0; i < stop.addressLines.length; i++) {
			this.currentStopDropOff.addressLines[i] = Object.assign({}, stop.addressLines[i]);
		}

		this.currentShipment.pickup = this.currentStopPickUp._id;
		this.currentShipment.dropoff = this.currentStopDropOff._id;
	};

    public updateShipment() {
       
		let shipmentIdx = _.findIndex(this.shipments, (shpmnt)=>{
			return ((shpmnt._id && shpmnt._id == this.currentShipment._id) || (shpmnt.id && shpmnt.id == this.currentShipment.id))
		});

		this.shipments[shipmentIdx] = this.currentShipment;
		
		let stop = this.findStop(this.currentStopDropOff);

		// this is existing  stop
		if (stop._id != this.currentStopDropOff._id) {
			this.currentStopDropOff = this.findStop(this.currentStopDropOff);
			this.currentShipment.dropoff = this.currentStopDropOff._id;
		} else {
			this.errors = _.filter(this.errors, (err:any)=> err.entityType == 'load'  || (err.objectId != this.currentStopDropOff.id && err.objectId != this.currentStopDropOff._id && err.objectId != this.currentStopDropOff.stop_id));
			this.addStop(this.currentStopDropOff, null);
		}

		stop = this.findStop(this.currentStopPickUp);
		// this is existing stop
		if (stop._id != this.currentStopPickUp._id) {
			this.currentStopPickUp = this.findStop(this.currentStopPickUp);
			this.currentShipment.pickup = this.currentStopPickUp._id;
		} else {
			this.errors = _.filter(this.errors, (err:any)=> err.entityType == 'load'  || (err.objectId != this.currentStopPickUp.id && err.objectId != this.currentStopPickUp._id && err.objectId != this.currentStopPickUp.stop_id));
			this.addStop(this.currentStopPickUp, null);
		}


		this.errors = _.filter(this.errors, (err:any)=>err.entityType == 'load' || ((err.objectId != this.currentShipment.id) && (err.objectId != this.currentShipment._id)));
		this.shipments[shipmentIdx].errors = [];
		this.currentShipment.errors = [];

		this.cleanStops();
		this.recalculateSkeleton();
	};

	public getValue(shipments, type, isImperial) {
        let total = 0;
        
		if (shipments) {
			for (let shipment of shipments) {
				for (let pack of shipment.packages) {
					if (type != 'quantity') {
						if (pack.sizeUnit == 'cm' || pack.weightUnit == 'kg' || pack.heightMeasure == 'cm') {
							if (!isImperial) {
								total += pack.quantity * pack[type];		
							}
						} else {
							if (isImperial) {
								total += pack.quantity * pack[type];
							}
						}
					} else {
						total += +pack.quantity;
					}
				}
			}			
		}

		return total;
	};

    public recalculateSkeleton() {        
		let prevStop;
		this.validationError = false;

		for (let stop of this.stops) {
			let foundPickUpShipment = this.shipments.filter((shipment)=>shipment.pickup == stop._id);
			let foundDropOffShipment = this.shipments.filter((shipment)=>shipment.dropoff == stop._id);

			let totalWeightOnStopImperial = this.getValue(foundPickUpShipment, 'weight', true) - this.getValue(foundDropOffShipment, 'weight', true);
			let totalVolumeOfStopImperial = this.getValue(foundPickUpShipment, 'volume', true) - this.getValue(foundDropOffShipment, 'volume', true);

			let totalWeightOnStopDecimal = this.getValue(foundPickUpShipment, 'weight', false) - this.getValue(foundDropOffShipment, 'weight', false);
			let totalVolumeOfStopDecimal = this.getValue(foundPickUpShipment, 'volume', false) - this.getValue(foundDropOffShipment, 'volume', false);


			if (prevStop) {
				stop.truckLoad = {
					weightImperial: prevStop.truckLoad.weightImperial + totalWeightOnStopImperial,
					volumeImperial: prevStop.truckLoad.volumeImperial + totalVolumeOfStopImperial,
					weightDecimal: prevStop.truckLoad.weightDecimal + totalWeightOnStopDecimal,
					volumeDecimal: prevStop.truckLoad.volumeDecimal + totalVolumeOfStopDecimal,
					showDecimal: prevStop.truckLoad.volumeDecimal > 0 || prevStop.truckLoad.weightDecimal > 0,
					showImperial: prevStop.truckLoad.weightImperial > 0 || prevStop.truckLoad.volumeImperial > 0
				}
			} else {
				stop.truckLoad = {
					weightImperial: totalWeightOnStopImperial,
					volumeImperial: totalVolumeOfStopImperial,
					weightDecimal: totalWeightOnStopDecimal,
					volumeDecimal: totalVolumeOfStopDecimal,
					showDecimal: totalWeightOnStopDecimal > 0 || totalVolumeOfStopDecimal > 0,
					showImperial: totalVolumeOfStopImperial > 0 || totalWeightOnStopImperial > 0
				}
            }
            
			stop.pickupShipments = foundPickUpShipment || [];
			stop.dropoffShipments = foundDropOffShipment || [];
			stop.invalid = false;

			// now validate all stops
			if (prevStop) {
				if (+moment(prevStop.date, 'M/D/YYYY') > +moment(stop.date, 'M/D/YYYY')) {
					stop.invalid = true;
					prevStop.invalid = true;
					
					this.validationError = 'Date of next stop can’t be earlier than previous'
				} else {
					stop.invalid = false;
				}	
			}
			

			prevStop = stop;

		}

		for (let shipment of this.shipments) {
			if (shipment.dropoff && shipment.pickup) {
				let dropOffStop = this.stops.find((stop)=>stop._id == shipment.dropoff);
				let pickUpStop = this.stops.find((stop)=>stop._id == shipment.pickup);

				if (pickUpStop && dropOffStop) {
					if (!!dropOffStop.date && !!pickUpStop.date) {
						if (+moment(dropOffStop.date, 'M/D/YYYY') < +moment(pickUpStop.date, 'M/D/YYYY')) {
							dropOffStop.invalid = true;
							pickUpStop.invalid = true;

							this.validationError = 'Date of next stop can’t be earlier than previous'

						}
					}

					if (dropOffStop.stopNum < pickUpStop.stopNum) {
						dropOffStop.invalid = true;
						pickUpStop.invalid = true;

						this.validationError = 'Drop off Stop can’t be moved before Pick Up Stop';
					}
				}
			}

		}
	};

	// TODO: move to Stop model
	public findStop (stopToFind) {
		let found;

		found = this.stops.find((stop) => {
			//
			for(let i = 0; i <  stop.addressLines.length; i ++ ) {
                if (stop.addressLines[i] && stopToFind.addressLines[i] && stop.addressLines[i].val != stopToFind.addressLines[i].val) {
					return false;
				};
			} 

			if (stop.date != stopToFind.date ||
				stop.time != stopToFind.time ||
				stop.city != stopToFind.city ||
				stop.state != stopToFind.state ||
				stop.country != stopToFind.country ||
				stop.postalCode != stopToFind.postalCode ||
				stop.contactName != stopToFind.contactName ||
				stop.company != stopToFind.company ||
				stop.phoneNumber != stopToFind.phoneNumber
			) {
				return false;
			}

			return true;
		});

		//mix in timestamp
		var outPutFound = found ? found : stopToFind;
		outPutFound.timeStamp = this.addTimeStamp(outPutFound);
		outPutFound.time = this.formateTime(outPutFound.timeStamp, null);

		return outPutFound;
	};

	private formateTime(timeStamp: number, format: string){
		if(format){
			return moment.unix(timeStamp).format(format);
		}
		return moment.unix(timeStamp).format("hh:mm A");
	};

	private addTimeStamp(aStop: any){
		return aStop.timeStamp = moment(aStop.date +
				 '-' + aStop.time, 'M/D/YYYY-hh:mm').unix();
	};

	public moveStop (stop, direction) {
		let dx = direction == 'up' ? -1 : 1;
		let stopIdx = this.stops.findIndex((stp)=>((stop._id && stop._id == stp._id) || (stop.id && stop.id == stp.id)));

		this.stops[stopIdx].stopNum += dx;
		this.stops[stopIdx + dx].stopNum -= dx;
		this.stops.sort((a,b) => a.stopNum - b.stopNum);
		this.recalculateSkeleton();

	};

	public removeServiceStop () {
		let stopIdx = this.stops.findIndex((stp)=>((this.currentServiceStop._id && this.currentServiceStop._id == stp._id) || (this.currentServiceStop.id && this.currentServiceStop.id == stp.id) || (this.currentServiceStop.stop_id && this.currentServiceStop.stop_id == stp.stop_id)));

		if (stopIdx != -1) {
			this.stops.splice(stopIdx, 1);	
		}

		this.stops.sort((a,b) => a.stopNum - b.stopNum);
		this.recalculateSkeleton();
		
	};

	public addStop (stop, idx) {
		if (idx || idx === 0) {
			let i = 0;

			// add to idx, and shift stopnum
			this.stops.splice(idx, 0, stop);

			for (let i = 0, length = this.stops && this.stops.length; i < length; i++) {
				this.stops[i].stopNum = i;
			}
		} else {
			let index = 0;

			// find idx and add and shift stopnum
			for (let i = 0, length = this.stops && this.stops.length; i < length; i++) {

				//old way
				// if (+moment(stop.date, 'M/D/YYYY') > +moment(this.stops[i].date, 'M/D/YYYY') || !this.stops[i].date || !stop.date) {
				// 	index = i + 1;
				// } else {
				// 	break;
				// }

				if (stop.timeStamp > this.stops[i].timeStamp || !this.stops[i].date || !stop.date) {
					index = i + 1;
				} else {
					break;
				}
			}

			this.addStop(stop, index);
		}


		this.stops.sort((a,b) => a.stopNum - b.stopNum);
		this.recalculateSkeleton();		
	};

	/**
	 * From form submittion add a shipment to shipment list.
	 */
    public addShipment() {

    	let stop = this.findStop(this.currentStopDropOff);
    	this.timeValue = '';

		if (stop._id != this.currentStopDropOff._id) {
			this.currentStopDropOff = this.findStop(this.currentStopDropOff);
			this.currentShipment.dropoff = this.currentStopDropOff._id;
		} else {
			this.addStop(this.currentStopDropOff, null);
		}

		stop = this.findStop(this.currentStopPickUp);

		if (stop._id != this.currentStopPickUp._id) {
			this.currentStopPickUp = this.findStop(this.currentStopPickUp);
			this.currentShipment.pickup = this.currentStopPickUp._id;
		} else {
			this.addStop(this.currentStopPickUp, null);
		}

		this.currentShipment._id = this.generateTempId();
		this.shipments.push(this.currentShipment);


		this.currentShipment = {};
		this.currentStopDropOff = {};
		this.currentStopPickUp = {};

		this.recalculateSkeleton();
        this.detailsOpened = false;
        return false;
	};


	public mergeStops (stop1, stop2) {
		let stop = Object.assign({}, stop1);

		stop._id = this.generateTempId();

		for (let shipment of this.shipments) {
			if (shipment.pickup == stop1._id || shipment.pickup == stop2._id) {
				shipment.pickup = stop._id;
			}

			if (shipment.dropoff == stop1._id || shipment.dropoff == stop2._id) {
				shipment.dropoff = stop._id;
			}
		}

		return stop;
	};

	public updateStop() {
        // Links. links is everywhere. 
        
		let stopIdx = this.stops.findIndex((stop)=>(stop._id && stop._id == this.currentStop._id) || (stop.id && stop.id == this.currentStop.id));

		if (stopIdx != -1) {
			if (this.currentStop._id == this.findStop(this.currentStop)) {
				this.stops[stopIdx] = this.currentStop;	
			} else {
				this.stops[stopIdx] = this.mergeStops(this.currentStop, this.findStop(this.currentStop));
			}
		}

		this.errors = _.filter(this.errors, (err:any)=> err.entityType == 'load'  || (err.objectId != this.currentStop.id && err.objectId != this.currentStop._id && err.objectId != this.currentStop.stop_id));
		this.stops[stopIdx].errors = [];
		this.currentStop.errors = [];
		this.recalculateSkeleton();
		this.cleanStops();
	};

	public showButtons () {
		this.serviceStopButtonsDisabled = false;
	}

	public selectStop (stop) {
		this.currentStop = Object.assign({}, stop);

		if (stop.addressLines.length) {
			// address line is linked, because single addressLine is object. So, create new addressLines
			this.currentStop.addressLines = new Array(stop.addressLines.length);
		} else {
			this.currentStop.addressLines = [{
				val: ''
			}, {
				val: ''
			}];
		}

		for (let i = 0; i < stop.addressLines.length; i++) {
			this.currentStop.addressLines[i] = Object.assign({}, stop.addressLines[i]);
		}

		this.timeValue = this.formateTime(stop.timeStamp, 'hh:mm') || '00:00:00';

		if (stop.isService) {
			this.currentServiceStop = this.currentStop;
		}
	};

	//// 
	public createServiceStop () {
		this.serviceStopButtonsDisabled = true;

		this.currentServiceStop._id = this.generateTempId();

		this.addStop(this.currentServiceStop, this.prevStop.stopNum + 1);

		this.currentServiceStop = {};

	};

	////
	public updateServiceStop () {
		// Links. links is everywhere. 
		this.serviceStopButtonsDisabled = true;

		let stopIdx = this.stops.findIndex((stop)=>(stop._id && stop._id == this.currentStop._id) || (stop.id && stop.id == this.currentStop.id));

		if (stopIdx != -1) {
			this.stops[stopIdx] = this.currentServiceStop;
		}

		this.errors = _.filter(this.errors, (err:any)=>err.entityType == 'load' || (err.objectId != this.currentServiceStop.id && err.objectId != this.currentServiceStop._id && err.objectId != this.currentServiceStop.stop_id));
		this.currentServiceStop.errors = [];
		this.stops[stopIdx].errors = [];
		this.recalculateSkeleton();
		this.cleanStops();
	}

	public newServiceStop(prevStop) {
		this.prevStop = prevStop;
		this.currentServiceStop = {
			isService: true,
			// Because ng2 cant handle primitive values inside ngModel in ngFor;
			addressLines: [{
				val: ''
			}, {
				val: ''
			}],
			time: '12:00 PM',
			date: null

		}
	};

	public setMeasurement (pack, measurment) {
		let imperialMeasure = this.imperialMeasurments.find((m)=> m == measurment) ? 0 : 1;
	
		pack.heightMeasure = this.heightUnits[imperialMeasure];
		pack.weightMeasure = this.weightUnits[imperialMeasure];
		pack.volumeMeasure = this.volumeUnits[imperialMeasure];
	};

	public addAddressLine (item) {
		if (item.addressLines) {
			if (item.addressLines.length < 4) {
				item.addressLines.push({val:''});	
			}
		} else {
			item.addressLines = [];
		}
    };
   

	// TODO: move to Shipment model
	public createShipment () {
		this.currentStopPickUp = {
			_id: this.generateTempId(),
			// Because ng2 cant handle primitive values inside ngModel in ngFor;
			addressLines: [{
				val: ''
			}, {
				val: ''
			}],
			truckLoad: {
				weight: 0,
				volume: 0
			},
			dropoffShipments: [],
			pickupShipments: [],
			time: null,
			country: 'USA'
		};

		this.currentStopDropOff = {
			_id: this.generateTempId(),
			addressLines: [{
				val: ''
			}, {
				val: ''
			}],
			truckLoad: {
				weight: 0,
				volume: 0
			},
			dropoffShipments: [],
			pickupShipments: [],
			time: null,
			country: 'USA'
		}

		this.currentShipment = {
			packages: [],
			orders: [],
			pickup: this.currentStopPickUp._id,
			dropoff: this.currentStopDropOff._id,
		};

		this.timeValue = '';
	};
}
