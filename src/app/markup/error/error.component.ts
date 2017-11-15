import { Component } from '@angular/core';
import {CORE_DIRECTIVES} from '@angular/common';
import { ROUTER_DIRECTIVES, Router } from '@angular/router-deprecated';

@Component({
    selector: 'my-error',
    template: require('./error.component.html'),
    directives: [ROUTER_DIRECTIVES]
})

export class MarkupErrorComponent {

}
