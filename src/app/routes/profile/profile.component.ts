import { Component, ViewChild, OnInit } from '@angular/core';
import { UserService } from '../../services';
import { uploadCarriersComponent } from '../../components/uploadCarriers/index';
import { ShareComponent } from '../../components/share/index';
import { Division } from '../../models/division.model';
import { BrokerSettings } from '../../models/BrokerSettings.model';
import { User } from '../../models/user.model';
import { Remittance } from '../../models/remittance.model'; 
import { ModalMessage } from '../../models/modalmessage.model'; 
import { LocalStorageService } from '../../services/localstorage/localstorage.service';
import { HttpService } from '../../services/http/http.service';
import { PopoverService } from '../../services/index';
import {MODAL_DIRECTVES, BS_VIEW_PROVIDERS, DROPDOWN_DIRECTIVES} from 'ng2-bootstrap';

@Component({
    selector: 'transflo-profile',
    directives: [MODAL_DIRECTVES, DROPDOWN_DIRECTIVES, uploadCarriersComponent, ShareComponent],
    template: require('./profile.component.html'),
	viewProviders: [BS_VIEW_PROVIDERS]
})

export class ProfileComponent implements OnInit {
	@ViewChild('serverModal') serverModal;
    private loading = false;
    private user: any = new User({});
    public hideCarriersUpload = true;
    public brokers: Array<Division>;
    public selectedDivision: Division;
    public modalMessage: ModalMessage;
    private remittanceUpdateUrl: string = 'divisions/remittance';
    private filteredDivisions:Array<Division>;
    private filteredBrokerSettings:Array<BrokerSettings>;
    
    constructor(private userService: UserService, private localStorageService: LocalStorageService, private httpService: HttpService, 
                private popoverService: PopoverService) {
        this.brokers =  new Array<Division>();
		this.popoverService
			.eventShown
			.subscribe(this.showModal.bind(this));
        this.popoverService
            .eventShown
            .subscribe(this.closeModal.bind(this));
        
        this.modalMessage = new ModalMessage(null);
    };    

    ngOnInit() {
        this.loading = true;
        this.userService.getUser(this.setUser.bind(this));
    };

    public setUser(user) {
        this.loading = false;
        this.user = user;
       
        this.brokers = this.user.divisions.filter((div) => div.type == 'broker');
        this.hideCarriersUpload = !this.user.divisions.some(x => x.type == 'broker');

        this.selectedDivision = JSON.parse(this.localStorageService.getItem('selectedDivision')) || new Division(null);

        if (this.selectedDivision){
            this.filteredDivisions = user.divisions.filter((div) => {return div.id != this.selectedDivision.id})
            this.filteredBrokerSettings = user.brokerSettings.filter((brokerSetting)=> {return brokerSetting.id != this.selectedDivision.id});
        }
    };

    public closeNotifications(event) {        
        if (event && event !== true && event !== false) {
            event.stopPropagation();
            event.preventDefault();
        }
    };

    public updateCarrierBrokerSettings (event: any, carrierBrokerSetting: BrokerSettings){
        this.userService.updateCarrierBrokerSettings(carrierBrokerSetting);
    };

    public saveRemittance (event: any){
        this.httpService.post(
            this.remittanceUpdateUrl, 
            JSON.stringify(this.selectedDivision.remittance))
                .toPromise()
                .then(this.handleRemittanceReturn.bind(this));
    };
    
    public closeModal () {
        this.serverModal.hide();
    };

    public showModal () {
        this.serverModal.show();
    };

    private handleRemittanceReturn(jsonResults){
        this.modalMessage.header = 'Carrier Invoice Remittance'
        if (jsonResults.status === 200){
            this.modalMessage.message = 'Your data was saved successfully';
            this.localStorageService.setItem('selectedDivision', JSON.stringify(this.selectedDivision)); 
        } else {
            this.modalMessage.message = 'Your data was not saved. Contact Support';
        };

        this.showModal();
    }
}
