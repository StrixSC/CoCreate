import { TopBarComponent } from './components/top-bar/top-bar.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthWrapperComponent } from './components/auth-wrapper/auth-wrapper.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { OfflineComponent } from './components/offline/offline.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { LoginComponent } from './components/login/login.component';
import { MenuPageComponent } from './components/menu-page/menu-page.component';
import { DrawingGalleryComponent } from './components/drawing-gallery/drawing-gallery.component';
import { NgModule } from '@angular/core';
import { AngularFireAuthGuard, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { RouterModule, Routes } from '@angular/router';
import { DrawingPageComponent } from './components/drawing-page/drawing-page.component';
import { ChangePasswordComponent } from './components/login/change-password/change-password.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { UserProfileSettingsComponent } from './components/user-profile-settings/user-profile-settings.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { ChatPopedOutComponent } from "./components/right-sidebar/chat-poped-out/chat-poped-out.component";

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(["auth"]);
const redirectLoggedInToMenu = () => redirectLoggedInTo(["menu"]);

const routes: Routes = [
  {
    path: "", component: TopBarComponent, canActivate: [AngularFireAuthGuard], data: {
      authGuardPipe: redirectUnauthorizedToLogin,
    }, children: [
      {
        path: "", component: MenuPageComponent
      },
      { path: "workspace", component: SidenavComponent },
      { path: "profile-settings", component: UserProfileSettingsComponent },
      { path: "profile/:id", component: UserProfileComponent },
      {
        path: "drawing/:id",
        component: DrawingPageComponent,
      },
      {
        path: 'gallery', component: DrawingGalleryComponent
      },
      { path: 'forgot-password', component: ChangePasswordComponent },
      { path: "popped-chat/:id", component: ChatPopedOutComponent },
    ]
  },
  {
    path: "auth",
    component: AuthWrapperComponent,
    canActivate: [AngularFireAuthGuard],
    data: {
      authGuardPipe: redirectLoggedInToMenu
    },
    children: [
      {
        path: "",
        component: LandingPageComponent,
      },
      {
        path: "login",
        component: LoginComponent,
      },
      {
        path: "register",
        component: RegisterComponent,
      },
      {
        path: "forgot-password",
        component: ForgotPasswordComponent
      }
    ]
  },
  { path: "offline", component: OfflineComponent },
  { path: "**", redirectTo: "" },
  { path: 'forgot-password', component: ChangePasswordComponent },
]

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
