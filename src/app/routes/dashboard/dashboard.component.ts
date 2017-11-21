import { Component, OnInit } from '@angular/core';
import { UserService, Config } from '../../services/index';
import { ROUTER_DIRECTIVES, Router, RouteParams } from '@angular/router-deprecated';
import { RangePickerDirective } from '../../directives/rangepicker/rangepicker.directive';
import { DriversComponent } from '../../components/drivers/drivers.component';
import { AttributesComponent } from '../../components/attributes/attributes.component';
import { DropdownComponent } from '../../components/dropdown/dropdown.component';
import { MessagesDirective } from '../../directives/index';
import { Observable } from 'rxjs/Observable';

import { DashboardService, DivisionService, LoadsService, LocalStorageService } from '../../services/index';
import * as moment from 'moment';
import { StatusFilterConst } from '../../constants/index';



declare var $: JQueryStatic;
declare var L: any;

@Component({
    selector: 'dashboard',
    template: require('./dashboard.component.html'),
    directives: [ROUTER_DIRECTIVES, MessagesDirective, RangePickerDirective, DriversComponent, AttributesComponent, DropdownComponent],
    providers: [DashboardService, DivisionService, LoadsService]
})

export class DashboardComponent implements OnInit {
	private isCarrier: boolean;
	private filterStatus: any = [];
	private markers:any = [];

	private loading: boolean;

	private rawLocations: any = [];

	private statusFilters = StatusFilterConst;
	private divisionId: number;
	private mode:string = 'map';
	private statistics: Array<any> = [];
	private filters: any = {};
	private locations: Array<any> = [];
	private map: any;
	private load: any = {};
	private driver: any = {};
	private activePoint: any;
	private filterDateShipping = {
		startDate: moment().toDate(),
		endDate:  moment().add(1, 'w').toDate()
	};
	private filterDateDelivery = {
		startDate: moment().toDate(),
		endDate:  moment().add(1, 'w').toDate()
	};

	private locationFilter:any = 'shipping';
	private driverFilter: any = 'intransit';

	private shippingLocations: boolean = true;
	private deliveryLocations: boolean = true;
	private availableDrivers: boolean = true;
	private intransitDrivers: boolean = true;
	private brokerInstructionsAttributeName = '!BrokerInstructions';

	public arrowMarker:any = [];
	public driversNumber: number = 0;
	public loadsNumber;
	private mapKey = Config.mapquestkey;

	constructor(
		private userService:UserService, 
		private router: Router,
		private dashboardService: DashboardService,
		private routeParams: RouteParams,
		private loadsService: LoadsService,
		private divisionService: DivisionService,
		private localStorageService: LocalStorageService
	) {};

	private getClass(stat) {
		let className;

		if (stat.type == 'loads') {
			className = 'label-link';

			switch (stat.label) {
				case 'In transit loads':
					className += ' -with-marker -marker-transit';
					break;

				case 'Assigned loads':
					className += ' -with-marker -marker-assigned';
					break;

				case 'Offered loads':
					className += ' -with-marker -marker-offered';
					break;

				case 'Declined loads':
					className += ' -with-marker -marker-declined';
					break;

				case 'Available loads':
					className += ' -with-marker -marker-available';
					break;

			};

			return className;	
		}
	};

	public setFavorite (entity) {
		this.divisionService.setAsFavorite(this.divisionId, entity.id, entity.isFavorite);
	};

	public filterChanged(value, type) {
		if (type == 'shipping') {
			this.filterDateShipping = value;	
		} else {
			this.filterDateDelivery = value;	
		}
		
	};	

	public statusChanged (value) {
		this.filterStatus = value;
	};

	public apply () {
		this.filterLocations();
	};

	private setCarrier (user) {
        let found;

        if (user.divisions) {
            found = user.divisions.find((div) => {
                return div.id == +this.divisionId
            });

            if (found) {
                this.isCarrier = found.type == 'carrier';
            } else {
                this.router.navigate(['ErrorDivision', { divId: this.divisionId }]);
            }
        }
	};

	private parseStats(res) {
		if (res) {
			this.statistics = res.text() && res.json();
		}
	};

	private filterFunc (location) {
		//let result = false;
		if (this.driverFilter == 'intransit' && location.type == 'intransitDriver') {
			return true;
		}

		if (this.driverFilter == 'available'  && location.type == 'availableDriver') {
			return true;
		}

		if (this.locationFilter == 'delivery' && location.type == 'deliveryLoc') {
			return true;
		}

		if (this.locationFilter == 'shipping' && location.type == 'shippingLoc') {
			return true;
		}

		return false;
	};

    private applyCheckboxes(event, type) {
		this[event.currentTarget.name] = event.currentTarget.value;
		this.locations = this.rawLocations.filter(this.filterFunc.bind(this));

		this.drawPoints(false);

	};

	/**
	 * checks if location long and lat and grabs from backend if needed.
	 * @param {[object]} res res from the server
	 */
	private getCheckGeoLocations(res){
		if(!res) return false;
	
		let locations = res.text() && res.json();
		let points = locations.loadPoints.concat(locations.driverPoints);

		let geoLocations = Observable.create(function(observer) {
			
			var count = points.length;
			while(points.length > 0){
				let point = points.pop();
					if(point.latitude === 0 || point.longitude === 0 ){
						this.loadsService.getStops(point.id, this.filters)
							.then((ares) => {
								let aPoint = ares.text() && ares.json();
								observer.next({original: point, found: aPoint});
								count --;
								if(count === 0){
									observer.complete();
								}
							});
					}else{
						observer.next({original: point, found: null});
						count --;
						if(count === 0){
							observer.complete();
						}
					}
			}	
		}.bind(this));

		let subscribe = geoLocations.subscribe(obj => {
			let foundLocation = obj.found;
			let originalLocation = obj.original;
			if(foundLocation){
				originalLocation.latitude = +foundLocation.to.latitude;
				originalLocation.longitude = +foundLocation.to.longitude;
			}

			this.parseAndAddLocation(originalLocation);
		}, (error) => {
			console.error(error);
		},() => {
			// console.log("Map loading completed");
		});

		this.loading = false;
		//old code;
		// this.parseLocations(res);
	};

	/**
	 * filters a location and places it on the map
	 * @param {[object]} location a point on the map.
	 */
	private parseAndAddLocation(location){
	
		if(this.filterFunc(location)){
			this.locations.push(location);
			this.driversNumber = this.locations.filter((loc)=>loc.type == 'availableDriver' || loc.type == 'intransitDriver').length;
			this.loadsNumber = this.locations.filter((loc)=>loc.type == 'deliveryLoc' || loc.type == 'shippingLoc').length;
			this.drawPoints(true);
			this.loading = false;
		}
	};

	/**
	 * DEPERCATED OLD
	 * @param {[responds]} res from the server
	 */
	private parseLocations(res) {
		if (res) {
			let locations = res.text() && res.json();

			this.rawLocations = locations.loadPoints.concat(locations.driverPoints);

			this.locations = this.rawLocations.filter(this.filterFunc.bind(this));



			this.driversNumber = this.locations.filter((loc)=>loc.type == 'availableDriver' || loc.type == 'intransitDriver').length;
			this.loadsNumber = this.locations.filter((loc)=>loc.type == 'deliveryLoc' || loc.type == 'shippingLoc').length;

			this.drawPoints(true);
			this.loading = false;
		}
	};

	private parseDriver (res) {
		if (res) {
			this.driver = res.text() && res.json();
		}
	};

	private parseLoad (res) {
		if (res) {
			this.load = res.text() && res.json();

			//filter out broker instruction attribute
			if (this.load.loadAttributes && this.load.loadAttributes.length) {
				this.load.loadAttributes = this.load.loadAttributes.filter((attr)=>{
					return attr.key != this.brokerInstructionsAttributeName;
				})
			}
		}
	};

	public goToStat (stat) {
		if (stat.type == 'loads') {
			let filterObj = {
				divId: this.divisionId
			};

			if (stat.filters && stat.filters.length) {
				for (let filter of stat.filters) {
					if (filter.param == 'status') {
						if (filter.value.indexOf(',') >= 0) {
							var statuses = [];
							for (let statFilter of this.statusFilters) {
								if (filter.value.indexOf(statFilter.text) >= 0) {
									statuses.push(statFilter.id);										
								}
							}
							filterObj['st'] = '[' + statuses.toString() + ']';
						}
						else {
							filterObj['st'] = JSON.stringify(this.statusFilters.filter((f)=>f.text == filter.value).map((f)=>f.id));
						}
					}

					if (filter.param == 'driverAssignee') {
						filterObj['adr'] = JSON.stringify([filter.value]);
					}

					if (filter.param == 'driverOffered') {
						filterObj['odr'] = JSON.stringify([filter.value]);
					}
				}
			};

			this.router.navigate(['Loads', filterObj]);
		};
	};

    public drawArrow(point) {
		this.arrowMarker = [];

		$('.leaflet-marker-icon').addClass('-none');

		this.arrowMarker.push(L.polyline([
				[point.latitude, point.longitude],
				[point.associatedLoad.latitude, point.associatedLoad.longitude]
			], {
				color: '#fcf7f7',
				weight: 11,
				opacity: 1,
				lineJoin: 'round'
			}).addTo(this.map));
			
		this.arrowMarker.push(
			L.polyline([
				[point.latitude, point.longitude],
				[point.associatedLoad.latitude, point.associatedLoad.longitude]
			], {
				color: '#63C4E8',
				weight: 5,
				opacity: 1,
				lineJoin: 'round'
		}).addTo(this.map));

		this.arrowMarker.push(L.marker([point.latitude, point.longitude], {
				icon: L.divIcon({
					iconSize: L.point(42, 54),
					className: 'icon-dashboard icon-driver-transit -active',
					iconAnchor: L.point(23, 55)
				})
			})
			.addTo(this.map)
			.on('click', (event) => this.setMode(point, event))
		);

		this.activePoint.associatedLoad.isVirtual = true;

		this.arrowMarker.push(L.marker([point.associatedLoad.latitude, point.associatedLoad.longitude], {
				icon: L.divIcon({
					iconSize: L.point(42, 54),
					className: 'icon-dashboard icon-location-delivery -active',
					iconAnchor: L.point(23, 55)
				})
			})
			.addTo(this.map)
			.on('click', (event) => this.setMode(point.associatedLoad, event))
		);
	};	

	public setMode (point, event) {
        if (!point.isVirtual) {
			$('.leaflet-marker-icon').removeClass('-active');
			$('.leaflet-marker-icon').removeClass('-none');

			for (let marker of this.arrowMarker) {
				this.map.removeLayer(marker);
			}

			this.arrowMarker = [];		
		}
	
		if (point.type != 'map') {
			let marker = $(event.originalEvent.target).addClass('-active');	
		};
		
		this.activePoint = point;

		switch (point.type) {
            case 'intransitDriver':
				if (!this.isCarrier) {
					this.mode = 'map';
				} else {
					this.mode = 'driver';
					this.drawArrow(point);	
				}

				break;
			case 'availableDriver':
				if (!this.isCarrier) {
					this.mode = 'map';
				} else {
					this.mode = 'driver';
				}				

				break;
			
			case 'shippingLoc':
			case 'deliveryLoc':
				this.mode = 'load';
				break;
			default:
				this.mode = 'map';
				break;
		};

		if (this.mode != 'driver' || this.isCarrier) {
			this.getDataForTab();
		}
	};

	public getDataForTab () {
		switch (this.mode) {
			case 'driver':
				this.driver = {};
				this.divisionService
					.getDriver(this.divisionId, this.activePoint.id)
					.then(this.parseDriver.bind(this))
				break;
			
			case 'load':
				this.load = {};

                this.loadsService
                    .getLoadSummary(this.activePoint.id, this.divisionId)
					.then(this.parseLoad.bind(this));
				break;

			case 'map':
				break;
			default:
				break;
		}
	};

	public getDate(date) {
		return moment(date).format('MMM DD, YYYY');
	};	

    public drawPoints(fitBounds) {

		if (this.markers && this.markers.length) {
            for (let marker of this.markers) {
                if (typeof this.map != 'undefined') {
                    this.map.removeLayer(marker);
                }
			};

			this.markers = [];
		}

		$('.leaflet-marker-icon').removeClass('-active');
		$('.leaflet-marker-icon').removeClass('-none');

		for (let marker of this.arrowMarker) {
			this.map.removeLayer(marker);
		}

		this.arrowMarker = [];


		for (let point of this.locations) {
			let className = 'icon-dashboard';

			switch (point.type) {
				case 'intransitDriver':
					className += ' icon-driver-transit';
					break;
				case 'availableDriver':
					className += ' icon-driver-available';
					break;
				
				case 'shippingLoc':
					className += ' icon-location-shipping';
					break;
				case 'deliveryLoc':
					className += ' icon-location-delivery';
					break;

			};

			let marker = L.marker([point.latitude, point.longitude], {
				icon: L.divIcon({
					iconSize: L.point(42, 54),
					className: className,
					iconAnchor: L.point(23, 55)
				})
			})
			.addTo(this.map)
			.on('click', (event) => this.setMode(point, event));


			if (!this.isCarrier && (point.type == 'intransitDriver' || point.type == 'availableDriver')) {
				marker.bindPopup('' +
	                '<div class="flex pt1 pb1">' +
	                    '<div>' +
	                        '<div class="medium">'+ point.carrier.name + '</div>' +
	                        '<div>' + point.carrier.code + '</div>' +
	                    '</div>' +
	                '</div>');
			};

            if (typeof marker != 'undefined') {
                this.markers.push(marker);
            }
		};

		if (fitBounds && this.locations.length) {
			this.map.fitBounds(this.locations.map((point)=>[point.latitude, point.longitude]));	
		}
	};

	public filterLocations () {
		this.filters.divisionId = this.divisionId;

		if (this.filterDateShipping && this.filterDateShipping.startDate && this.filterDateShipping.endDate) {
			this.filters.shippingDatesRange = moment(this.filterDateShipping.startDate).format('MM/DD/YYYY') + '-' + moment(this.filterDateShipping.endDate).format('MM/DD/YYYY');
			this.setFilterDates();
		} else {
			delete this.filters.shippingDatesRange;
		}


		if (this.filterDateDelivery && this.filterDateDelivery.startDate && this.filterDateDelivery.endDate) {
			this.filters.deliveryDatesRange = moment(this.filterDateDelivery.startDate).format('MM/DD/YYYY') + '-' + moment(this.filterDateDelivery.endDate).format('MM/DD/YYYY');
			this.setFilterDates();
		} else {
			delete this.filters.deliveryDatesRange;
		}

		if (this.filterStatus) {
			this.filters.status = this.filterStatus.map((f)=>f.text).join(',');
		}

		this.dashboardService
			.getLocations(this.filters)
			.then(this.getCheckGeoLocations.bind(this));
	};

    ngAfterViewChecked() {
	};

    public drawMap() {
        if (typeof this.map == 'undefined') {

        	if(typeof this.mapKey == 'undefined'){
        		this.map = {};
				this.map._loaded = false;
				return;
        	} else {
        		L.mapquest.key = this.mapKey;
        	}

			// set max boudns for map
			let southWest = L.latLng(-89.98155760646617, -180);
			let northEast = L.latLng(89.99346179538875, 180);
            let bounds = L.latLngBounds(southWest, northEast);

			this.map = L.mapquest.map('map', {
			  center: [ 39.828175, -98.5795 ], // center of US.
			  layers: L.mapquest.tileLayer('map'),
			  zoom: 4,
			  minZoom: 3, // 
			  maxBoundsViscosity: 1.0
			});

			if(!this.map || !this.map.hasOwnProperty('_loaded')){
				this.map = {};
				this.map._loaded = false;
				return;
			};

			this.map.setMaxBounds(bounds);

			this.map.on('click', (event) => this.setMode({type: 'map'}, event))
		} else {
			this.map.invalidateSize();
		}
	};

	setFilterDates () {
		this.localStorageService.setItem('dashboardDates', JSON.stringify({
			filterDateShipping: {
				startDate: moment(this.filterDateShipping.startDate).format('MM DD YYYY'),
				endDate: moment(this.filterDateShipping.endDate).format('MM DD YYYY')
			},
			filterDateDelivery: {
				startDate: moment(this.filterDateDelivery.startDate).format('MM DD YYYY'),
				endDate: moment(this.filterDateDelivery.endDate).format('MM DD YYYY')
			}
		}));
	}

	/**
	 *  Simple check if a user is authoized, for faster redirect to login.
	 */
	private checkUserAuthorization(){
		this.dashboardService
                .getAuthorized()
                .then((res) => {
                	let user = res.text() && res.json();
                	// console.log(user);
                }).catch((error) => {
                	console.error('token not authorized.');
                });

       return false;
	};

	ngOnInit () {
		let filteredDates = JSON.parse(this.localStorageService.getItem('dashboardDates'));

		this.checkUserAuthorization();

		if (filteredDates) {
			this.filterDateShipping = {
				startDate: moment(filteredDates.filterDateShipping.startDate, 'MM DD YYYY').toDate(),
				endDate:  moment(filteredDates.filterDateShipping.endDate, 'MM DD YYYY').toDate()
			};
			
			this.filterDateDelivery = {
				startDate: moment(filteredDates.filterDateDelivery.startDate, 'MM DD YYYY').toDate(),
				endDate:  moment(filteredDates.filterDateDelivery.endDate, 'MM DD YYYY').toDate()
			};
		} else {
			this.setFilterDates();
		}


		this.divisionId = +this.routeParams.params['divId'];
		this.userService.getUser(this.setCarrier.bind(this));
        this.loading = true;

        this.localStorageService.getItem('dashboardDates');
        
        this.drawMap();

        if (!isNaN(this.divisionId)) {
            this.dashboardService
                .getStatistics(this.divisionId)
                .then(this.parseStats.bind(this));

            this.filterLocations();
        }
	};
}
