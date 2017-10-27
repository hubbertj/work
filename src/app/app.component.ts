import { Component, ViewContainerRef, ApplicationRef } from '@angular/core';
import { RouteConfig, ROUTER_DIRECTIVES, Router } from '@angular/router-deprecated';

// Components
import { LoadsComponent } from './routes/loads';
import { NewLoadComponent } from './routes/load';
import { SigninComponent } from './routes/signin';
import { RegisterComponent } from './routes/register';
import { RestoreComponent } from './routes/restore';
import { DivisionsComponent } from './routes/divisions';
import { TenderingComponent } from './routes/tendering';
import { Error404Component } from './routes/404';


import {SharedLoadComponent} from './routes/shared-load';
import {ErrorComponent} from './routes/error';
import {VelocityComponent} from './routes/velocity';
import {ErrorsComponent} from './components/index';

import { LoadDetailsComponent } from './routes/load-details';
import { HeaderComponent, FooterComponent, PopoversComponent } from './components/index';
import { DashboardComponent } from './routes/dashboard';
import { ProfileComponent } from './routes/profile';
import { ResetComponent } from './routes/reset';


// Services
import { UserService } from './services/index';
import { HttpService } from './services/index';
import { PopoverService } from './services/index';
import { LocalStorageService } from './services/index';
import { ValidationService } from './services/index';


// Markup only
/*
import { MarkupComponent } from './markup';
import { MarkupSigninComponent } from './markup/signin';
import { MarkupPasswordComponent } from './markup/password';
import { MarkupRestoreComponent } from './markup/restore';
import { MarkupLoadsComponent } from './markup/loads';
import { MarkupCreateLoadComponent } from './markup/loads/create';
import { MarkupEditLoadComponent } from './markup/loads/edit';
import { MarkupDetailsLoadComponent } from './markup/loads/details';
import { MarkupTenderingLoadComponent } from './markup/loads/tendering';
import { MarkupDriversComponent } from './markup/drivers';
import { MarkupProfileComponent } from './markup/profile';
import { MarkupHomeComponent } from './markup/home';
import { MarkupLoadingComponent } from './markup/loading';
import { MarkupErrorComponent } from './markup/error';
import { MarkupVelocityComponent } from './markup/velocity';*/

// css and svg
import '../style/application.sass';

import '../svg/svg_logo.svg';
import '../svg/svg_logo_lg.svg';
import '../svg/svg_pen.svg';
import '../svg/svg_pen_lg.svg';
import '../svg/svg_quote.svg';
import '../svg/svg_danger.svg';
import '../svg/svg_ruby.svg';
import '../svg/svg_fragile.svg';
import '../svg/svg_checkbox.svg';
import '../svg/svg_up.svg';
import '../svg/svg_down.svg';
import '../svg/svg_trash.svg';
import '../svg/svg_star.svg';
import '../svg/svg_mail.svg';
import '../svg/svg_datepicker.svg';
import '../svg/svg_chatgroup.svg';
import '../svg/svg_chatgroup_hover.svg';
import '../svg/svg_chatgroup_active.svg';


/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'transflo-app',
  providers: [UserService, HttpService, PopoverService, LocalStorageService, ValidationService],
  directives: [ROUTER_DIRECTIVES, HeaderComponent, FooterComponent, PopoversComponent, ErrorsComponent],
  template: require('./app.component.html')
})

@RouteConfig([
  {path: '/', component: DivisionsComponent, name: 'Divisions'},
  {path: '/divisions/:divId/loads', component: LoadsComponent, name: 'Loads' },
  {path: '/divisions/:divId/dashboard', component: DashboardComponent, name: 'Home'},

  {path: '/division/:divId/loads/create', component: NewLoadComponent, name: 'NewLoad'},
  {path: '/division/:divId/loads/:loadId/tendering', component: TenderingComponent, name: 'TenderingLoad'},

  {path: '/division/:divId/loads/:loadId/edit', component: NewLoadComponent, name: 'EditLoad' },
  {path: '/division/:divId/loads/:loadId', component: LoadDetailsComponent, name: 'Load Details' },
  {path: '/division/:divId/profile', component: ProfileComponent, name: 'Profile' },


  {path: '/share/:shareId', component: SharedLoadComponent, name: 'SharedLoad' },

  {path: '/register', component: RegisterComponent, name: 'Register' },

  {path: '/signin', component: SigninComponent, name: 'Signin' },
  {path: '/restore', component: RestoreComponent, name: 'Restore' },
  {path: '/division/:divId/error', component: ErrorComponent, name: 'ErrorDivision' },
  {path: '/error', component: ErrorComponent, name: 'Error' },
  {path: '/resetpassword', component: ResetComponent, name: 'Reset' },
  {path: '/404', component: Error404Component, name: '404' },
  {path: '/velocity', component: VelocityComponent, name: 'Velocity' },

//  {path: '/*path', redirectTo: ['404']},

  /*{path: '/markup', component: MarkupComponent, name: 'Markup'},
  {path: '/markup/signin', component: MarkupSigninComponent, name: 'MarkupSignIn'},
  {path: '/markup/password', component: MarkupPasswordComponent, name: 'MarkupRestorePassword'},
  {path: '/markup/restore', component: MarkupRestoreComponent, name: 'MarkupRestorePasswordMessage'},
  {path: '/markup/loads', component: MarkupLoadsComponent, name: 'MarkupLoadsIndex'},
  {path: '/markup/loads/create', component: MarkupCreateLoadComponent, name: 'MarkupCreatingLoad'},
  {path: '/markup/loads/edit', component: MarkupEditLoadComponent, name: 'MarkupEditLoad'},
  {path: '/markup/loads/details', component: MarkupDetailsLoadComponent, name: 'MarkupLoadDetails'},
  {path: '/markup/loads/tendering', component: MarkupTenderingLoadComponent, name: 'MarkupTenderingLoad'},
  {path: '/markup/drivers', component: MarkupDriversComponent, name: 'MarkupMyDrivers'},
  {path: '/markup/profile', component: MarkupProfileComponent, name: 'MarkupMyProfile'},
  {path: '/markup/home', component: MarkupHomeComponent, name: 'MarkupHome'},
  {path: '/markup/loading', component: MarkupLoadingComponent, name: 'MarkupLoading'},
  {path: '/markup/error', component: MarkupErrorComponent, name: 'MarkupError'},
  {path: '/markup/velocity', component: MarkupVelocityComponent, name: 'MarkupVelocity'},
  */
])

export class AppComponent {
    constructor(private viewContainerRef:ViewContainerRef, private userService:UserService, private _applicationRef:ApplicationRef, private _router:Router) {
        // You need this small hack in order to catch application root view container ref
        this.viewContainerRef = viewContainerRef;

        // Angular RC1 router fix for Safari back button
        _router.subscribe((uri)=> {
            _applicationRef.zone.run(() => _applicationRef.tick());
        });        
    }
}
