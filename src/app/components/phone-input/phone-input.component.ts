import { Component, Input, Output, EventEmitter, OnChanges} from '@angular/core';
import { DROPDOWN_DIRECTIVES } from 'ng2-bootstrap';
import { ValidationService } from '../../services/index';


@Component({
	selector: 'transflo-phone-input',
	template: require('./phone-input.component.html'),
	directives: [DROPDOWN_DIRECTIVES]
})

export class PhoneInputComponent {
	@Input() emails;
	@Input() disabled;
	@Output() onEmailChanged = new EventEmitter();

    private newEmail = '';
    public emailOutput = {
        emailValid: true,
        emailsList: []
    };

	public keyDown (event) {
		if (this.newEmail == '' && event.keyCode == 8 && !this.disabled) {
            this.removeEmail(this.emailOutput.emailsList.length - 1);
        }
    };

    public addEmail(lastCheck) {
        this.emailOutput.emailValid = true;
        if (!this.disabled && this.newEmail) {
			let lastSymbol = this.newEmail[this.newEmail.length - 1];
            if (lastSymbol == ' ' || lastSymbol == ';' || lastSymbol == ',' || lastCheck) {
                let email = this.newEmail;
                if (lastSymbol == ' ' || lastSymbol == ';' || lastSymbol == ',')
                {
                    email = this.newEmail.slice(0, -1);
                }
                if (this.validationService.emailValidator(email)) {
                    this.emailOutput.emailsList.push(email);
                    this.emailOutput.emailValid = true;
                    this.newEmail = '';
                } else {
                    this.emailOutput.emailValid = false;
                }
                this.onEmailChanged.emit(this.emailOutput);
			}
		}
	};

	public removeEmail (index) {
		if (!this.disabled) {
            this.emailOutput.emailsList.splice(index, 1);
            this.onEmailChanged.emit(this.emailOutput);	
		}
    };

    ngOnChanges(changes) {
        this.emailOutput.emailsList = this.emails;
    };

    constructor(private validationService: ValidationService) {}
}