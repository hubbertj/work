import { Component, ElementRef, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import {MODAL_DIRECTVES, BS_VIEW_PROVIDERS} from 'ng2-bootstrap';

declare var $: JQueryStatic;

@Component({
	selector: 'transflo-modal-select',
	template: require('./modal-select.component.html'),
	directives: [MODAL_DIRECTVES],
	viewProviders: [BS_VIEW_PROVIDERS]
})

export class ModalSelectComponent implements OnInit {
	@ViewChild('selectModal') selectModal; 

	private el: HTMLElement;
	private selected: Array<string> = [];
	private list: Array<any> = [];

	@Input() items: Array<any>;
	@Input() name: string = '';
	@Input() model: string = '';
	@Output() listChanged = new EventEmitter();

	ngOnInit () {		
		this.items.map((item) =>{
			this.list.push({name: item, selected: null});
		});
		
		if(this.model){
			this.selected = this.model.split(',').map( (item) => { return item.toUpperCase().trim(); });
		}

		this.list.map((item) =>{
			item.selected = (this.selected.indexOf(item.name) != -1);
		});
	};

	private onSelectModalClose(){
		let valuesArr: Array<string>  = [];
		let outStr: string = '';

		for(let item of this.list){
			if(item.selected) valuesArr.push(item.name);
		}
		outStr = valuesArr.toString();
		
		this.model = outStr;
		this.listChanged.emit(outStr);
	};

	constructor(el: ElementRef) {
		this.el = el.nativeElement;
	}
}