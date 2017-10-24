import { Component } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'my-signin',
    template: require('./signin.component.html'),
    encapsulation: ViewEncapsulation.None
})

export class MarkupSigninComponent {
}
