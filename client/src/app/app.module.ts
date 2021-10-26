import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarContainer } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MomentModule } from 'ngx-moment';
import { AlertMessageComponent } from './components/alert-message/alert-message.component';
import { MaterialModules } from './app-material.module';
import { ColorPickerModule } from './color-picker/color-picker.module';
import { AppComponent } from './components/app/app.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { ControlMenuComponent } from './components/control-menu/control-menu.component';
import { ExportDrawingComponent } from './components/export-drawing/export-drawing.component';
import { NewDrawingAlertComponent } from './components/new-drawing/new-drawing-alert/new-drawing-alert.component';
import { NewDrawingFormComponent } from './components/new-drawing/new-drawing-form/new-drawing-form.component';
import { NewDrawingComponent } from './components/new-drawing/new-drawing.component';
import { OpenDrawingComponent } from './components/open-drawing/open-drawing.component';
import { ParameterMenuComponent } from './components/parameter-menu/parameter-menu.component';
import { ParameterDirective } from './components/parameter-menu/parameter.directive';
import { SaveDrawingComponent } from './components/save-drawing/save-drawing.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { ToolsColorPickerComponent } from './components/tools-color-picker/tools-color-picker.component';
import { ToolsColorComponent } from './components/tools-color/tools-color.component';
import { WelcomeDialogModule } from './components/welcome-dialog/welcome-dialog.module';
import { WorkspaceComponent } from './components/workspace/workspace.component';
import { ErrorMessageComponent } from './components/error-message/error-message.component';
import { ToolParameterModule } from './components/tool-parameters/tool-parameter.module';
import { AppRoutingModule } from './app-routing.module';
import { LoginPageComponent } from './components/login/login-page/login-page.component';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { ChatComponent } from './components/chat/chat.component';
import { DrawingPageComponent } from './components/drawing-page/drawing-page.component';
import { WelcomePageComponent } from './components/login/welcome-page/welcome-page.component';
import { SignUpPageComponent } from './components/login/sign-up-page/sign-up-page.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { ChangePasswordComponent } from './components/login/change-password/change-password.component';

@NgModule({
  declarations: [
    AppComponent,
    ParameterMenuComponent,
    WorkspaceComponent,
    SidenavComponent,
    CanvasComponent,
    NewDrawingComponent,
    NewDrawingFormComponent,
    NewDrawingAlertComponent,
    ToolsColorComponent,
    ToolsColorPickerComponent,
    ParameterMenuComponent,
    WorkspaceComponent,
    SidenavComponent,
    CanvasComponent,
    ControlMenuComponent,
    ParameterDirective,
    SaveDrawingComponent,
    OpenDrawingComponent,
    ErrorMessageComponent,
    AlertMessageComponent,
    ExportDrawingComponent,
    LoginPageComponent,
    ChatComponent,
    DrawingPageComponent,
    WelcomePageComponent,
    SignUpPageComponent,
    UserProfileComponent,
    ChangePasswordComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    MaterialModules,
    WelcomeDialogModule,
    ColorPickerModule,
    FontAwesomeModule,
    ToolParameterModule,
    MomentModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    AppRoutingModule
  ],
  exports: [AppRoutingModule,
  ],
  entryComponents: [
    NewDrawingAlertComponent,
    NewDrawingComponent,
    ToolsColorPickerComponent,
    WorkspaceComponent,
    ControlMenuComponent,
    SaveDrawingComponent,
    ExportDrawingComponent,
    OpenDrawingComponent,
    ErrorMessageComponent,
    AlertMessageComponent,
    MatSnackBarContainer,
  ],
  providers: [
    FileReader,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
