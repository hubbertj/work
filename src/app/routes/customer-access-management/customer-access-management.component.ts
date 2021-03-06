import { Component, OnInit, ViewChild, EventEmitter, Input, OnChanges } from '@angular/core';
import { MODAL_DIRECTVES, BS_VIEW_PROVIDERS } from 'ng2-bootstrap';
import { DivisionService, UserService } from '../../services/index';
import { UStates, PermissionAttributes, PermissionTypes, PermissionStates, PermissionCompanies } from '../../constants/index';
import { Permission, Fleet, UserPermission } from '../../models/index';
import { ModalSelectComponent } from '../../components/index';

@Component({
    selector: 'app-customer-access-management',
    directives: [MODAL_DIRECTVES, ModalSelectComponent],
    viewProviders: [BS_VIEW_PROVIDERS],
    template: require('./customer-access-management.component.html'),
    providers: [DivisionService, UserService]
})

export class CustomerAccessManagementComponent implements OnInit, OnChanges {
    @ViewChild('addNewUserModal') addNewUserModal;
    @ViewChild('addFleetModal') addFleetModal;

    @Input() users: Array < UserPermission > = [];


    private filteredUsers: Array < UserPermission > = [];
    private filterStr: string;
    private emailSearchStr: string;
    private userTableData: Array < any > = [];

    private permissionAttributes: Array < any > = PermissionAttributes;
    private permissionTypes: Array < any > = PermissionTypes;
    private permissionStates: Array < any > = PermissionStates;
    private permissionCompanies: Array < any > = PermissionCompanies;
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

        this.loading = true;
        this.users = [];

        this.divisionService.getAllPermissions()
            .then((response) => {
                this.loading = false;
                let code: number = (response === undefined || response.status === undefined || !response.status) ? 500 : response.status;
                switch (code) {
                    case 200:
                        let resUsers: Array < UserPermission > = response.text() && response.json();
                        if (resUsers && resUsers.length){
                            this.users = resUsers;
                        }
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
            var jsonUser = JSON.stringify(this.users[user]).toUpperCase();
            if (jsonUser.search(val.toUpperCase()) > -1) filterArray.push(this.users[user]);
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
        this.alerts = [];
        this.userDivisions = [];
        this.fleetModalUser = null;
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

        var found = this.fleetModalUser.fleets.find((element) => {
            return element.fleetId === division.id;
        });

        if (found) {
            this.alerts.push({
                message: 'Fleet already exists',
                class: 'alert-danger'
            });
        } else {
            var fleet = new Fleet();
            fleet.fleetId = division.id;
            fleet.fleetName = division.name;
            this.fleetModalUser.fleets.push(fleet);
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

    /**
     * Removes a alert from our alert list
     * @param {[number]} index [the index of the element to remove]
     */
    private removeAlert(index) {
        this.alerts.splice(index, 1);
    };

    /**
     * [adds a permission to the our permission modal]
     * @param {[array<permission>]} permissions [a array of permissions]
     */
    private onAddPermission(permissions) {
        var permission = new Permission();
        permission['changed'] = true;
        permissions.push(permission);
        return false;
    };

    /**
     * [The submit process for user permission seaerch form]
     * @param {string} email [a email string]
     */
    private onUserSearch(email: string) {
        this.clearForms();

        this.divisionService.getPermissions(email)
            .then((response) => {
                let code: number = (response === undefined || response.status === undefined || !response.status) ? 500 : response.status;
                 let userPermission: UserPermission;
                 if (code === 200) {
                     userPermission = response.text() && response.json();
                     this.userTableData.push(userPermission);
                 }else{
                     this.alerts.push({
                         message: 'Unknown error',
                         class: 'alert-danger'
                     });
                 }
            })
            .catch((response) => {
                let code: number = (response === undefined || response.status === undefined || !response.status) ? 500 : response.status;
                switch (code) {
                    case 400:
                        this.alerts = [];
                        this.alerts.push({
                            message: 'Email is missing',
                            class: 'alert-danger'
                        });
                        break;
                    
                    case 401:
                         this.onCloseNewUserModal();
                         this.addNewUserModal.hide();
                         this.divisionService.error(response);
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
                }
            });
        return false;
    };

    /**
     * [This adds a permission for a user, submit process for the add user permission form]
     * @param {[user]} users [The user we have found or are adding a permission for]
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
                    default:
                        this.alerts = [];
                        this.alerts.push({
                            message: 'Unknown error',
                            class: 'alert-danger'
                        });
                        break;
                }
            })
            .catch((response) => {
                 let code: number = (response === undefined || response.status === undefined || !response.status) ? 500 : response.status;
                 switch (code) {
                     case 400:
                         this.alerts = [];
                         this.alerts.push({
                             message: 'Required field was missing in request',
                             class: 'alert-danger'
                         });
                         break;

                     case 401:
                         this.onCloseNewUserModal();
                         this.addNewUserModal.hide();
                         this.divisionService.error(response);
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
                             class: 'alert-danger'
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

    /**
     * [The saving of a permission row]
     * @param {Permission} permission The permission we want to save.
     */
    private onSavePermission(permissionUserId: number, fleetId: number, fleetName: string, permission: Permission) {
        let isNew: boolean = (!permission.id || permission.id == -1);
        let permissionArr: Array < Permission > = [];
        permissionArr.push(permission);

        this.divisionService.savePermissionUserPermissions(permissionUserId, fleetId, fleetName, permissionArr, isNew)
            .then((response) => {
                let fleets: Array <Fleet> = response.text() && response.json();
                let fleet: Fleet;
                fleet = fleets.pop();
            
                if(isNew){
                    //we are assuming the last element in fleets.permissions is the newest permission saved?
                     let savedPermission: Permission = fleet.permissions.pop();
                     permission.id = savedPermission.id;
                }

                permission['changed'] = false;
            })
            .catch((response) => {
                let code: number = (response === undefined || response.status === undefined || !response.status) ? 500 : response.status;
                switch (code) {
                    case 400:
                        let  result: Fleet = response.text() && response.json();
                        this.divisionService.showErrorBox({ details: [{ error: result.errorMessage || result.permissions[0].errorMessage }] })
                        break;
                    case 401:
                        this.onCloseNewUserModal();
                        this.addNewUserModal.hide();
                        this.divisionService.error(response);
                        break;
                    case 403:
                        this.divisionService.showErrorBox({ details: [{ error: "Forbidden" }] })
                        break;
                    case 500:
                        this.divisionService.showErrorBox({ details: [{ error: "Unexpected error on the server, failed to save permission" }] });
                        break;
                }
            });
        return false;
    };

    /**
     * [Removes a permission from the permissionUser]
     * @param {number}     permissionUserId Id of the user we are removing a permission from
     * @param {number}     fleetId          The fleet id where the permission will be removed from.
     * @param {string}     fleetName        Name of fleet, optional.
     * @param {Permission} permission       The permission which is being removed.
     */
    private onDeletePermission(permissionUserId: number, fleetId: number, fleetName: string, permission: Permission, permissions: Array < Permission > , index: number) {
        let permissionArr: Array < Permission > = [];
        if (!permission.id || permission.id == -1) {
            permissions.splice(index, 1);
            return false;
        }
        permissionArr.push(permission);
        this.divisionService.deletePermissionUserPermissions(permissionUserId, fleetId, fleetName, permissionArr)
            .then((response) => {
                let code: number = (response === undefined || response.status === undefined || !response.status) ? 500 : response.status;
                // let result: Fleet = response.json();
                // permissions = result.permissions;
                if(code === 200 && index != null){
                    permissions.splice(index, 1);
                }
            }).catch((response) => {
                let code: number = (response === undefined || response.status === undefined || !response.status) ? 500 : response.status;
                switch (code) {
                    case 400:
                        this.divisionService.error(response);
                        break;
                    case 403:
                        this.divisionService.error(response);
                        break;
                    case 500:
                        this.divisionService.showErrorBox({ details: [{ error: "Unexpected error on the server, failed to delete permission" }] });
                        break;
                }
            });
        return false;
    };

    /**
     * [Removes a fleet from our user]
     * @param {[number]} userIndex  index for the user
     * @param {[number]} fleetIndex index for the fleet in the user fleet array.
     */
    private onDeleteFleet(userIndex: number, fleetIndex: number) {
        let deletePermissions: Array < Permission > = [];
        let fleet: Fleet = this.users[userIndex].fleets[fleetIndex];
        let permissionUserId: number = this.users[userIndex].id;

        for (let permission of fleet.permissions) {
            let isNew: boolean = (!permission.id || permission.id == -1);
            if (!isNew) deletePermissions.push(permission);
        }
        if (deletePermissions.length === 0) {
            this.users[userIndex].fleets.splice(fleetIndex, 1);
            return false;
        }
        //TODO: Need a way to dissociation a fleet from a user remove a fleet in the backend.
        this.divisionService.deletePermissionUserPermissions(permissionUserId, fleet.fleetId, fleet.fleetName, deletePermissions)
            .then((response) => {
                let code: number = (response === undefined || response.status === undefined || !response.status) ? 500 : response.status;
                switch (code) {
                    case 200:
                        this.users[userIndex].fleets.splice(fleetIndex, 1);
                        break;
                    case 400:
                        this.divisionService.error(response);
                        break;
                    case 403:
                        this.divisionService.error(response);
                        break;
                    case 500:
                        this.divisionService.showErrorBox({ details: [{ error: "Unexpected server error, failed to delete fleet permissions" }] });
                        break;
                }
            });
        return false;
    };

    /**
     * [Function which is called when the customerAccessManagementForm is submitted]
     */
    private onSubmit() {
        return false;
    };

}
