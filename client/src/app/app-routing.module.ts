import { ProfileComponent } from './components/profile/profile.component';
import { AccountComponent } from './components/account/account.component';
import { ServerErrorComponent } from './components/server-error/server-error.component';
import { ChatWindowComponent } from './components/chat-window/chat-window.component';
import { TeamPageComponent } from './components/team-page/team-page.component';
import { TopBarComponent } from './components/top-bar/top-bar.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthWrapperComponent } from './components/auth-wrapper/auth-wrapper.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { LoginComponent } from './components/login/login.component';
import { MenuPageComponent } from './components/menu-page/menu-page.component';
import { DrawingGalleryComponent } from './components/drawing-gallery/drawing-gallery.component';
import { NgModule } from '@angular/core';
import { AngularFireAuthGuard, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { RouterModule, Routes } from '@angular/router';
import { DrawingPageComponent } from './components/drawing-page/drawing-page.component';
import { ChangePasswordComponent } from './components/login/change-password/change-password.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(["auth"]);
const redirectLoggedInToMenu = () => redirectLoggedInTo(["menu"]);

const routes: Routes = [
  {
    path: "server-error", component: ServerErrorComponent
  },
  {
    path: "chatbox/:id", component: ChatWindowComponent, canActivate: [AngularFireAuthGuard], data: {
      authGuardPipe: redirectUnauthorizedToLogin,
    }
  },
  {
    path: "", component: TopBarComponent, canActivate: [AngularFireAuthGuard], data: {
      authGuardPipe: redirectUnauthorizedToLogin,
    }, children: [
      {
        path: "", component: MenuPageComponent
      },
      {
        path: "teams", component: TeamPageComponent,
      },
      { path: "workspace", component: SidenavComponent },
      { path: "account", component: AccountComponent },
      { path: "profile", component: ProfileComponent },
      {
        path: "drawing/:id",
        component: DrawingPageComponent,
      },
      {
        path: 'gallery', component: DrawingGalleryComponent
      },
      { path: 'forgot-password', component: ChangePasswordComponent },
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
        redirectTo: "/auth/login",
        pathMatch: "full"
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
  { path: "**", redirectTo: "" }
]

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
