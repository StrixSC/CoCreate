import { NgModule } from '@angular/core';
//import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { WelcomePageComponent } from './components/welcome-page/welcome-page.component';
import { SignUpPageComponent } from './components/sign-up-page/sign-up-page.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';



const routes: Routes = [
  { path: '', component: WelcomePageComponent },
  { path: 'signup', component: SignUpPageComponent },
  { path: 'workspace', component:SidenavComponent}
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
