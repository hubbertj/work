import { Component } from '@angular/core';
import {CORE_DIRECTIVES, FORM_DIRECTIVES, NgClass} from '@angular/common';
import {SELECT_DIRECTIVES} from 'ng2-select/ng2-select';
import {DROPDOWN_DIRECTIVES} from 'ng2-bootstrap';

@Component({
    selector: 'my-loads',
    directives: [DROPDOWN_DIRECTIVES, SELECT_DIRECTIVES, NgClass, CORE_DIRECTIVES, FORM_DIRECTIVES],
    template: require('./create.component.html')
})

export class MarkupCreateLoadComponent {}
