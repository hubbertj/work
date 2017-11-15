import { Component } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'my-password',
    template: require('./password.component.html'),
    encapsulation: ViewEncapsulation.None
})

export class MarkupPasswordComponent {
}
