import { Component, ElementRef, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges } from '@angular/core';

declare var $: JQueryStatic;

@Component({
	selector: 'transflo-simple-dropdown',
	template: require('./simple-dropdown.component.html')
})

export class SimpleDropdownComponent implements OnInit, OnDestroy, OnChanges {
	private el: HTMLElement;
	private shown:boolean;
	private searchString = '';
	private filteredScope = [];
	private id;

	@Input() stringValue: string;
	@Input() values: Array<any>;
	@Output() attributeChanged = new EventEmitter();

	ngOnInit () {
		$('body').on('click.' + this.id, (event) => {
			if (!$(event.target).closest('.id' + this.id).length) {
				if (this.shown) {
					this.attributeChanged.emit(this.searchString);
				}

				this.shown = false;
			}
		});
	};

	onBlur (event) {
		this.setSelected({
			name: this.searchString,
		}, event);
	};

	onFocus () {
		this.shown = true;
		this.filter(this.searchString);
	};

	ngOnChanges (changes) {
		if (changes.values) {
			this.filteredScope = this.values.slice();
		}

		if (changes.stringValue) {
			this.searchString = this.stringValue;
		}
	};

	filter (str) {
		this.attributeChanged.emit(this.searchString);
		this.searchString = str;
		this.shown = true;

		if (str && str != '') {
			str = str.toUpperCase();

			this.filteredScope = this.values.filter((el)=>{
				let name = '';

				if (el.name) {
					name = el.name.toUpperCase();
				} else {
					name = el.text.toUpperCase();
				}

				return (name.indexOf(str) != -1);
			});
		} else {
			this.filteredScope = this.values;
		}
	};

	setSelected (attribute, event) {
		this.searchString = attribute.name;
		this.shown = false;
		this.attributeChanged.emit(this.searchString);

		event.stopImmediatePropagation();

		return false;
	};

	ngOnDestroy () {
		$('body').unbind('click.' + this.id);
	};


	constructor(el: ElementRef) {
		this.el = el.nativeElement;
		this.id  = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	}
}