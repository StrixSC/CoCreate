import { CreateChannelDialogComponent } from './components/create-channel-dialog/create-channel-dialog.component';
import { ChatWindowComponent } from './components/chat-window/chat-window.component';
import { ChatComponent } from './components/chat/chat.component';
import { ChatMenuComponent } from './components/chat-menu/chat-menu.component';
import { ChatChannelListComponent } from './chat-channel-list/chat-channel-list.component';
import { DeleteConfirmationDialogComponent } from './components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { TeamInfoComponent } from './components/team-info/team-info.component';
import { TeamPasswordDialogComponent } from './components/team-password-dialog/team-password-dialog.component';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { CreateTeamDialogComponent } from './components/create-team-dialog/create-team-dialog.component';
import { TeamPageComponent } from './components/team-page/team-page.component';
import { AvatarDialogComponent } from './components/avatar-dialog/avatar-dialog.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthWrapperComponent } from './components/auth-wrapper/auth-wrapper.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { LoginComponent } from './components/login/login.component';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireAuthGuardModule } from '@angular/fire/auth-guard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorIntl, MatSnackBarContainer } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MomentModule } from 'ngx-moment';
import { environment } from 'src/environments/environment';
import { MaterialModules } from './app-material.module';
import { ColorPickerModule } from './color-picker/color-picker.module';
import { AlertMessageComponent } from './components/alert-message/alert-message.component';
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
import { StdHttpInterceptor } from './http/stdhttp.interceptor';
import { SocketService } from './services/chat/socket.service';
import { ErrorMessageComponent } from './components/error-message/error-message.component';
import { ToolParameterModule } from './components/tool-parameters/tool-parameter.module';
import { AppRoutingModule } from './app-routing.module';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { DrawingPageComponent } from './components/drawing-page/drawing-page.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { ChangePasswordComponent } from './components/login/change-password/change-password.component';
import { DrawingGalleryComponent } from './components/drawing-gallery/drawing-gallery.component';
import { DrawingGalleryCardComponent } from './components/drawing-gallery-card/drawing-gallery-card.component';
import { DrawingPreviewDialogComponent } from './components/drawing-preview-dialog/drawing-preview-dialog.component';
import { CreateDrawingComponent } from './components/create-drawing/create-drawing.component';
import { MenuPageComponent } from './components/menu-page/menu-page.component';
import { NewDrawingFormDialogComponent } from './components/new-drawing-form-dialog/new-drawing-form-dialog.component';
import { CollaborationPasswordFormDialogComponent } from './components/collaboration-password-form-dialog/collaboration-password-form-dialog.component';
import { TopBarComponent } from './components/top-bar/top-bar.component';
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
    AvatarDialogComponent,
    WorkspaceComponent,
    SidenavComponent,
    CanvasComponent,
    ChatChannelListComponent,
    ChatMenuComponent,
    ControlMenuComponent,
    ParameterDirective,
    SaveDrawingComponent,
    OpenDrawingComponent,
    ErrorMessageComponent,
    AlertMessageComponent,
    CreateTeamDialogComponent,
    ExportDrawingComponent,
    ChatComponent,
    DrawingPageComponent,
    UserProfileComponent,
    TeamPageComponent,
    ChangePasswordComponent,
    DrawingGalleryComponent,
    DeleteConfirmationDialogComponent,
    DrawingGalleryCardComponent,
    LoginComponent,
    ForgotPasswordComponent,
    LandingPageComponent,
    DrawingPreviewDialogComponent,
    CreateDrawingComponent,
    MenuPageComponent,
    RegisterComponent,
    NewDrawingFormDialogComponent,
    CollaborationPasswordFormDialogComponent,
    TopBarComponent,
    RightSidebarComponent,
    ChatBoxComponent,
    ChatPopedOutComponent,
    AllChannelsComponent,
    AuthWrapperComponent,
    AllChannelsComponent,
    ChatWindowComponent,
    CreateChannelDialogComponent,
    TeamInfoComponent,
    TeamPasswordDialogComponent,
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
    AngularFireStorageModule,
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
  exports: [AppRoutingModule,
  ],
  entryComponents: [
    NewDrawingAlertComponent,
    NewDrawingComponent,
    CreateChannelDialogComponent,
    TeamPasswordDialogComponent,
    DeleteConfirmationDialogComponent,
    TeamInfoComponent,
    ToolsColorPickerComponent,
    WorkspaceComponent,
    ControlMenuComponent,
    ChatMenuComponent,
    AvatarDialogComponent,
    SaveDrawingComponent,
    NewDrawingFormDialogComponent,
    ExportDrawingComponent,
    OpenDrawingComponent,
    ErrorMessageComponent,
    AlertMessageComponent,
    DrawingPreviewDialogComponent,
    MatSnackBarContainer,
    CreateTeamDialogComponent,
    CollaborationPasswordFormDialogComponent,
  ],
  providers: [
    FileReader,
    SocketService,
    { provide: HTTP_INTERCEPTORS, useClass: StdHttpInterceptor, multi: true },
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    MatPaginatorIntl
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
