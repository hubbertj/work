import { Component, ViewChild } from '@angular/core';
import { UserService } from '../../services/index';
import { ROUTER_DIRECTIVES, Router } from '@angular/router-deprecated';
import { ValidationService } from '../../services/index';
import { EULAComponent } from '../../components/index';

@Component({
    selector: 'register',
    template: require('./register.component.html'),
    directives: [ROUTER_DIRECTIVES, EULAComponent]
})

export class RegisterComponent {
    @ViewChild(EULAComponent) eulaMsg: EULAComponent; 
    public usdot: string;
    public userEmail: string;
    public brokerID: string;
    public userName: string;
    public zip: string;
    public password: string;
    public verifypassword: string;
    public lastName: string;
    public firstName: string;

    public serverErrorMessage: string;

    public usDotBrokerZipError = false;
    public userExistError = false;

    public emailValid = true;
    public passwordNotMatch = false;
    public checkEULA = false;

    constructor(private userService: UserService, private router: Router, private validationService: ValidationService) { };

    private handleError(error) {
        
        if (error.status) {
            
            let data = error.json();
            let serverUsDotBrokerZipErrorMessage;
            let serverUserExistErrorMessage;

            if (data.modelState) {
                if (data.modelState.serverError) {
                    this.serverErrorMessage = data.modelState.serverError[0];
                }
                if (data.modelState.usDotBrokerZipError) {
                    serverUsDotBrokerZipErrorMessage = data.modelState.usDotBrokerZipError[0];
                }
                if (data.modelState.userExistError) {
                    serverUserExistErrorMessage = data.modelState.userExistError[0];
                }
                if (serverUsDotBrokerZipErrorMessage != null) {
                    this.usDotBrokerZipError = true;
                    this.serverErrorMessage = serverUsDotBrokerZipErrorMessage;
                }
                if (serverUserExistErrorMessage != null) {
                    this.userExistError = true;
                    this.serverErrorMessage = serverUserExistErrorMessage;
                }
                
            } else
            {
                this.serverErrorMessage = "Oops! Something went wrong!";
            }
            
        } 
        
    };

    register() {
        this.userService
            .register(this.usdot,
                        this.brokerID,
                        this.zip,
                        this.userEmail,
                        this.userName,
                        this.password,
                        this.firstName,
                        this.lastName
                        
                    )
            .then(((res) => {
                this.usDotBrokerZipError = false;
                this.userExistError = false;
                this.userService.responseParser.apply(this.userService, [res]);
            }).bind(this))
            .catch(this.handleError.bind(this));
    };

    public emailValidator(email) {
        this.emailValid = true;
        if (this.userEmail) {
            this.emailValid = this.validationService.emailValidator(this.userEmail);
        }
    }

    passwordValidator() {
        this.passwordNotMatch = false;
        if (this.password && this.verifypassword)
            this.passwordNotMatch = this.password != this.verifypassword;
    }

    onSubmit() {
        if (this.inputValid())
            this.register();
    }

    inputValid(): boolean {
        let valid = this.checkEULA &&  this.emailValid && this.userEmail != null && !this.passwordNotMatch && this.password != null && this.verifypassword != null;
        return valid;
    }

    showEULA() {
        this.eulaMsg.showModal();
    }
};
