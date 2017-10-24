import { Component, Input, OnChanges } from '@angular/core';
import { NumberComponent } from '../number/index';
import * as moment from 'moment';

@Component({
	selector: 'transflo-skeleton',
	template: require('./skeleton.component.html'),
	directives: [NumberComponent]
})

export class SkeletonComponent implements OnChanges {
	@Input() load: any;

	private shipments = [];
	private stops = [];

	public feetToCm = 30.48;
	public lbsToKg = 0.453592;
	public ft3toCm3 = 28316.8;

	public weightUnits = ['lbs', 'kg'];
	public heightUnits = ['ft', 'cm'];
	public volumeUnits = ['ft³', 'cm³'];

	ngOnChanges (changes) {
		if (changes.load) {
			this.shipments = this.load && this.load.shipments || [];
			this.stops = this.load && this.load.stops || [];
			this.stops.sort((a,b) => a.stopNum - b.stopNum);
			this.recalculateSkeleton();

		}
	};


	public getValue(shipments, type, isImperial) {
		let total = 0;

		if (shipments) {
			for (let shipment of shipments) {
				for (let pack of shipment.packages) {
					if (type != 'quantity') {
						if (pack.sizeUnit == 'cm' || pack.weightUnit == 'kg') {
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

	public recalculateSkeleton () {
		let prevStop;

		for (let stop of this.stops) {
			let foundPickUpShipment = this.shipments.filter((shipment)=>shipment.pickup == stop.id);
			let foundDropOffShipment = this.shipments.filter((shipment)=>shipment.dropoff == stop.id);

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
			prevStop = stop;

		}
	};

	constructor() {}
}