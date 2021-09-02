import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModules } from 'src/app/app-material.module';
import { HelpDialogComponent } from './help-dialog/help-dialog.component';
import { WelcomeDialogComponent } from './welcome-dialog/welcome-dialog.component';

@NgModule({
    imports: [CommonModule, MaterialModules, FormsModule, ReactiveFormsModule],
    declarations: [WelcomeDialogComponent, HelpDialogComponent],
    entryComponents: [WelcomeDialogComponent, HelpDialogComponent],
})

export class WelcomeDialogModule { }
