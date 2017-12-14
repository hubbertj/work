import { Injectable, Inject } from '@angular/core';
import { Router } from '@angular/router-deprecated';
import { Http, Response } from '@angular/http';
import { HttpService } from '../http/http.service';
import { User } from '../../models/user.model';
import { PopoverService } from '../popover-service/popover-service.service';

import { BaseService} from '../api/base.service';
import { LocalStorageService } from '../localstorage/localstorage.service';
import { Config } from '../../config';
import { BrokerSettings } from '../../models/BrokerSettings.model';
import '../../common/extensions';

export enum Role {
    UNAUTHORIZED = 0,
    AUTHORIZED = 1
};

@Injectable()
export class UserService extends BaseService {
	private signInUrl = 'auth/signin';
	private signOutUrl = 'auth/signout';
	private brokerSettingsUrl = 'divisions/{0}/brokers';
	private updateCarrierBrokerSettingsUrl = 'divisions/updatecarrierbrokersettings';
    private updatePasswordUrl = 'auth/resetpassword';
    private registerUrl = 'register/carrier';
    private carriersUploadSampleUrl = 'register/carriers/sample';
    private carriersUploadUrl = 'register/{brokerId}/carriers';
	private getUserUrl = 'auth';
	private requestPending: boolean;
	private requestBrokerSettingsPending: boolean;
	private functions = [];
	private sub:any;
	private isSignInPage = true;
	private dontAskForAuthUrls: Array<string> = ['signin', 'restore', 'share', 'resetpassword', 'register'];
	
	public user: User;

	constructor (private http: Http,  private httpService: HttpService, protected popoverService: PopoverService, protected router: Router, protected localStorageService: LocalStorageService) {
		super(popoverService, router, localStorageService);
	};	
	
	private handleError (error) {
		this.requestBrokerSettingsPending = false;

		this.error.bind(error);
	};

	public responseParser(res) {
		let user = res.json();
				
		this.httpService.token = this.extractSecurityToken(res);
		this.user = new User(user);

        let lastRoute = JSON.parse(this.localStorageService.getItem('lastUrl'));

        if (lastRoute != null && lastRoute.params.divId) {

			this.router.navigate([lastRoute.route, lastRoute.params]);
			this.localStorageService.clearItem('lastUrl');
		} else {
			this.router.navigate(['Home', { divId: this.user.divisions[0].id}]);	
		};		
    };
    
    //override
	public error (error: Response) {
		super.error(error);
		let errorStatus = error && error.status;
		if(errorStatus == 401){
			this.httpService.token = '';
			this.router.navigate(['Signin']);
		}
	};

    //gets all roles for the user;
    public getAllRoles() {
        let roles: Role[] = [];
        if (this.httpService.token) {
            roles.push(Role.AUTHORIZED);
        } else {
            roles.push(Role.UNAUTHORIZED);
        }
        return roles;
    };

	private extractSecurityToken (res: Response) : string {
		let body = res.json();

		return body.securityToken;
	};

	public getUserEmail () {
		return this.user.email;
	};

	private extractUser(jsonResults: any): User {
		let body = jsonResults.json();
		this.requestPending = false;		
		return this.user = new User(body);
	};

	public extractBrokerSettings(jsonResults: any) {
		let body = jsonResults.json();
		this.requestBrokerSettingsPending = false;
		this.user.brokerSettings.length = 0;
		this.user.brokerSettings = body.brokers.map((bs) => new BrokerSettings(bs));
	};

	public getUser (callback) {
		this.functions.push(callback);

		if (this.user) {
			for (let callback of this.functions) {
				callback(this.user);	
			};

			this.functions = [];
		} else {
			if (!this.requestPending) {
				this.requestPending = true;
				this.httpService
					.get(this.getUserUrl)
					.toPromise()
					.then((res)=>{
						this.extractUser(res);

						for (let callback of this.functions) {
							callback(this.user);	
						};

						this.functions = [];
					})
					.catch(this.error.bind(this));
			};
		};		
	};

	public getBrokerSettings (divisionId) {
		if (!this.requestBrokerSettingsPending) {
			this.requestBrokerSettingsPending = true;
			this.httpService
				.get(this.brokerSettingsUrl.format(divisionId))
				.toPromise()
				.then((result)=>{
					this.extractBrokerSettings(result);
					this.functions = [];
				})
				.catch(this.handleError.bind(this));
		};
	};

	public logout () {
		this.user = null;

		return this.httpService
			.get(this.signOutUrl)
			.toPromise()
			.then(((result)=>{
				this.httpService.token = '';
				this.router.navigate(['Signin']);
			}).bind(this))
			.catch(((error) => {
				this.error(error);
				this.httpService.token = '';
				this.router.navigate(['Signin']);
			}).bind(this));
	};

	public restore (email) {
		let body = JSON.stringify({
			email: email
		});

		return this.httpService
			.post(this.updatePasswordUrl, body)
			.toPromise();
	};

	public resetPassword (password, passtoken) {
		let body = JSON.stringify({
			password: password,
			passToken: passtoken
		});

		return this.httpService
			.put(this.updatePasswordUrl, body)
			.toPromise()
			.then(this.responseParser.bind(this));
	};

	public signIn (login, password) {
		let body = JSON.stringify({
			login: login,
			password: password
		});
		
		return this.httpService
			.post(this.signInUrl, body)
			.toPromise();
    };

    public register(usdot, brokerID, zip, email, userName, password, firstName, lastName) {
        let body = JSON.stringify({
            usdot: usdot,
            brokerID: brokerID,
            zip: zip,
            email: email,
            userName: userName,
            password: password,
            firstName: firstName,
            lastName: lastName
        });
        return this.httpService
            .post(this.registerUrl, body)
            .toPromise();
    };

    public getCarriersUpoadSampleUrl() {
        return Config.baseUrl + this.carriersUploadSampleUrl;
    };

    public carriersUpoad(brokerId: string, file: File): Promise<any> { 
       return this.httpService.fileUpload(this.carriersUploadUrl.replace('{brokerId}', brokerId), file);
	};
	
	public updateCarrierBrokerSettings(brokerSettings:BrokerSettings) {
		var body = JSON.stringify({ 
			brokerSettingsId: brokerSettings.carrierBrokerSettingsId,
			scanningEnabled: brokerSettings.scanningEnabled ,
			autoInvoicingEnabled: brokerSettings.autoInvoicingEnabled 
		});

		this.httpService
			.post(this.updateCarrierBrokerSettingsUrl, body)
			.toPromise();
	};
};
