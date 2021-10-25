import { NgModule } from '@angular/core';
//import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { WelcomePageComponent } from './components/welcome-page/welcome-page.component';
import { SignUpPageComponent } from './components/sign-up-page/sign-up-page.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';



const routes: Routes = [
  { path: '', component: WelcomePageComponent },
  { path: 'register', component: SignUpPageComponent },
  { path: 'workspace', component:SidenavComponent},
  { path: 'profile', component:UserProfileComponent},
  { path: 'forgot-password', component:ChangePasswordComponent }

];
@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(routes),
   // CommonModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
