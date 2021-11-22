import { NgModule } from '@angular/core';
import { AngularFireAuthGuard, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { RouterModule, Routes } from '@angular/router';
import { DrawingGalleryComponent } from './components/drawing-gallery/drawing-gallery.component';
import { DrawingPageComponent } from './components/drawing-page/drawing-page.component';
import { ChangePasswordComponent } from './components/login/change-password/change-password.component';
import { SignUpPageComponent } from './components/login/sign-up-page/sign-up-page.component';
import { WelcomePageComponent } from './components/login/welcome-page/welcome-page.component';
import { MenuPageComponent } from './components/menu-page/menu-page.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { ChatPopedOutComponent } from "./components/right-sidebar/chat-poped-out/chat-poped-out.component";

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo([""]);
const redirectLoggedInToDrawing = () => redirectLoggedInTo(["drawing"]);

const routes: Routes = [
  {
    path: "",
    component: WelcomePageComponent,
    canActivate: [AngularFireAuthGuard],
    data: {
      authGuardPipe: redirectLoggedInToDrawing,
    },
  },
  {
    path: "register",
    component: SignUpPageComponent,
    canActivate: [AngularFireAuthGuard],
    data: {
      authGuardPipe: redirectLoggedInToDrawing,
    },
  },
  { path: "workspace", component: SidenavComponent },
  { path: "profile", component: UserProfileComponent },
  {
    path: "drawing",
    component: DrawingPageComponent,
    canActivate: [AngularFireAuthGuard],
    data: {
      authGuardPipe: redirectUnauthorizedToLogin,
  }},
  { path: 'gallery', component: DrawingGalleryComponent, canActivate: [AngularFireAuthGuard], data: {
    authGuardPipe: redirectUnauthorizedToLogin,
  }},
  { path: 'menu', component: MenuPageComponent, canActivate: [AngularFireAuthGuard], data: {
    authGuardPipe: redirectUnauthorizedToLogin,
  }},
  { path: 'forgot-password', component: ChangePasswordComponent },
  { path: '**', redirectTo: '' },
  { path: "popped-chat/:id", component: ChatPopedOutComponent },
  { path: "forgot-password", component: ChangePasswordComponent },
  { path: "**", redirectTo: "" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
