import { ChatGuard } from './guards/chat.guard';
//import { ChatComponent } from './components/chat/chat.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { DrawingPageComponent } from './components/drawing-page/drawing-page.component';

const routes: Routes = [
  { path: "", redirectTo: "login", pathMatch: "full" },
  { path: "login", component: LoginPageComponent },
  { path: "drawing", component: DrawingPageComponent, canActivate: [ChatGuard] },/*
  { path: "chat", component: ChatComponent, canActivate: [ChatGuard] },
  { path: "**", redirectTo: "chat" }*/
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
