import { IChannelCreatedResponse } from './../../model/IChannel.model';
import { MatSnackBar, MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';
import { ChatService } from 'src/app/services/chat/chat.service';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-create-channel-dialog',
  templateUrl: './create-channel-dialog.component.html',
  styleUrls: ['./create-channel-dialog.component.scss']
})
export class CreateChannelDialogComponent implements OnInit {

  channelCreatedSubscription: Subscription;
  createExceptionSubscription: Subscription;
  nameForm: FormGroup;
  isLoading: boolean = false;
  constructor(public dialogRef: MatDialogRef<CreateChannelDialogComponent>, private snackbar: MatSnackBar, private fb: FormBuilder, private chatService: ChatService) { }

  ngOnInit() {
    this.channelCreatedSubscription = this.chatService.listenCreatedChannels().subscribe((c: IChannelCreatedResponse) => {
      this.isLoading = false;
      this.dialogRef.disableClose = false;
      this.dialogRef.close()
      this.snackbar.open(`Succès! La chaîne de clavardage "${c.channelName}" a été créée!`, "OK", { duration: 2000 });
    });

    this.createExceptionSubscription = this.chatService.onChannelCreateException().subscribe((s: any) => {
      this.dialogRef.disableClose = false;
      this.isLoading = false;
      this.snackbar.open(s.message, 'OK', { duration: 3000 });
    });

    this.nameForm = this.fb.group({
      channelName: ['', [Validators.minLength(4), Validators.maxLength(256), Validators.required]]
    });
  }

  get channelName(): AbstractControl {
    return this.nameForm.get('channelName')!;
  }

  onSubmit(): void {
    if (this.isLoading || !this.nameForm.valid) {
      return;
    }

    this.dialogRef.disableClose = true;
    this.isLoading = true;
    this.chatService.createChannel(this.channelName.value);
  }

}
