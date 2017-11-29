import { Component, OnInit } from '@angular/core';
import {CORE_DIRECTIVES, FORM_DIRECTIVES, NgClass} from '@angular/common';
import {SELECT_DIRECTIVES} from 'ng2-select/ng2-select';
import { Router } from '@angular/router-deprecated';
import {TAB_DIRECTIVES, DROPDOWN_DIRECTIVES, MODAL_DIRECTVES, TYPEAHEAD_DIRECTIVES, BS_VIEW_PROVIDERS} from 'ng2-bootstrap';
import {SkeletonComponent} from '../../components/skeleton/index';
import { DriversComponent} from '../../components/drivers/index';
import {AttributesComponent} from '../../components/attributes/index';
import { HttpService } from '../../services/index';
import { MapDirective } from '../../directives/map/map.directive';

import { LoadsService, UserService } from '../../services';


@Component({
    selector: 'restore',
    template: require('./shared-load.component.html'),
    directives: [TAB_DIRECTIVES, DROPDOWN_DIRECTIVES, DriversComponent, MapDirective, AttributesComponent, MODAL_DIRECTVES, TYPEAHEAD_DIRECTIVES, SELECT_DIRECTIVES, NgClass, CORE_DIRECTIVES, FORM_DIRECTIVES, SkeletonComponent],
    viewProviders: [BS_VIEW_PROVIDERS],
    providers: [LoadsService]
})

export class SharedLoadComponent implements OnInit {
	public loading: boolean;
	
	public shipments: any = [];
	public stops: any = [];
	public stopsHash: any = {};
	public errorShown = false;
  public shareId = '';
  public errorText: any;
  private load: any = {
        showMap: false
  };
  	private loadError: boolean = false;

	constructor (private router: Router, private http: HttpService) {
		this.load = {};
	};

	ngOnInit () {
		this.shareId = this.router.root.currentInstruction.urlPath.split('/')[1];

		this.loading = true;
		this.http.get('share/' + this.shareId)
			.toPromise()
			.catch(this.error.bind(this))
			.then(this.deserealizeLoad.bind(this));
	};
    public mapSidebarOpened = false;
	public error (err) {
		this.errorShown = true;
        this.loading = false;

        this.errorText = JSON.parse(err._body).message;
	};

	public deserealizeLoad (res) {
		if (res) {
			let body = res.json();

			this.load = body;
			this.shipments = this.load.shipments;
			this.stops = this.load.stops;

			for (let i = 0, length = this.stops.length; i < length; i++) {
				this.stopsHash[this.stops[i].id] = this.stops[i];
			}

			this.loading = false;
			this.stops.sort((a,b) => a.stopNum - b.stopNum);
		}
	};
}

