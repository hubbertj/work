import { Component, ElementRef, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges } from '@angular/core';

declare var $: JQueryStatic;

@Component({
	selector: 'transflo-dropdown',
	template: require('./dropdown.component.html')
})

export class DropdownComponent implements OnInit, OnDestroy, OnChanges {
	private el: HTMLElement;

	private values: Array<any>;
	private id: string;
	private shown = false;
	private searchString = '';
	private filteredScope = [];

	@Output() listChanged = new EventEmitter();
	@Input() list: Array<any>;
	@Input() selectedList: Array<any>;
	@Input() placeholder: string;

	// in future to keep interface, that uses this component.
	@Input() valueField: string;

	ngOnChanges (changes) {
		if (changes.list) {
			this.filteredScope = this.list.slice();
		}
	};

	ngOnInit () {		
		$('body').on('click.' + this.id + ' touchstart.' + this.id, (event) => {
			if (!$(event.target).closest('.id' + this.id).length) {
				this.shown = false;
			}
			
		});
	};

	getSelected (el) {
		return !!(this.selectedList.indexOf(el) + 1);	
	};

	onKey (event) {
		if (event.code == 'Backspace' && this.searchString == '') {
			this.selectedList.pop();
		}
	};

	deleteStatus (el) {
		this.setSelected(el, false);
	};

	setSelected (el, isSelected) {
		if (isSelected) {
			this.selectedList.push(el);
		} else {
			this.selectedList = this.selectedList.filter((status) => {
				return status != el;
			});
		}

		this.listChanged.emit(this.selectedList);		
	};

	filter (str) {
		this.searchString = str;

		if (str && str != '') {
			str = str.toUpperCase();

			this.filteredScope = this.list.filter((el)=>{
				let name = '';

				if (el.name) {
					name = el.name.toUpperCase();
				} else {
					name = el.text.toUpperCase();
				}

				return (name.indexOf(str) != -1);
			});
		} else {
			this.filteredScope = this.list;
		}
	};

	ngOnDestroy () {
		$('body').unbind('click.' + this.id + ' touchstart.' + this.id);
	};


	onFocus () {
		this.shown = true;
	};

	constructor(el: ElementRef) {
		this.el = el.nativeElement;
		this.id  = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	}
}