import { Directive, ElementRef, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import * as moment from 'moment';

declare var $: JQueryStatic;


@Directive({
  selector: '[range-picker]'
})

export class RangePickerDirective implements OnInit, OnChanges, OnDestroy {
	private el: HTMLElement;
	private date: any;

	@Output() daterangechanged = new EventEmitter();
	@Input() daterange:any;

	ngOnInit () {
		let options = {
			//autoUpdateInput: false,
			autoApply: true,
			autoUpdateInput: false,
			locale: {
				separator: ' – ',
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
		if (this.daterange && this.daterange.startDate && this.daterange.endDate) {
			options['startDate'] = new Date(this.daterange.startDate);
			options['endDate'] = new Date(this.daterange.endDate);
		} /*else {
			//options['startDate'] = moment().toDate();
			//options['endDate'] = moment().add(1, 'w').toDate();

			//this.setDate(moment(),  moment().add(1, 'w'), '');
		}*/

		$(this.el).daterangepicker(options, this.setDate.bind(this));
		$(this.el).on('change.datepicker', this.changeDate.bind(this));

	};

	changeDate (event) {
		let value = event.currentTarget.value;

		if (value) {
			value = value.split(' – ');

			this.setDate(value[0], value[1], '');
		} else {
			this.setDate(value, value, '');
		}
	};

	ngOnChanges (changes) {
		if (changes.daterange) {
			if (this.daterange && this.daterange.startDate && this.daterange.endDate) {
				//$(this.el).val(this.date);
				$(this.el).val(moment(new Date(this.daterange.startDate)).format('M/D/YYYY') + ' – ' + 	moment(new Date(this.daterange.endDate)).format('M/D/YYYY'));
			}
		}
	};

	setDate(start, end, label) {

		if (start && !start._isAMomentObject){
			console.log("unrecognized start object:" + JSON.stringify(start));
		}

		if (end && !end._isAMomentObject){
			console.log("unrecognized end object:" + JSON.stringify(end))
		}

		this.daterange = {
			startDate: start && start._isAMomentObject && start.toDate(),
			endDate: end && end._isAMomentObject && end.toDate()
		};

		this.daterangechanged.emit(this.daterange);
	};

	ngOnDestroy () {
		
	};

	constructor(el: ElementRef) {
		this.el = el.nativeElement;
	}
}