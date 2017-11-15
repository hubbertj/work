import { Component } from '@angular/core';
import {CORE_DIRECTIVES, FORM_DIRECTIVES, NgClass} from '@angular/common';
import {DROPDOWN_DIRECTIVES, MODAL_DIRECTVES, BS_VIEW_PROVIDERS} from 'ng2-bootstrap';

@Component({
    selector: 'my-loads',
    directives: [DROPDOWN_DIRECTIVES, MODAL_DIRECTVES, NgClass, CORE_DIRECTIVES, FORM_DIRECTIVES],
    viewProviders: [BS_VIEW_PROVIDERS],
    template: require('./tendering.component.html')
})

export class MarkupTenderingLoadComponent {

}
