import { Component, Input, OnChanges } from '@angular/core';
import * as moment from 'moment';

@Component({
	selector: 'transflo-number',
	template: require('./number.component.html')
})

export class NumberComponent implements OnChanges {
	@Input() number: any;

	private value: any;

	ngOnChanges (changes) {
		if (changes.number) {
			this.value = this.number.toFixed(2);
		}
	};

	constructor() {}
}