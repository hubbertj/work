import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import {DROPDOWN_DIRECTIVES} from 'ng2-bootstrap';

@Component({
	selector: 'transflo-attributes',
	template: require('./attributes.component.html'),
	directives: [DROPDOWN_DIRECTIVES]
})

export class AttributesComponent implements OnChanges {
	@Input() attrs: any;

	@Output() onToggle = new EventEmitter();

	private attributesObject:any = {};

	ngOnChanges (changes) {
		if (this.attrs && changes.attrs) {
			for (let i = 0; i < this.attrs.length; i++)  {
				this.attributesObject[this.attrs[i].key] = this.attrs[i].value;
			}
		}
	};

	toggled (val) {
		this.onToggle.emit(val);
	};

	public getAttrsLength(attrs) {
		let newArray = attrs.filter(x => x.key.charAt(0) != '#') || [];

		return newArray.length;
	};

	constructor() {}
}