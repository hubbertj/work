import { Component, OnInit } from '@angular/core';
import { RangePickerDirective } from '../../directives/rangepicker/rangepicker.directive';
import {CORE_DIRECTIVES, NgClass} from '@angular/common';
import { DropdownComponent } from '../../components/index';
import {DROPDOWN_DIRECTIVES, MODAL_DIRECTVES, BS_VIEW_PROVIDERS} from 'ng2-bootstrap';
import {DateComponent} from '../../components/date/index';

import { StatusFilterConst, UStates } from '../../constants/index';

import * as moment from 'moment';

declare var $: JQueryStatic;


@Component({
  selector: 'my-home',
  template: require('./home.component.html'),
  directives: [DROPDOWN_DIRECTIVES, NgClass, CORE_DIRECTIVES, RangePickerDirective, DropdownComponent, DateComponent, MODAL_DIRECTVES],
  viewProviders: [BS_VIEW_PROVIDERS]
})

export class MarkupHomeComponent {

    private filterStatus = StatusFilterConst;

    public filterDateShipping = {
        startDate: moment().toDate(),
        endDate:  moment().add(1, 'w').toDate()
    };
    public filterDateDelivery = {
        startDate: moment().toDate(),
        endDate:  moment().add(1, 'w').toDate()
    };

}
