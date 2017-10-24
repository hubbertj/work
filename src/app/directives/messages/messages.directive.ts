import { Directive, ElementRef, OnInit, Input } from '@angular/core';
import * as moment from 'moment';

import { PopoverService } from '../../services/index';

declare var $: JQueryStatic;

@Directive({
  selector: '[messages]'
})

export class MessagesDirective {
	private el: HTMLElement;
	private id;

	@Input() driverId: any;
	@Input() divisionId: any;

	showPopup(event) {
		this.popoverService.showPopover('messages', this.divisionId, this.driverId, {});

		event.stopPropagation();
		event.preventDefault();		
	};

	ngOnDestroy () {
		$(this.el).off('click.' + this.id);
	};

	constructor(el: ElementRef, private popoverService: PopoverService) {
		this.id  = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		this.el = el.nativeElement;
		this.el.id = 'el' + this.id;
		$(this.el).on('click.' + this.id, this.showPopup.bind(this));
	}
}