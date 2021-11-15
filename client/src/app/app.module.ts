import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { AngularFireModule } from "@angular/fire";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFireAuthGuardModule } from "@angular/fire/auth-guard";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatSnackBarContainer } from "@angular/material";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { MomentModule } from "ngx-moment";
import { environment } from "src/environments/environment";
import { MaterialModules } from "./app-material.module";
import { AppRoutingModule } from "./app-routing.module";
import { ColorPickerModule } from "./color-picker/color-picker.module";
import { AlertMessageComponent } from "./components/alert-message/alert-message.component";
import { AppComponent } from "./components/app/app.component";
import { CanvasComponent } from "./components/canvas/canvas.component";
import { ControlMenuComponent } from "./components/control-menu/control-menu.component";
import { DrawingPageComponent } from "./components/drawing-page/drawing-page.component";
import { ErrorMessageComponent } from "./components/error-message/error-message.component";
import { ExportDrawingComponent } from "./components/export-drawing/export-drawing.component";
import { ChangePasswordComponent } from "./components/login/change-password/change-password.component";
import { LoginPageComponent } from "./components/login/login-page/login-page.component";
import { SignUpPageComponent } from "./components/login/sign-up-page/sign-up-page.component";
import { WelcomePageComponent } from "./components/login/welcome-page/welcome-page.component";
import { NewDrawingAlertComponent } from "./components/new-drawing/new-drawing-alert/new-drawing-alert.component";
import { NewDrawingFormComponent } from "./components/new-drawing/new-drawing-form/new-drawing-form.component";
import { NewDrawingComponent } from "./components/new-drawing/new-drawing.component";
import { OpenDrawingComponent } from "./components/open-drawing/open-drawing.component";
import { ParameterMenuComponent } from "./components/parameter-menu/parameter-menu.component";
import { ParameterDirective } from "./components/parameter-menu/parameter.directive";
import { SaveDrawingComponent } from "./components/save-drawing/save-drawing.component";
import { SidenavComponent } from "./components/sidenav/sidenav.component";
import { ToolParameterModule } from "./components/tool-parameters/tool-parameter.module";
import { ToolsColorPickerComponent } from "./components/tools-color-picker/tools-color-picker.component";
import { ToolsColorComponent } from "./components/tools-color/tools-color.component";
import { UserProfileComponent } from "./components/user-profile/user-profile.component";
import { WelcomeDialogModule } from "./components/welcome-dialog/welcome-dialog.module";
import { WorkspaceComponent } from "./components/workspace/workspace.component";
import { StdHttpInterceptor } from "./http/stdhttp.interceptor";
import { SocketService } from "./services/chat/socket.service";
import { RightSidebarComponent } from "./components/right-sidebar/right-sidebar.component";
import { ChatBoxComponent } from "./components/right-sidebar/chat-box/chat-box.component";
import { ChatPopedOutComponent } from "./components/right-sidebar/chat-poped-out/chat-poped-out.component";
import { AllChannelsComponent } from "./components/right-sidebar/all-channels/all-channels.component";

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
    DrawingPageComponent,
    WelcomePageComponent,
    SignUpPageComponent,
    UserProfileComponent,
    ChangePasswordComponent,
    RightSidebarComponent,
    ChatBoxComponent,
    ChatPopedOutComponent,
    AllChannelsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    MaterialModules,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFireAuthGuardModule,
    WelcomeDialogModule,
    ColorPickerModule,
    FontAwesomeModule,
    ToolParameterModule,
    MomentModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    AppRoutingModule,
  ],
  exports: [AppRoutingModule],
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
    SocketService,
    { provide: HTTP_INTERCEPTORS, useClass: StdHttpInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
