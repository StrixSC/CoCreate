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
import { SignUpPageComponent } from './components/login/sign-up-page/sign-up-page.component';
import { WelcomePageComponent } from './components/login/welcome-page/welcome-page.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { ChatPopedOutComponent } from "./components/right-sidebar/chat-poped-out/chat-poped-out.component";

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo([""]);
const redirectLoggedInToMenu = () => redirectLoggedInTo(["menu"]);

const routes: Routes = [
  {
    path: "", children: [
      {
        path: "",
        component: WelcomePageComponent,
        canActivate: [AngularFireAuthGuard],
        data: {
          authGuardPipe: redirectLoggedInToMenu,
        },
      },
      { path: "workspace", component: SidenavComponent },
      { path: "profile", component: UserProfileComponent },
      {
        path: "drawing",
        component: DrawingPageComponent,
        canActivate: [AngularFireAuthGuard],

      },
      {
        path: 'gallery', component: DrawingGalleryComponent, canActivate: [AngularFireAuthGuard], data: {
          authGuardPipe: redirectUnauthorizedToLogin,
        }
      },
      {
        path: 'menu', component: MenuPageComponent, canActivate: [AngularFireAuthGuard], data: {
          authGuardPipe: redirectUnauthorizedToLogin,
        }
      },
      { path: 'forgot-password', component: ChangePasswordComponent },
      { path: "popped-chat/:id", component: ChatPopedOutComponent },
    ]
  },
  {
    path: "auth",
    component: LandingPageComponent,
    canActivate: [AngularFireAuthGuard],
    data: {
      authGuardPipe: redirectLoggedInToMenu
    },
    children: [
      {
        path: "login",
        component: LoginComponent,
      },
      {
        path: "register",
        component: SignUpPageComponent,
      },
      {
        path: "forgot-password",
        component: ForgotPasswordComponent
      }
    ]
  },
  { path: "offline", component: OfflineComponent },
  { path: "**", redirectTo: "" }
]

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
