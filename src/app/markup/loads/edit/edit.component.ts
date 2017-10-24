import { Component } from '@angular/core';
import {CORE_DIRECTIVES, FORM_DIRECTIVES, NgClass} from '@angular/common';
import {SELECT_DIRECTIVES} from 'ng2-select/ng2-select';
import {DROPDOWN_DIRECTIVES, MODAL_DIRECTVES, TYPEAHEAD_DIRECTIVES, BS_VIEW_PROVIDERS} from 'ng2-bootstrap';

@Component({
    selector: 'my-loads',
    directives: [DROPDOWN_DIRECTIVES, MODAL_DIRECTVES, TYPEAHEAD_DIRECTIVES, SELECT_DIRECTIVES, NgClass, CORE_DIRECTIVES, FORM_DIRECTIVES],
    viewProviders: [BS_VIEW_PROVIDERS],
    template: require('./edit.component.html')
})

export class MarkupEditLoadComponent {
    public selectedTime:string = '';
    public time:Array<string> = ['Morning', 'Afternoon', 'Evening'];
}
