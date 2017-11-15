import { Directive, ElementRef, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import * as moment from 'moment';

declare var $: JQueryStatic;


@Directive({
  selector: '[date-picker]'
})

export class DatePickerDirective implements OnInit, OnChanges {
	private id;
	private el: HTMLElement;

	@Output() datechanged = new EventEmitter();
	@Input() date:any;

	ngOnInit () {
		let options = {
			parentEl: $(this.el).parent(),
			singleDatePicker: true,
			autoApply: true,
			autoUpdateInput: false,
			locale: {
				separator: '–',
				format: 'M/D/YYYY',
				weekLabel: 'W',
				daysOfWeek: [
					'Sun',
					'Mon',
					'Tue',
					'Wed',
					'Thu',
					'Fri',
					'Sat'
		        ],
	        	monthNames: [
					'January',
					'February',
					'March',
					'April',
					'May',
					'June',
					'July',
					'August',
					'September',
					'October',
					'November',
					'December'
				]
			}
		};
		
		$(this.el).daterangepicker(options, this.setDate.bind(this));

		$(this.el).on('change.datepicker', this.changeDate.bind(this));
		$(this.el).on('apply.daterangepicker', this.updateInput.bind(this));
	};

	updateInput (event, picker) {
		this.date = picker.startDate.format('M/D/YYYY');
		this.setDate(this.date, '', '');
	};

	changeDate (event) {
		this.date = event.currentTarget.value;
		this.setDate(this.date, '', '');
	};

	ngOnChanges (changes) {
		if (changes.date) {
			$(this.el).val(this.date);
		}
	};

	setDate(start, end, label) {
		this.datechanged.emit(start);
	};

	constructor(el: ElementRef) {
		this.id  = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		this.el = el.nativeElement;
	}
}