import { Directive, ElementRef, Input, Output, OnChanges } from '@angular/core';
import * as moment from 'moment';

@Directive({
    selector: '[phone-mask]'
})

export class PhoneMaskDirective implements OnChanges {    
    private htmlElement: HTMLElement;
    private currentValue = '';
    private previousValue = '';
    private mask = '';
    private isMaskValid = true;
    private static allowedChars = ['(', ')', '-', 'X'];
    
    @Input() phoneNumber: string;

    constructor(el: ElementRef) {
        this.htmlElement = el.nativeElement;
        this.mask = this.htmlElement.getAttribute('phone-mask');
        this.validateMask();
    };

    ngOnFocus () {
    };
    
	ngOnChanges (changes) {
        if (this.isMaskValid) {
            this.currentValue = changes.phoneNumber.currentValue;
            this.previousValue = changes.phoneNumber.previousValue;
    
            this.constrainToMask();
        };
    };
    
    //TODO: Use this method for the algorithm for applying the mask
    private constrainToMask(){
        if (this.currentValue){
            for(var iIndex = this.currentValue.length - 1; iIndex > -1; iIndex--){
                var evalChar = this.currentValue[iIndex];

                //TODO: In here we would need to build the algorithm.
                /*
                CV = this.currentValue
                PV = this.previousValue

                1. Char exists in mask
                    * is it at the correct index?
                        yes: do nothing to the CV, leave as is.  
                        no: revert to PV... Ie. CV = PV
                2. Char does not exist in mask
                    * is it numeric
                        yes: do nothing to the CV, leave as is.
                        no: revert to PV... Ie. CV = PV
                3. Apply the mask to the CV
                    a. loop through each char of CV, and insert the non 'X' characters of the mask that aren't already in the correct position.
                */
            };
        };
    };
    
    private validateMask () {        
        for (var iIndex = 0; iIndex < this.mask.length; iIndex++){
            var found = false;
            var charEval = this.mask[iIndex];

            PhoneMaskDirective.allowedChars.forEach(function(character){
                if (charEval === character) {
                    found = true;
                    return;
                };
            });

            this.isMaskValid = found;

            if (!this.isMaskValid)
                break;
        };
    };
};