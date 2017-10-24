import { Component, OnInit, ViewChild, Renderer, EventEmitter } from '@angular/core';
import {MODAL_DIRECTVES, BS_VIEW_PROVIDERS, DROPDOWN_DIRECTIVES} from 'ng2-bootstrap';

import { PopoverService, DivisionService, UserService } from '../../services/index';
import { ScrollDirective, AutosizeDirective } from '../../directives/index';
import { Router } from '@angular/router-deprecated';

 
import * as _ from 'lodash';
import * as moment from 'moment';
declare var $: JQueryStatic;


@Component({
    selector: 'transflo-popovers',
    template: require('./popovers.component.html'),
    directives: [MODAL_DIRECTVES, ScrollDirective, DROPDOWN_DIRECTIVES, AutosizeDirective],
    providers: [DivisionService],
	viewProviders: [BS_VIEW_PROVIDERS]

})

export class PopoversComponent {
	@ViewChild('chat1Modal') chat1Modal;
	@ViewChild('chat2Modal') chat2Modal;
	@ViewChild('chat3Modal') chat3Modal;
	@ViewChild('chat4Modal') chat4Modal;
	@ViewChild('chat5Modal') chat5Modal;

	public subscribtion;
	public eventHide;

	public message = '';
	public searchString = '';
	public filteredByFavorite = false;
	public timer;
	public driversLoading;
	public drivers: any = [];
	public driversList: any = [];
	public activeDriver: any;
	public divisionId: any;
	public dialog: any = [];
	public lastPartLength:number = 1;
	public userId;
	public activeDriverName = '';
	public activeDriverNames:any = '';
	public activeMode = 'solo';
	public selectedObject = {};
	public notifications = [];
	public perPage = 20;
	public notificationMessage = '';
	public notificationTitle = '';
	public activeDriverEmail = '';
	public allSelected = false;
	public favoriteActiveDriver = false;
	public activeTab = 'messages';
	public notificationType = 'general';

	public scrollEmitter = new EventEmitter();

	public sub;
	public isSignInPage = false;
    private dontAskForAuthUrls: Array<string> = ['signin', 'restore', 'share', 'resetpassword', 'register'];

	constructor (private renderer: Renderer, 
		private divisionService: DivisionService, 
		private popoverService: PopoverService,
		private userService: UserService,
		private router: Router
	) {
		this.sub = router.subscribe((url) => this.checkPage(url));

		this.subscribtion = this.popoverService
			.eventShown
			.subscribe(this.showModal.bind(this));

		this.eventHide = this.popoverService
			.eventHidden
			.subscribe(this.hideModals.bind(this));
	};

	private showNew (index) {
		if (this.dialog[index + 1]) {
			return !this.dialog[index].unread && this.dialog[index + 1].undread;
		}
	};


	private checkPage (url) {
        this.isSignInPage = !!(this.dontAskForAuthUrls.findIndex((link) => url.split('/')[0].split('?')[0] == link) + 1);
		if (!this.isSignInPage) {
			this.userService.getUser(this.setUser.bind(this));
		}
	};

	private filterByFavorite () {
		if (this.filteredByFavorite) {
			this.driversList = _.filter(this.drivers, (dr:any)=>dr.isFavorite);
		} else {
			this.driversList = this.drivers.slice(0);
		}

		this.filterDrivers(this.driversList);
	};

	private filterDrivers (drivers) {
		if (this.searchString) {
			this.driversList = _.filter(drivers, (driver:any)=>{
				return driver.name.toUpperCase().indexOf(this.searchString.toUpperCase()) != -1;
			});
		} else {
			this.driversList = drivers;
		}
	};

	private toggleMode () {
		if (this.activeMode == 'solo') {
			this.changeMode('multy');
		} else {
			this.changeMode('solo');
		}
	};

	private changeMode (mode) {
		this.activeMode = mode;

		if (this.activeMode == 'multy') {
			this.removeListener();
			this.dialog = [];
			this.notifications = [];
			this.selectedObject = {};
			this.selectedObject[this.activeDriver] = true;
			this.activeDriverNames = this.activeDriverName;
		} else {
			this.startListener();
			this.getMessages (this.activeDriver, this.perPage);
			this.getNotifications();
		}
	};

	private getDate (time) {
		return moment(time).format('MMM DD, YYYY');
	}

	private getTime (time) {
		return moment(time).format('HH:mm:A');
	};

	private setUser (user) {
		this.userId = user.id;
	};

	private scrollBottom () {
		this.scrollEmitter.emit({});
	};

	private parseMessages (res) {
		if (res) {
			let body = res.json();

			for (let driver of this.drivers) {
				let found = body.find((el)=>el.driverId == driver.id);

				if (found) {
					driver.messages = found.quantity;
					if (driver.messages && driver.id == this.activeDriver) {
						this.loadNew();
						driver.messages = 0;
					}
				}
			}

			this.driversLoading = false;
		}
	};

	private parseDrivers (res, divisionId) {
		if (res) {
			let body = res.json();

			this.drivers = body;
			this.driversList = body;

			this.setActiveDriver(_.find(this.drivers, (d:any)=>d.id == this.activeDriver), null);
			this.getNewMessages();
		}
	};

	private sortDialog () {
        this.dialog.sort((mess1, mess2) => +new Date(mess2.timestamp) - +new Date(mess1.timestamp));
        
		this.dialog = _.map(this.dialog, (el:any, index)=>{
			let showDate = false;
			let unread = false;

			if (!this.dialog[index + 1]) {
				showDate = true;
				unread = el.unread;
			} else {
				showDate = moment(el.timestamp).format('MMM DD, YYYY') != moment(this.dialog[index + 1].timestamp).format('MMM DD, YYYY');
				unread = this.dialog[index + 1].unread == false && el.unread == true;
            };
            
			return {
				body: el.body,
				fromId: el.fromId,
				id: el.id,
				timestamp: el.timestamp,
				toId: el.toId,
				unread: unread,
				date: this.getDate(el.timestamp),
				time: this.getTime(el.timestamp),
				showDate: showDate
			}
		});
     
	};

	private parseDialog(res) {
		if (res) {
			let body = res.json();

			this.dialog = body;

			this.sortDialog();

			if (this.drivers.length) {
				for (let driver of this.drivers) {
					if (driver.id == this.activeDriver) {
						driver.messages = 0;
					}
				}
			}
		}
	};

	public getMessages (id, count) {
		if (id) {
			this.divisionService.getMessagesDriver(this.divisionId, id, count, null, null)
				.then(this.parseDialog.bind(this));	
		}
	};

	public selectAll () {
		_.each(this.drivers, (driver) => {
			this.selectedObject[driver.id] = true;
		});

		this.activeDriverNames = _.map(_.filter(this.drivers, (driver:any)=>this.selectedObject[driver.id]), 'name').join(', ');
		this.allSelected = true;
	};

	public unselectAll () {
		this.selectedObject = {};

		this.selectedObject[this.activeDriver] = true;
		this.activeDriverNames = _.map(_.filter(this.drivers, (driver:any)=>this.selectedObject[driver.id]), 'name').join(', ');
		this.allSelected = false;
	};

	public setAsFavorite () {
		let driver = _.find(this.drivers, (d:any)=>d.id == this.activeDriver);
		driver.isFavorite = this.favoriteActiveDriver;

		this.filterByFavorite();

		this.divisionService.setAsFavorite(this.divisionId, this.activeDriver, this.favoriteActiveDriver);
	};

	public setActiveDriver (driver, id) {
		if (this.activeMode == 'solo') {
			if (id) {
				this.activeDriver = id;	
			}

			if (driver) {
				this.activeDriverEmail = driver.email;
				this.activeDriverName = driver.name;	
				this.activeDriver = driver.id;
				this.favoriteActiveDriver = driver.isFavorite;
			}

			this.getMessages(this.activeDriver, this.perPage);
			this.getNotifications();
			this.scrollBottom();
		} else {
			if (this.selectedObject[driver.id] && _.keys(this.selectedObject).length > 1) {
				delete this.selectedObject[driver.id];
				this.allSelected = false;
			} else {
				this.selectedObject[driver.id] = true;

				if (_.keys(this.selectedObject) == this.drivers.length) {
					this.allSelected = true;
				};
			}

			this.activeDriverNames = _.map(_.filter(this.drivers, (driver:any)=>this.selectedObject[driver.id]), 'name').join(', ');
		}
		
	};

	public onScroll (event) {
		let top = $(event.currentTarget).scrollTop();
	
		if (top == 0) {
			this.loadMore();
		}
	};

	public loadMore () {
		let lastId;

		if (this.dialog.length && this.activeDriver) {
			lastId = this.dialog[this.dialog.length - 1].id;

			if (this.lastPartLength) {
				this.divisionService.getMessagesDriver(this.divisionId, this.activeDriver, this.perPage, lastId, null)
					.then(this.appendDialog.bind(this));	
			}
		}
	};

	public loadNew () {
		let firstId;

		if (this.dialog.length && this.activeDriver) {
			firstId = this.dialog[0].id;

			this.divisionService.getMessagesDriver(this.divisionId, this.activeDriver, this.perPage, null, firstId)
					.then(this.prependDialog.bind(this));	
		}
	};

	public getNewMessages () {
		this.divisionService.getMessages(this.divisionId)
			.then(this.parseMessages.bind(this));
	};

	public prependDialog (res) {
		this.dialog = _.filter(this.dialog, 'id');
		this.dialog = _.each(this.dialog, (el)=>{
			el.unread = false;
		});

		if (res) {
			let body = res.json();

			for (let message of body) {
				this.dialog.push(message);
			};

			this.sortDialog();

			if (_.find(body, (mess:any)=>mess.fromId == this.userId)) {
				this.scrollBottom();
			}

		}
	};

	public appendDialog (res) {
		if (res) {
			let body = res.json();	

			this.lastPartLength = body.length;

			if (this.lastPartLength) {
				for (let message of body) {
					this.dialog.push(message);
				};	
			}

			this.sortDialog();
		}
	};

	public removeListener () {
		clearInterval(this.timer);
	};

	public startListener () {
		this.timer = setInterval(this.getNewMessages.bind(this), 30000);
	};

	public parseMessage (res) {
		this.loadNew();	
	};

	public sendNotification (message, title, type) {
		if (this.notificationMessage != '' && this.notificationTitle !='' && this.activeMode == 'solo') {
			this.divisionService
				.sendNotifications(this.divisionId, [this.activeDriver], {
					message: message,
					title: title,
					type: type
				})
				.then(this.getNotifications.bind(this));

			this.notificationMessage = '';
			this.notificationTitle = '';
		}

		if (this.notificationMessage != '' && this.notificationTitle !='' && this.activeMode == 'multy') {

			this.divisionService
				.sendNotifications(this.divisionId, _.keys(this.selectedObject), {
					message: message,
					title: title,
					type: type
				});

			this.notifications.push({
				body: message,
				title: title,
				timestamp: new Date()
			});

			this.notifications = _.map(this.notifications, (not:any)=>({
				body: not.body,
				title: not.title,
				timestamp: not.timestamp,
				date: this.getDate(not.timestamp)
			}));

			this.notifications.sort((mess1, mess2)=> +new Date(mess2.timestamp) - +new Date(mess1.timestamp));


			this.notificationMessage = '';
			this.notificationTitle = '';
			this.scrollBottom();

		}
	}

	public sendMessage (message) {
		if (this.message != '' && this.activeMode == 'solo') {
			this.divisionService
				.sendMessages(this.divisionId, [this.activeDriver], message)
				.then(this.parseMessage.bind(this));

			this.message = '';
		}

		if (this.message != '' && this.activeMode == 'multy') {
			let showDate = false;

			this.divisionService
				.sendMessages(this.divisionId, _.keys(this.selectedObject), message);

			this.dialog.push({
				body: this.message,
				fromId: this.userId,
				unread: false,
				timestamp: new Date()
			});

			this.sortDialog();

			this.message = '';

			this.scrollBottom();
		}
	};

	public getDrivers (divisionId) {
		this.divisionService
			.getDrivers(divisionId, null)
			.then((res)=>this.parseDrivers(res, divisionId));
	};

	public parseNotifications (res) {
		let body = res.json();

		this.notifications = _.map(body, (not:any)=>({
			body: not.body,
			fromId: not.fromId,
			id: not.id,
			toId: not.toId,
			type: not.type,
			title: not.title,
			timestamp: not.timestamp,
			date: this.getDate(not.timestamp)
		}));

		this.notifications.sort((mess1, mess2)=> +new Date(mess2.timestamp) - +new Date(mess1.timestamp));
		this.scrollBottom();
	}

	public getNotifications () {
		if (this.activeDriver) {
			this.divisionService
				.getNotifications(this.divisionId, this.activeDriver)
				.then(this.parseNotifications.bind(this));	
		}
	};

	public showModal(values) {
		if (values.type == 'messages') {
			this.divisionId = values.divisionId;

			if (values.driverId) {
				this.driversLoading = true;
				this.getDrivers(values.divisionId);
				this.setActiveDriver(null, values.driverId);
				this.getNotifications();
				this.startListener();
				this.chat2Modal.show();	
			} else {
				this.driversLoading = true;
				this.getDrivers(this.divisionId);
				this.chat2Modal.show();	
			}
			
		}
	};

	public hideModals () {
		this.chat1Modal.hide();
		this.chat2Modal.hide();
		this.chat3Modal.hide();
		this.chat4Modal.hide();
		this.chat5Modal.hide();
		this.removeListener();
	}

}
