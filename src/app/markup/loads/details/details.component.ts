import { Component } from '@angular/core';
import {CORE_DIRECTIVES, FORM_DIRECTIVES, NgClass} from '@angular/common';
import {SELECT_DIRECTIVES} from 'ng2-select/ng2-select';
import {TAB_DIRECTIVES, DROPDOWN_DIRECTIVES, MODAL_DIRECTVES, TYPEAHEAD_DIRECTIVES, BS_VIEW_PROVIDERS} from 'ng2-bootstrap';

@Component({
    selector: 'my-loads',
    directives: [TAB_DIRECTIVES, DROPDOWN_DIRECTIVES, MODAL_DIRECTVES, TYPEAHEAD_DIRECTIVES, SELECT_DIRECTIVES, NgClass, CORE_DIRECTIVES, FORM_DIRECTIVES],
    viewProviders: [BS_VIEW_PROVIDERS],
    template: require('./details.component.html')
})

export class MarkupDetailsLoadComponent {

}
