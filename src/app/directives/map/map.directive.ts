import { Directive, ElementRef, Renderer, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import { Config } from '../../services/index';
import * as moment from 'moment';

declare var $: JQueryStatic;
declare var L: any;

@Directive({
  selector: '[map]'
})

export class MapDirective implements OnInit, OnChanges, OnDestroy {
	private el: HTMLElement;
	private id;
	private map;
	private popup;
	private mapKey = Config.mapquestkey;

	@Input() breadcrumbs:any = [];
	@Input() stops: any = [];
	@Input() nextStop: any = {};
	@Input() show:boolean = false;
	@Input() truck:any = {};
	@Input() loadError:boolean = false;

	ngOnInit () {
		
	};

	ngAfterViewChecked () {
		this.drawMap();
	};

    public drawMap() {
        if (typeof this.mapKey == 'undefined') {
        	this.loadError = true;
            return;
        }else{        	
        	L.mapquest.key = this.mapKey;
        }

		if (!this.map) {
			let southWest = L.latLng(-89.98155760646617, -180);
			let northEast = L.latLng(89.99346179538875, 180);
			let bounds = L.latLngBounds(southWest, northEast);

			this.map = L.mapquest.map('el' + this.id, {
			  center: [ 39.828175, -98.5795 ], // center of US.
			  layers: L.mapquest.tileLayer('map'),
			  zoom: 4,
			  minZoom: 3, // 
			  maxBoundsViscosity: 1.0
			});

			this.map.setMaxBounds(bounds);
			this.map.scrollWheelZoom.disable();

			this.loadError = !this.map._loaded;

		} else {
			this.map.invalidateSize();
		}
	};

	ngOnDestroy () {
		
	};

    public drawPolyline() {
        if (typeof this.mapKey == 'undefined') {
            return;
        }

		let breadcrumbs = this.breadcrumbs.map((b)=>b.coordinates);

		L.polyline(breadcrumbs, {
			color: '#fcf7f7',
			weight: 11,
			opacity: 1,
			lineJoin: 'round'
		})
		.addTo(this.map);

		L.polyline((breadcrumbs), {
			color: '#0D578E',
			weight: 5,
			opacity: 1,
			lineJoin: 'round',
			clickable: true
		})
		.addTo(this.map);

		let polyline = L.polyline((breadcrumbs), {
			color: '#000000',
			weight: 20,
			opacity: 0,
			lineJoin: 'round',
			clickable: true
		})
		.addTo(this.map);

		polyline.on('mouseover', this.mouseOverPolyline.bind(this));
		polyline.on('mousemove', this.mouseOverPolyline.bind(this));
		polyline.on('mouseout', this.mouseLeavePolyline.bind(this));

		this.map.fitBounds(breadcrumbs);
	};

	public mouseLeavePolyline (event) {
		this.map.closePopup(this.popup);
		this.popup = null;
	};

	public mouseOverPolyline (event) {
		let breadcrumb = this.breadcrumbs[0];
		let min = Math.pow(this.breadcrumbs[0].coordinates[0] - event.latlng.lat, 2) + Math.pow(this.breadcrumbs[0].coordinates[1] - event.latlng.lng, 2);

		for (let i = 1, length = this.breadcrumbs.length; i < length; i++) {
			let value = Math.pow(this.breadcrumbs[i].coordinates[0] - event.latlng.lat, 2) + Math.pow(this.breadcrumbs[i].coordinates[1] - event.latlng.lng, 2);
			
			if (min > value) {
				min = value;
				breadcrumb = this.breadcrumbs[i];
			}
		}

		if (this.popup) {
			this.popup
				.setLatLng(breadcrumb.coordinates)
				.setContent('<div class="flex nowrap">' +
                                //'<div class="medium leaflet-popup-col">' + breadcrumb.speed + ' mph</div>' +
                                '<div class="medium leaflet-popup-col">' + moment(breadcrumb.timestamp).format('HH:mm:A') + '</div>' +
                                '<div class="leaflet-popup-col">' +  moment(breadcrumb.timestamp).format('MMM DD') + '</div>' +
                            '</div>');
		} else {
			this.popup = L.popup()
				.setLatLng(breadcrumb.coordinates)
                .setContent('<div class="flex nowrap">' +
                                //'<div class="medium leaflet-popup-col">' + breadcrumb.speed + ' mph</div>' +
                                '<div class="medium leaflet-popup-col">' + moment(breadcrumb.timestamp).format('HH:mm:A') + '</div>' +
                                '<div class="leaflet-popup-col">' +  moment(breadcrumb.timestamp).format('MMM DD') + '</div>' +
                            '</div>')
				.openOn(this.map);
		}
	};

    public drawStops() {
        if (typeof this.mapKey == 'undefined') {
            return;
        }

		for (let i = 0, length = this.stops.length; i < length; i++) {
			let stop = this.stops[i];
			let date = moment(stop.date).format('MMM DD');

			if (stop.latitude && stop.longitude) {
				L.marker([stop.latitude, stop.longitude], {
					icon: L.divIcon({
						iconSize: L.point(50, 58),
						className: stop.id == this.nextStop ? 'icon-next' : 'icon-number',
						html: i + 1,
						iconAnchor: L.point(23, 55)
						})
					})
					.addTo(this.map)
		    		.bindPopup('' +
		                    '<div class="flex pt1 pb1">' +
		                        '<div class="pr3">' +
		                            '<div class="medium">' + date +
		                            '</div>' +
		                            '<div>' + stop.time +
		                            '</div>' +
		                        '</div>' +
		                        '<div>' +
		                            '<div class="medium">'+ stop.addressLines.join(', ') + '</div>' +
		                            '<div>' +[stop.city, stop.state, stop.postalCode].join(', ') + '</div>' +
		                            '<div class="leaflet-popup-hline"></div>' +
		                            '<div>' + stop.contactName + '</div>' +
		                            '<div class="medium">' + stop.phoneNumber + '</div>' +
		                            '<div>' + stop.company + '</div>' +
		                        '</div>' +
		                    '</div>');
				}
		}

		this.map.fitBounds(this.stops.filter((stop)=>stop.latitude && stop.longitude).map((stop)=>[stop.latitude, stop.longitude]));
	};

    drawTruck() {
        if (typeof this.mapKey == 'undefined') {
            return;
        }

		if (this.truck && this.truck.latitude && this.truck.longitude) {
			L.marker([this.truck.latitude, this.truck.longitude], {
				icon: L.divIcon({
					iconSize: L.point(50, 58),
					className: 'icon-driver',
					html: '',
					iconAnchor: L.point(23, 55)
				})
			})
			.addTo(this.map)
			.bindPopup('' +
	            '<div class="flex pt1 pb1">' +
	                '<div class="pr3">' +
	                    '<div class="medium">' + moment(this.truck.timestamp).format('MMM DD') +
	                    '</div>' +
	                    '<div>' +  moment(this.truck.timestamp).format('HH:mm:A') +
	                    '</div>' +
	                '</div>' +
	                '<div>' +
	                    '<div class="medium">'+ this.truck.addressLines.join(', ') + '</div>' +
	                    '<div>' +[this.truck.city, this.truck.state, this.truck.postalCode].join(', ') + '</div>' +
	                '</div>' +
	            '</div>');
		}

	};

	ngOnChanges (changes) {
		if (changes.breadcrumbs) {
			if (this.breadcrumbs && this.breadcrumbs.length && this.map) {
				this.drawPolyline();
			};
		};

		if (changes.stops) {
			if (this.stops && this.stops.length && this.map) {
				this.drawStops();
			};
		};

		if (changes.truck) {
			if (this.truck && this.map) {
				this.drawTruck();
			}	
		}

		if (changes.show) {
			if (this.show) {
				this.drawMap();

				if (this.stops && this.stops.length) {
					this.drawStops();
				};

				if (this.breadcrumbs && this.breadcrumbs.length) {
					this.drawPolyline();
				};	

				if (this.truck) {
					this.drawTruck();
				}	
			}
		}
	};

	constructor(el: ElementRef) {
		this.id  = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		this.el = el.nativeElement;
		this.el.id = 'el' + this.id;
	}
}