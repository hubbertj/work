import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import {DROPDOWN_DIRECTIVES} from 'ng2-bootstrap';
import {MessagesDirective} from '../../directives';
import { Router } from '@angular/router-deprecated';



@Component({
	selector: 'transflo-drivers',
	template: require('./drivers.component.html'),
	directives: [DROPDOWN_DIRECTIVES, MessagesDirective],
})

export class DriversComponent implements OnChanges {
	@Input() drivers: Array<any>;
	@Input() isCarrier: boolean;
	@Input() loadId: any;
	@Input() divisionId: any;
	@Input() loadStatus: string;

	@Output() onToggle = new EventEmitter();

	private status: string;
	private driversList = [];

	goToTendering (event) {
		if (this.divisionId && this.loadId && this.loadStatus !== 'Delivered') {
			this.router.navigate(['TenderingLoad',  { divId: this.divisionId, loadId: this.loadId}]);	
		};

		event.stopPropagation();
		event.preventDefault();
	};

	ngOnChanges (changes) {
		if (changes.drivers) {
			let offeredDrivers = [];
			let assignedDrivers = [];

			if (this.drivers && this.drivers.length) {
				offeredDrivers = this.drivers.filter((driver) => {
					return driver.assignmentStatus == 'Offered';
				});

				assignedDrivers = this.drivers.filter((driver) => {
                    return driver.assignmentStatus == 'Assigned' || driver.assignmentStatus == 'Accepted';
				});

				if (offeredDrivers.length) {
					this.status = 'Offered';
					this.driversList = offeredDrivers;
				} else {
					if (assignedDrivers.length) {
						this.status = 'Assigned';
						this.driversList = assignedDrivers;
					} else {
						this.driversList = [];
					}
				}
			}
		}
	};

	toggled (val) {
		this.onToggle.emit(val);
	};

	constructor(private router: Router) {}
}