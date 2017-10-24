import { Component, Input, OnChanges } from '@angular/core';
import * as moment from 'moment';

@Component({
	selector: 'transflo-date',
	template: require('./date.component.html')
})

export class DateComponent implements OnChanges {
	@Input() date: any;
	@Input() time: any;
	@Input() dontShowTime: any;

	private value: string;

	ngOnChanges (changes) {
		if (changes.date) {
			let momentObj = moment(this.date, 'M/D/YYYY');
			this.value = momentObj.format('MMM DD');

			if (!this.time) {
				this.time = momentObj.format('LT');	
			}
		}
	};

	constructor() {}
}