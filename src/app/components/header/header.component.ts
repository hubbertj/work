import { Component, OnInit, Inject, OnDestroy, ViewChild, forwardRef } from '@angular/core';
import { DROPDOWN_DIRECTIVES } from 'ng2-bootstrap';
import { UserService } from '../../services/index';
import { User } from '../../models/user.model';
import { Division } from '../../models/division.model';
import { MessagesDirective } from '../../directives';
import { HelpComponent } from '../../components/help/index';
import { AboutComponent } from '../../components/about/index';
import { EULAComponent } from '../../components/index';

import { ROUTER_DIRECTIVES, Router } from '@angular/router-deprecated';
import { Config } from '../../config';

import * as moment from 'moment';


declare var $: JQueryStatic;


@Component({
	selector: 'transflo-header',
    template: require('./header.component.html'),
    directives: [DROPDOWN_DIRECTIVES, ROUTER_DIRECTIVES, MessagesDirective, HelpComponent, AboutComponent]
    //providers: [UserService]
})

export class HeaderComponent implements OnInit, OnDestroy {
    @ViewChild(HelpComponent) helpComp: HelpComponent; 
    @ViewChild(AboutComponent) aboutComp: AboutComponent; 
	public isSignInPage:boolean = true;

	private partUrl: string = '';
	private user: User;
	private searchString: string;
	private filteredDivisions: Array<Division>;
	private selectedDivision: Division;
	private dontShowHeaderUrl: Array<string> = ['signin', 'restore', 'share', 'resetpassword', 'register'];
    private sub;
    private isCarrier = false;
	public loading = false;

	constructor(private userService:UserService, private router: Router) {
		this.sub = router.subscribe((url) => this.checkPage(url));

		this.selectedDivision = new Division({});
		this.user = new User({});
	};

	ngOnDestroy () {
		this.sub.unsubscribe();
	};

	logout () {
		this.loading = true;

		this.userService.logout()
			.then(((res)=>{
				this.loading = false;
			}).bind(this))
			.catch(() => {
				this.loading = false;
			});
	};

	private search (str) {
		str = str.toUpperCase();

		if (str != '') {
			this.filteredDivisions = this.user.divisions.filter((div)=>{
				let name = div.name.toUpperCase();
				let code = div.code.toUpperCase();

				return (name.indexOf(str) != -1 || code.indexOf(str) != -1);
			});
		} else {
			this.filteredDivisions = this.user.divisions;
		}
	};

	private checkPage (url) {
		this.isSignInPage = !!(this.dontShowHeaderUrl.findIndex((link) => url.split('/')[0].split('?')[0] == link) + 1);
		this.partUrl = url.split('/')[0];
		this.initialize();
	};

	setSelectedDivision (division, routeHome) {
		if (routeHome) this.router.navigate(['Home', {divId: division.id}]);
		this.searchString = '';
		
		this.selectedDivision = division;
		this.isCarrier = division.type == 'carrier';   
		
		if (this.isCarrier) {
			var httpService = this.userService.getBrokerSettings(this.selectedDivision.id);
		}
	};

	public useUser (user) {
		// Investigate, why RouteParams wont work.
        let routeParams = this.router.currentInstruction.component.params;

		this.user = user;

		this.filteredDivisions = this.user.divisions;

		if (routeParams['divId']) {
			this.setSelectedDivision(this.user.divisions.find((div)=>parseInt(routeParams['divId']) == div.id), false);	
        } else {
            if (this.user.divisions)					
				this.setSelectedDivision(this.user.divisions[0], false);
        }
        this.isCarrier = this.selectedDivision.type == 'carrier'; 
	};

	public getDate () {
		return moment().format('MM/DD/YYYY') + '--' + moment().add(1, 'w').format('MM/DD/YYYY');
	};

	initialize () {
		if (!this.isSignInPage && this.isSignInPage !== undefined) {
			$('.wrapper').removeClass('-hidden-header');
			$('.wrapper').removeClass('-white');
			this.userService.getUser(this.useUser.bind(this));
		} else {
			$('.wrapper').addClass('-hidden-header');
			if (this.partUrl == 'share') {
				$('.wrapper').addClass('-white');
			}
		};
	};

	ngOnInit () {
		this.initialize();
    };

    showHelp() {
        this.helpComp.showModal();
    };
    showAbout() {
        this.aboutComp.showModal(Config.appVersion);
    };

}
