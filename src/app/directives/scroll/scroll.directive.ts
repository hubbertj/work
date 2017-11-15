import { Directive, ElementRef, Output, EventEmitter, Input, OnChanges } from '@angular/core';

declare var $: JQueryStatic;
import * as _ from 'lodash';

@Directive({
  selector: '[scroll]'
})

export class ScrollDirective implements OnChanges {
	private el: HTMLElement;
	private id;

	@Input() scrollEmitter;
	@Output() onScroll = new EventEmitter();

	ngOnChanges (changes) {
		if (changes.scrollEmitter) {
			if (this.scrollEmitter) {
				this.scrollEmitter.subscribe(this.scrollBottom.bind(this));	
			}
		}
	};

	scrollBottom (event) {
		let el = $(this.el);
		let height;

		if (event && event.height == 0) {
			height = event.height;
		} else {
			height = el.children().height();	
		}

		el.scrollTop(height);
	};

	ngOnDestroy () {
		$(this.el).off('scroll.' + this.id);
	};

	scroll (event) {
		this.onScroll.emit(event);
	};

	constructor(el: ElementRef) {
		this.id  = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		this.el = el.nativeElement;
		this.el.id = 'el' + this.id;

		$(this.el).on('scroll.' + this.id, _.throttle(this.scroll.bind(this), 500));
		
		this.onScroll.emit(event);
	}
}