import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Renderer} from '@angular/core';
import {CORE_DIRECTIVES, FORM_DIRECTIVES, NgClass} from '@angular/common';
import {SELECT_DIRECTIVES} from 'ng2-select/ng2-select';
import { Router } from '@angular/router-deprecated';
import {TAB_DIRECTIVES, DROPDOWN_DIRECTIVES, MODAL_DIRECTVES, TYPEAHEAD_DIRECTIVES, BS_VIEW_PROVIDERS} from 'ng2-bootstrap';
import {SkeletonComponent} from '../../components/skeleton/index';
import { DriversComponent} from '../../components/drivers/index';
import { ShareComponent } from '../../components/share/index';
import { DateComponent } from '../../components/date/index';

import { MapDirective } from '../../directives/map/map.directive';

import { AttributesComponent } from '../../components/attributes/index';

import { LoadsService, UserService } from '../../services';
import { ValidationService } from '../../services/index';
import { NotificationRename } from "../../pipes";

import * as moment from 'moment';
declare var $: JQueryStatic;

@Component({
    selector: 'load-details',
    directives: [TAB_DIRECTIVES, ShareComponent, DateComponent, MapDirective, DROPDOWN_DIRECTIVES, DriversComponent, AttributesComponent, MODAL_DIRECTVES, TYPEAHEAD_DIRECTIVES, SELECT_DIRECTIVES, NgClass, CORE_DIRECTIVES, FORM_DIRECTIVES, SkeletonComponent],
    viewProviders: [BS_VIEW_PROVIDERS],
    providers: [LoadsService],
    template: require('./load-details.component.html'),
	pipes: [NotificationRename]
})

export class LoadDetailsComponent implements OnInit, OnDestroy {
	@ViewChild('addEmail') addEmailBtn:ElementRef;
	private id;
	private loadId;
	private divisionId;
    private isCarrier;
    public isCommonCarrier;
	private load:any = {
		showMap: false
	};

	private loading:boolean;
	private stops = [];
	private shipments = [];
	private stopsHash:any = {};
	private trackedEmails = [];
	private newEmail = '';
	private trackingLink;
	private expired = 0;
	private time = 'hours';
	private events: any = [];
	private breadcrumbs;
	private messages;
	private subscribers: any = [];
	private eventGroups: any = [];
	public newSubscriber = {
        label: <string> null,
        email: <string>null,
        emailValid: <boolean> false,
        hideEmailinValid: <boolean> true,
        events: []
    };
    public currentSubscriber = {
        label: <string> null,
        email: <string>null,
        emailValid: <boolean> false,
        hideEmailinValid: <boolean> true,
        events: []
    };
	private notificationsDropdown = false;
	private brokerInstructionAttributeName = '!BrokerInstructions';
	private brokerInstructions;
	private loadError: boolean = false;

	constructor (
		private router:Router,
		private loadsService: LoadsService,
        private userService: UserService,
        private validationService: ValidationService,
		private renderer: Renderer
	){
		this.id  = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	};

	public ngOnDestroy() {
		$('body').unbind('click.' + this.id);
	};

	public openNotifications (event) {
		this.notificationsDropdown = true;
		this.getNotifications();
		event.stopPropagation();
		event.preventDefault();
	};

	public closeNotifications (event) {
		if (this.notificationsDropdown && event !== false) {
			this.notificationsDropdown = false;
			this.saveNotifications();
		}

		if (event && event !== true && event !== false) {
			event.stopPropagation();
			event.preventDefault();	
		}
	} 

    public mapSidebarOpened = false;


	public goTendering () {
		this.router.navigate(['TenderingLoad',  { divId: this.divisionId, loadId: this.loadId}]);
	};

	public editLoad () {
		this.router.navigate(['EditLoad', { divId: this.divisionId, loadId: this.loadId}]);
	};

	public getTime (timestamp) {
		return moment(timestamp).format('HH:mm:A')
	};

	public saveNotifications () {
		let notifications = this.subscribers.filter((sub)=>!(this.userService.getUserEmail() == sub.email && sub.events.length == 0));
			
		this.loadsService.saveNotifications(this.loadId, notifications).then((res)=>console.log(res));
	};


	public removeSubscriber (index) {
		this.subscribers.splice(index, 1);
	};

	public getSubscriberEvent (subscriber, event) {
		return !!subscriber.events.find((subEvent)=>subEvent == event.id);
	};

	public setSubscriberEvent (subscriber, event, value) {
		if (value && !this.getSubscriberEvent(subscriber, event)) {
			subscriber.events.push(event.id);
		} else {
			let idx = subscriber.events.findIndex((subEvent)=>subEvent == event.id);

			if (idx != -1) {
				subscriber.events.splice(idx, 1);	
			}
		}
	};

    private inputinValid(subscriber) {
        let result = true;
        result = !subscriber.emailValid || !subscriber.email || !subscriber.label;
        return result;
	}

	public updateSubscriber (index) {
        if (this.currentSubscriber.label && this.currentSubscriber.email) {
            let tempsubscriber = (JSON.parse(JSON.stringify(this.currentSubscriber)));
            this.subscribers[index] = tempsubscriber;
		}
	};

	public addSubscriber () {
		if(this.newSubscriber.label && this.newSubscriber.email) {
            this.subscribers.push(Object.assign({}, this.newSubscriber));
            this.newSubscriber.label = '';
            this.newSubscriber.email = '';
            this.newSubscriber.emailValid = false;
            this.newSubscriber.hideEmailinValid = true;
            this.newSubscriber.events = [];
		}

		//sends a click event to email button to close it.
		let event = new MouseEvent('click', {bubbles: false});
    	this.renderer.invokeElementMethod(this.addEmailBtn.nativeElement, 'dispatchEvent', [event]);
	};

    public editSubscriber(subscriber) {
        let tempsubscriber = (JSON.parse(JSON.stringify(subscriber)));
        this.currentSubscriber.email = tempsubscriber.email;
        this.currentSubscriber.emailValid = true;
        this.currentSubscriber.hideEmailinValid = true;
        this.currentSubscriber.label = tempsubscriber.label;
        this.currentSubscriber.events = tempsubscriber.events; 
	};

    public emailValidator(subscriber, newEmail) {
        subscriber.emailValid = false;
        subscriber.hideEmailinValid = true;
        if (newEmail && this.validationService.emailValidator(newEmail)) {
            subscriber.emailValid = true;
        }
    }
    public blurEmail(subscriber)
    {
        if (subscriber.email && !subscriber.emailValid) {
            subscriber.hideEmailinValid = false;
        }
    }
	public extractNotifications (res) {
		if (res) {
			let body = res.json();
			let eventGroups = [];

			//TODO: remove when backend changes & remove pipe in template.
			var events = [];
			while(body.events.length > 0){
				var item = body.events.pop();
				if(item.group !== "Package"){
					events.push(item);
				}
			}
			body.events = events.reverse();

			this.subscribers = body.subscribers;

			var email = this.userService.getUserEmail()
			if (this.subscribers && !this.subscribers.length && email){
				this.subscribers.push({
					label: 'Me',
					email: email,
					events: []
				});
			}

			this.events = body.events;

			this.eventGroups = this.events.map((event)=>event.group);
			
			for (let eventGroup of this.eventGroups) {
				if (!eventGroups.find((ev)=>eventGroup == (ev && ev.eventName))) {
					eventGroups.push({
						eventName: eventGroup,
						events: this.events.filter((e)=>e.group == eventGroup)
					});
				}
			};



			this.eventGroups = eventGroups;
		}
	};

	public getNotifications () {
		this.loadsService.getNotifications(this.loadId).then(this.extractNotifications.bind(this));
	};

	private deserealizeBreadcrumbs (res) {
		if (res && res.text()) {
			this.breadcrumbs = res.json();
		}
	};


	private deserealizeMessages (res) {
		if (res && res.text()) {
			this.messages = res.json();
		}
	};

	ngOnInit () {
		this.loading = true;

		this.divisionId = +this.router.root.currentInstruction.urlPath.split('/')[1];
		this.loadId = +this.router.root.currentInstruction.urlPath.split('/')[3];

		this.userService.getUser(this.setCarrier.bind(this));

        this.loadsService.getLoad(this.loadId, this.divisionId)
			.then(this.deserealizeLoad.bind(this));

		this.loadsService.getMessages(this.loadId)
			.then(this.deserealizeMessages.bind(this));

		$('body').on('click.' + this.id, (event) => {
			// if it's inside the notification dropdown -- dont hide it
			if (!$(event.target).closest('.-notification-dropdown').length && $.contains($('body')[0], event.target)) {
				this.closeNotifications(event);
			};

			if (event.target instanceof HTMLAnchorElement && event.target.id && event.target.id.startsWith('scanLink_', 0)){
				window.open(event.target.getAttribute('href'), '_blank');
			};
		});
	};

	public setCarrier (user) {
        let division = user.divisions.find((div) => {
            return div.id == this.divisionId;
        });

        this.isCarrier = division.type == 'carrier';
        this.isCommonCarrier = division.isCommonCarrier;
	};

	public deserealizeLoad (jsonResult) {
		if (jsonResult) {
			this.load = jsonResult.json();
			this.shipments = this.load.shipments;
			this.stops = this.load.stops;

			for (let i = 0, length = this.stops.length; i < length; i++) {
				this.stopsHash[this.stops[i].id] = this.stops[i];
			}

			this.stops.sort((a,b) => a.stopNum - b.stopNum);
			this.loading = false;

			if (this.load.loadAttributes && this.load.loadAttributes.length){
				var brokerInstructionAttributes = this.load.loadAttributes.filter((attr)=>{
					return attr.key === this.brokerInstructionAttributeName;
				})

				for (var i = 0; i < brokerInstructionAttributes.length; i++){
					this.brokerInstructions = brokerInstructionAttributes[i].value;
				}

				//Filter out broker instructions before it gets mapped to screen incorrectly.
				this.load.loadAttributes = this.load.loadAttributes.filter((attr)=> {
					return attr.key != this.brokerInstructionAttributeName;
				})
			}
			
			this.loadsService.getBreadcrumbs(this.loadId)
				.then(this.deserealizeBreadcrumbs.bind(this));
		}
	};
}
