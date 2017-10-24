import { Component, OnInit } from '@angular/core';
import { NgClass} from '@angular/common';
import { UserService } from '../../services';
import { uploadCarriersComponent } from '../../components/uploadCarriers/index';
import { ShareComponent } from '../../components/share/index';
import { Division } from '../../models/division.model';
import { BrokerSettings } from '../../models/BrokerSettings.model';

@Component({
    selector: 'transflo-profile',
    directives: [uploadCarriersComponent, ShareComponent],
    template: require('./profile.component.html')
})

export class ProfileComponent implements OnInit {
    private loading = false;
    private user: any = {};
    public hideCarriersUpoad = true;
    public brokers: Array<Division>;
    
    constructor(private userService: UserService) {
        this.brokers =  new Array<Division>();
    };

    ngOnInit() {
        this.loading = true;
        this.userService.getUser(this.setUser.bind(this));
    };

    public setUser(user) {
        this.loading = false;
        this.user = user;
       
        this.brokers = this.user.divisions.filter((div) => div.type == 'broker');
        this.hideCarriersUpoad = !this.user.divisions.some(x => x.type == 'broker');
    };

    public closeNotifications(event) {        
        if (event && event !== true && event !== false) {
            event.stopPropagation();
            event.preventDefault();
        }
    } 

    public updateCarrierBrokerSettings (event: any, carrierBrokerSetting: BrokerSettings){
        this.userService.updateCarrierBrokerSettings(carrierBrokerSetting);
    };
}