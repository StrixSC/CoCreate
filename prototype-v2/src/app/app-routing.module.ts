import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginPageComponent } from './components/login-page/login-page.component';

const routes: Routes = [
  { path: "", component: LoginPageComponent },
  { path: "chat", component: AppComponent },
  { path: "**", redirectTo: "chat"}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
