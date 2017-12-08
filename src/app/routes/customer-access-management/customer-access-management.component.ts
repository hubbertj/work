import { Component, OnInit, ViewChild, EventEmitter, Input, OnChanges } from '@angular/core';
import { MODAL_DIRECTVES, BS_VIEW_PROVIDERS } from 'ng2-bootstrap';
import { DivisionService, UserService } from '../../services/index';
import { UStates, PermissionAttributes, PermissionTypes, PermissionStates } from '../../constants/index';
import { Permission, Fleet } from '../../models/index';
import { DropdownComponent } from '../../components/dropdown/dropdown.component';

@Component({
    selector: 'app-customer-access-management',
    directives: [MODAL_DIRECTVES, DropdownComponent],
    viewProviders: [BS_VIEW_PROVIDERS],
    template: require('./customer-access-management.component.html'),
    providers: [DivisionService, UserService]
})

export class CustomerAccessManagementComponent implements OnInit, OnChanges {
    @ViewChild('addNewUserModal') addNewUserModal;
    @ViewChild('addFleetModal') addFleetModal;

    @Input() users: Array < any > = [];


    private filteredUsers: Array < any > = [];
    private filterStr: string;
    private emailSearchStr: string;
    private userTableData: Array < any > = [];

    private permissionAttributes: Array < any > = PermissionAttributes;
    private permissionTypes: Array < any > = PermissionTypes;
    private permissionStates: Array < any > = PermissionStates;
    private ustates: Array < any > = UStates;
    private loading: boolean = false;

    private pageAlerts: Array < any > = [];
    private alerts: Array < any > = [];
    private userDivisions: Array < any > = [];
    private fleetModalUser: any;

    //needs to be moved to models
    private newUserData: any = {
        id: null,
        company: null,
        firstName: null,
        lastName: null,
        email: null,
        password: null
    };

    constructor(
        private divisionService: DivisionService,
        private userService: UserService
    ) {};

    /**
     * Standard init fucntion
     */
    ngOnInit() {
        // console.log(UStates);
        this.loading = true;
        this.users = [];
        //fake data;
        this.users.push({
            "id": 152,
            "email": "bob@somewhere.com",
            "firstName": "Bob",
            "lastName": "Somebody",
            "company": "Bod's Shipping",
            "isAssociated": true,
            "Fleets": [{
                "FleetName": "Fleet A",
                "fleetId": 156,
                "Permissions": [{
                    "id": 1656,
                    "type": 0,
                    "key": "",
                    "value": "",
                    "isEnabled": true,
                    "errorMessage": " a error message"
                }]
            }]
        });

        this.users.push({
            "id": 153,
            "email": "ablebody@3plmanagement.com",
            "firstName": "Able",
            "lastName": "Body",
            "company": "3PL Mangement",
            "isAssociated": true,
            "Fleets": [{
                "FleetName": "Fleet B",
                "fleetId": 230,
                "Permissions": [{
                    "id": 1562,
                    "type": 1,
                    "key": "Fragile",
                    "value": "avalue _ string",
                    "isEnabled": true,
                    "errorMessage": " aa error message"
                }]
            }]
        });

        this.users.push({
            "id": 154,
            "email": "allison@amfshipping.com",
            "firstName": "Allison",
            "lastName": "Fentriss",
            "company": "Allison Shipping",
            "isAssociated": true,
            "Fleets": [{
                "fleetId": 1651,
                "FleetName": "Fleet C",
                "Permissions": [{
                        "id": 1656,
                        "type": 2,
                        "key": "Pickup",
                        "value": "value _ string",
                        "isEnabled": true,
                        "errorMessage": " a error message"
                    },
                    {
                        "id": 1565,
                        "type": 0,
                        "key": "",
                        "value": "",
                        "isEnabled": false,
                        "errorMessage": " a error message"
                    }
                ]
            }]
        });


        this.divisionService.getAllPermissions()
            .then((response) => {
                this.loading = false;
                let code: number = (response === undefined || response.status === undefined || !response.status) ? 500 : response.status;
                switch (code) {
                    case 200:
                        this.users.concat(response);
                        break;
                    case 403:
                        this.divisionService.error(response);
                        break;
                    case 500:
                        this.divisionService.showErrorBox({ details: [{ error: "There was an unexpected error on the server" }] });
                        break;
                }
                this.filteredUsers = this.users;
            });

    };


    // @override
    ngOnChanges(changes) {
        console.log(changes);
    };

    /**
     * fires when we change states
     * @param {[type]} event [description]
     */
    private stateChanged(event) {

    };

    /**
     * using the passed in string to search thru our array
     * @param {string} val search String
     */
    private onFilter(val: string) {
        let filterArray: Array < any > = [];

        if (typeof 'undefined' === val || !val || val === '') {
            this.filteredUsers = this.users;
            return false;
        }

        for (var user in this.users) {
            var jsonUser = JSON.stringify(this.users[user]);
            if (jsonUser.search(val) > -1) filterArray.push(this.users[user]);
        }

        this.filteredUsers = filterArray;
    };

    /**
     * [onCloseNewUserModal description]
     */
    private onCloseNewUserModal() {
        this.clearForms();
        this.emailSearchStr = '';
        return false;
    };

    private onCloseAddFleetModal() {
        this.userDivisions = [];
        this.fleetModalUser = null;
    };


    private removeFleet(userIndex, fleetIndex) {
        this.users[userIndex].Fleets.splice(fleetIndex, 1);
    };


    private onPermissionChange(permission: any) {
        permission.value = null;
        if (permission.type == 0) {
            permission.key = null;
        }
        return false;
    };

    private onAddFleet(user: any) {
        this.fleetModalUser = user;
        this.userDivisions = [];
        this.userService.getUser((user) => {
            this.userDivisions = user.divisions;
            this.addFleetModal.show();
        });
        return false;
    };

    private addFleet(division: any) {
        this.alerts = [];

        var found = this.fleetModalUser.Fleets.find((element) => {
            return element.id === division.id;
        });

        if (found) {
            this.alerts.push({
                message: 'Fleet already exists',
                class: 'alert-danger'
            });
        } else {
            var fleet = new Fleet();
            fleet.fleetId = division.id;
            fleet.FleetName = division.name;
            this.fleetModalUser.Fleets.push(fleet);
            this.addFleetModal.hide();
        }
        return false;
    };

    /**
     * [clearForms description]
     */
    private clearForms() {
        this.alerts = [];
        this.userTableData = [];
        for (let x in this.newUserData) {
            this.newUserData[x] = null;
        }
    };

    private removeAlert(index) {
        this.alerts.splice(index, 1);
    };

    private onAddPermission(permissions) {
        permissions.push(new Permission());
        return false;
    };

    /**
     * [onUserSeach description]
     */
    private onUserSeach(email: string) {
        this.clearForms();

        this.divisionService.getPermissions(email)
            .then((response) => {
                let code: number = (response === undefined || response.status === undefined || !response.status) ? 500 : response.status;
                switch (code) {
                    case 200:
                        this.userTableData.push(response);
                        break;
                    case 400:
                        this.alerts = [];
                        this.alerts.push({
                            message: 'Email is missing',
                            class: 'alert-danger'
                        });
                        break;
                    case 403:
                        this.alerts = [];
                        this.alerts.push({
                            message: 'AdminUser is a common carrier or a valid AdminUser is attempting to add another AdminUser as a third party which is currently disallowed',
                            class: 'alert-danger'
                        });
                        break;
                    case 404:
                        this.alerts = [];
                        this.alerts.push({
                            message: 'User was not found',
                            class: 'alert-success'
                        });
                        this.newUserData.id = -1;
                        this.newUserData.email = email;
                        break;
                    default:
                        this.alerts = [];
                        this.alerts.push({
                            message: 'Unknown error',
                            class: 'alert-danger'
                        });
                        break;
                };
            });
        return false;
    };

    /**
     * [onAddSearchUser description]
     * @param {[type]} users [description]
     */
    private onAddUserPermission(aUser) {
        let user: any = (aUser instanceof Array && aUser.length > 0) ? aUser[0] : aUser;
        this.divisionService.addUserPermission(null, user.company, user.firstName, user.lastName, user.email, user.password)
            .then((response) => {
                let code: number = (response === undefined || response.status === undefined || !response.status) ? 500 : response.status;
                switch (code) {
                    case 200:
                        this.ngOnInit();
                        this.onCloseNewUserModal();
                        this.addNewUserModal.hide();
                        break;
                    case 400:
                        this.alerts = [];
                        this.alerts.push({
                            message: 'Required field was missing in request',
                            class: 'alert-danger'
                        });
                        break;
                    case 403:
                        this.alerts = [];
                        this.alerts.push({
                            message: 'AdminUser is a common carrier or a valid AdminUser is attempting to add another AdminUser as a third party which is currently disallowed',
                            class: 'alert-danger'
                        });
                        break;
                    case 409:
                        this.alerts = [];
                        this.alerts.push({
                            message: 'The user already exists',
                            class: 'alert-success'
                        });
                        break;
                    default:
                        this.alerts = [];
                        this.alerts.push({
                            message: 'Unknown error',
                            class: 'alert-danger'
                        });
                        break;
                }
            });
        return false;
    };

    private onSave() {

        return false;
    };

    /**
     * funtion which is call when the form is submitted
     */
    private onSubmit() {
        console.log(arguments);
        return false;
    };

}
