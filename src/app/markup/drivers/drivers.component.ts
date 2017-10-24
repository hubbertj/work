import { Component } from '@angular/core';
import {CORE_DIRECTIVES, FORM_DIRECTIVES, NgClass} from '@angular/common';
import {SELECT_DIRECTIVES} from 'ng2-select/ng2-select';
import {DROPDOWN_DIRECTIVES, MODAL_DIRECTVES, BS_VIEW_PROVIDERS} from 'ng2-bootstrap';

@Component({
    selector: 'my-drivers',
    directives: [DROPDOWN_DIRECTIVES, MODAL_DIRECTVES, SELECT_DIRECTIVES, NgClass, CORE_DIRECTIVES, FORM_DIRECTIVES],
    viewProviders: [BS_VIEW_PROVIDERS],
    template: require('./drivers.component.html')
})

export class MarkupDriversComponent {

}
