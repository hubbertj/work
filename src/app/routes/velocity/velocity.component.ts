import { Component, OnInit } from '@angular/core';
import { ROUTER_DIRECTIVES, Router } from '@angular/router-deprecated';
import { UserService } from '../../services';
import { Config } from '../../config';
import {DomSanitizationService} from '@angular/platform-browser';


declare var $: JQueryStatic;

@Component({
    selector: 'transflo-velocity',
    directives: [ROUTER_DIRECTIVES],
    template: require('./velocity.component.html')
})

export class VelocityComponent implements OnInit {
	private user;
	private div:any = {};
	private initialHref = Config.appLink;
	private mobileInitialLink = Config.mobileAppLink;
	private downloadLink = '';
	private href:any = '';

	private buttonHidden = false;

	public OS () {
		return {
			Android: () => navigator.userAgent.match(/Android/i),
			iOS: () => navigator.userAgent.match(/iPhone|iPad|iPod/i),
			Windows: ()=> navigator.userAgent.match(/Windows/i),
			MacOS: ()=> navigator.userAgent.match(/Mac OS/i)
		}
	}

	constructor (private userService:UserService, private sanitizer:DomSanitizationService) {
		if (this.OS().Android()) {
			this.downloadLink = Config.downloadLink.Android;
			this.href = this.sanitizer.bypassSecurityTrustUrl(this.mobileInitialLink);

			return;
		}

		if (this.OS().iOS()) {
			this.downloadLink = Config.downloadLink.iOS;
			this.href = this.sanitizer.bypassSecurityTrustUrl(this.mobileInitialLink);

			return;
		}

		if (this.OS().Windows()) {
			this.downloadLink = Config.downloadLink.Windows;
			this.href = this.sanitizer.bypassSecurityTrustUrl(this.initialHref);

			return;
		}

		if (this.OS().MacOS()) {
			this.href = this.sanitizer.bypassSecurityTrustUrl('javascript:void(0)');
			this.buttonHidden = true;

			return;
		}
	};

	ngOnInit () {
		$('.wrapper').addClass('-velocity');
		this.userService.getUser(this.setUser.bind(this));
	};

	public setUser (user) {
        this.user = user;
        if (this.user.divisions)
		    this.div = this.user.divisions[0];

	};


	ngOnDestroy () {
		$('.wrapper').removeClass('-velocity');
	}
}

