import { NgModule } from "@angular/core";
import {
  AngularFireAuthGuard,
  redirectLoggedInTo,
  redirectUnauthorizedTo,
} from "@angular/fire/auth-guard";
import { RouterModule, Routes } from "@angular/router";
import { ChatComponent } from "./components/chat/chat.component";
import { DrawingPageComponent } from "./components/drawing-page/drawing-page.component";
import { ChangePasswordComponent } from "./components/login/change-password/change-password.component";
import { SignUpPageComponent } from "./components/login/sign-up-page/sign-up-page.component";
import { WelcomePageComponent } from "./components/login/welcome-page/welcome-page.component";
import { ChatPopedOutComponent } from "./components/right-sidebar/chat-poped-out/chat-poped-out.component";
import { SidenavComponent } from "./components/sidenav/sidenav.component";
import { UserProfileComponent } from "./components/user-profile/user-profile.component";

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
    },
  },
  { path: "popped-chat/:id", component: ChatPopedOutComponent },
  { path: "chat", component: ChatComponent },
  { path: "forgot-password", component: ChangePasswordComponent },
  { path: "**", redirectTo: "" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
