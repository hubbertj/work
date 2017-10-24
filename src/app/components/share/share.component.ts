import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LoadsService } from '../../services';
import { DROPDOWN_DIRECTIVES } from 'ng2-bootstrap';


@Component({
	selector: 'transflo-share',
	template: require('./share.component.html'),
	providers: [LoadsService],
	directives: [DROPDOWN_DIRECTIVES]
})

export class ShareComponent {
	@Input() loadId;
	@Output() onToggle = new EventEmitter();

	private value: string;

	private trackedEmails = [];
	private newEmail = '';
	private trackingLink;
	private expired = 3;
    private time = 'hours';
    private info: string;


	public extractLink (res) {
		if (res) {
			let body = res.json();
			
			this.trackingLink = window.location.origin + window.location.pathname + '#' + body.link;
		}
	};


	public getLink(loadId) {
		if (!this.trackingLink) {
			this.loadsService.getShareLink(this.loadId).then(this.extractLink.bind(this));	
		}
	};

	public keyUp (event) {
		if (this.newEmail == '' && event.keyCode == 8) {
			this.removeEmail(this.trackedEmails.length - 1);
		}
	};

	public addEmail (lastCheck) {
		let lastSymbol = this.newEmail[this.newEmail.length - 1];
		let email: any;

		if (lastSymbol == ' ' || lastSymbol == ';' || lastSymbol == ',' || lastCheck) {
			email = this.newEmail.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);

			if (email) {
				this.trackedEmails.push(email[0]);
				this.newEmail = '';
			}
		}

	};

	public removeEmail (index) {
		this.trackedEmails.splice(index, 1);
	};

	public toggle (val) {
		this.onToggle.emit(val);		
	};

	public sendTackingLink () {
		this.addEmail(true);
		
		let sharingInfo = {
			link: this.trackingLink,
			expirationTime: this.time == 'hours' ? this.expired : this.expired * 24,
            emails: this.trackedEmails,
            additionalInfo: this.info
		}

		this.loadsService.shareLink(this.loadId, sharingInfo);
	}

	constructor(private loadsService: LoadsService) {}
}