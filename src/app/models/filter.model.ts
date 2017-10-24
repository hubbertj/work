import * as moment from 'moment';

export class Filter {
	
	private dateShipping;
	private dateDelivery;
	private stateShipping;
	private stateDelivery;
	private status;
	private broker;
	private cityShipping;
	private cityDelivery;
	private params;
	private offeredDrivers;
	private assignedDrivers;
	private assignedCarriers;
	private sortingField;
	private sortingType;

	public serialize () {
		// I bet it can be done much better
		let serialized = '';

		
		if (this.status && this.status.length) {
			serialized += '&status=' + this.status.map((status)=> status.text).join(',');
		}

		if (this.params) {
			serialized += '&attributes=' + this.params;
		}

		if (this.broker && this.broker.length) {
			serialized += '&broker=' + this.broker.map((broker)=>broker.id).join(',');
		}

		if (this.stateShipping) {
			serialized += '&originState=' + this.stateShipping;
		}

		if (this.stateDelivery) {
			serialized += '&destinationState=' + this.stateDelivery;
		}

		if (this.cityShipping) {
			serialized += '&originCity=' + this.cityShipping;
		}

		if (this.cityDelivery) {
			serialized += '&destinationCity=' + this.cityDelivery;
		}

		if (this.dateShipping && this.dateShipping.startDate && this.dateShipping.endDate) {
			serialized += '&shippingDates=' + moment(this.dateShipping.startDate).format('MM/DD/YYYY') + '-' + moment(this.dateShipping.endDate).format('MM/DD/YYYY');
		}

		if (this.dateDelivery && this.dateDelivery.startDate && this.dateDelivery.endDate) {
			serialized += '&deliveryDates=' + moment(this.dateDelivery.startDate).format('MM/DD/YYYY') + '-' + moment(this.dateDelivery.endDate).format('MM/DD/YYYY');
		}

		if (this.assignedCarriers && this.assignedCarriers.length) {
			serialized += '&carrierAssignee=' + this.assignedCarriers.map((carrier)=>carrier.id).join(',');
		}

		if (this.assignedDrivers && this.assignedDrivers.length) {
			serialized += '&driverAssignee=' + this.assignedDrivers.map((driver)=>driver.id).join(',');
		}

		if (this.offeredDrivers && this.offeredDrivers.length) {
			serialized += '&driverOffered=' + this.offeredDrivers.map((driver)=>driver.id).join(',');
		}

		if (this.sortingField && this.sortingType) {
			serialized += '&sortBy=' + this.sortingField + '&sortType=' + this.sortingType;
		} 

		return serialized;
	}

	constructor(filterParams) {
		this.dateShipping = filterParams.dateShipping;
		this.dateDelivery = filterParams.dateDelivery;
		this.stateShipping = filterParams.stateShipping;
		this.stateDelivery = filterParams.stateDelivery;
		this.status = filterParams.status;
		this.broker = filterParams.division;
		this.cityShipping = filterParams.cityShipping;
		this.cityDelivery = filterParams.cityDelivery;
		this.params = filterParams.params;
		this.offeredDrivers = filterParams.offeredDrivers;
		this.assignedDrivers = filterParams.assignedDrivers;
		this.assignedCarriers = filterParams.assignedCarriers;
		this.sortingField = filterParams.sortingField;
		this.sortingType = filterParams.sortingType;
	}


}