import { Component } from '@angular/core';
import {CORE_DIRECTIVES, FORM_DIRECTIVES, NgClass} from '@angular/common';
import {SELECT_DIRECTIVES} from 'ng2-select/ng2-select';
import {DROPDOWN_DIRECTIVES, MODAL_DIRECTVES, BS_VIEW_PROVIDERS} from 'ng2-bootstrap';
import { AutosizeDirective } from './../directives/index';
import { ROUTER_DIRECTIVES, Router } from '@angular/router-deprecated';

@Component({
  selector: 'my-markup',
  directives: [DROPDOWN_DIRECTIVES, MODAL_DIRECTVES, SELECT_DIRECTIVES, NgClass, CORE_DIRECTIVES, FORM_DIRECTIVES, AutosizeDirective, ROUTER_DIRECTIVES],
  viewProviders: [BS_VIEW_PROVIDERS],
  template: require('./markup.component.html')
})

export class MarkupComponent {

}
