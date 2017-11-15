import { Injectable } from '@angular/core';

@Injectable()
export class ValidationService {
    constructor() { };

    emailValidator(email: string): boolean {
        let emailValid = true;
        if (email) {
            let EMAIL_REGEXP = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (!EMAIL_REGEXP.test(email)) {
                emailValid = false;
            }
        } else {
            emailValid = false;
        }
        return emailValid;
    };
}
