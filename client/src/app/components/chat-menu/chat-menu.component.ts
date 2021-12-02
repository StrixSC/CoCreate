import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { MatSnackBar, MatDialogRef } from '@angular/material';
import { map } from 'rxjs/operators';
import { merge, Subscription } from 'rxjs';
import { ChatService } from 'src/app/services/chat/chat.service';
import { ChatSidebarService } from './../../services/chat-sidebar.service';
import { Component, OnInit } from '@angular/core';

export interface IAllChannelResponse {
  channel_id: string;
  collaboration_id: string;
  member_count: number;
  name: string;
  online_member_count: number;
  owner_username: string;
  type: string;
  updated_at: string;
}

@Component({
  selector: 'app-chat-menu',
  templateUrl: './chat-menu.component.html',
  styleUrls: ['./chat-menu.component.scss']
})
export class ChatMenuComponent implements OnInit {

  isLoading = false;
  channelsSubscription: Subscription;
  exceptionSubscription: Subscription;
  allPublicChannels: IAllChannelResponse[] = [];
  filteredChannels: IAllChannelResponse[] = [];
  displayedColumns = ['name', 'lastActivity', 'owner', 'memberCount', 'actions'];
  filterForm: FormGroup;
  constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<ChatMenuComponent>, private snackbar: MatSnackBar, private chatSidebarService: ChatSidebarService, private chatSocketService: ChatService) { }
  ngOnInit() {
    this.filterForm = this.fb.group({
      filter: ['']
    });
    this.channelsSubscription = merge(
      this.chatSocketService.listenCreatedChannels().pipe(map((d: any) => ({ ...d, message: 'Succès!' }))),
      this.chatSocketService.leftChannel().pipe(map((d: any) => ({ ...d, message: 'Succès!' }))),
      this.chatSocketService.onChannelUpdated().pipe(map((d: any) => ({ ...d, message: 'Succès!' }))),
      this.chatSocketService.onChannelDelete().pipe(map((d: any) => ({ ...d, message: 'Succès!' }))),
      this.chatSocketService.joinedChannel().pipe(map((d: any) => ({ ...d, message: 'Succès!' }))),
    ).subscribe((c) => {
      this.isLoading = false;
      this.dialogRef.disableClose = false;
      this.fetchAllChannels();
      this.snackbar.open(c.message, 'OK', { duration: 2000 });
      console.log(c);
    });

    this.exceptionSubscription = merge(
      this.chatSocketService.onChannelDeleteException(),
      this.chatSocketService.onChannelUpdateException(),
      this.chatSocketService.onChannelLeaveException(),
      this.chatSocketService.onChannelJoinException(),
    ).subscribe((s: any) => {
      this.dialogRef.disableClose = true;
      this.isLoading = false;
      this.snackbar.open(s.message, 'OK', { duration: 3000 });
    })

    this.fetchAllChannels();
  }

  fetchAllChannels(): void {
    const channelSub = this.chatSidebarService.fetchAllChannels().subscribe((d) => {
      this.allPublicChannels = d;
      this.filteredChannels = this.allPublicChannels.filter((c) => JSON.stringify(c).includes(this.filter.value));
      channelSub.unsubscribe();
      console.log(d);
    });
  }

  get filter(): AbstractControl {
    return this.filterForm.get('filter')!;
  }

  filterChannels(): any {
    this.filteredChannels = this.allPublicChannels.filter((c) => JSON.stringify(c).includes(this.filter.value));
  }

  joinChannel(channel: IAllChannelResponse): void {
    this.loadingProcedure();
    this.chatSocketService.joinChannel(channel.channel_id);
  }

  leaveChannel(channel: IAllChannelResponse): void {
    this.loadingProcedure();
    this.chatSocketService.leaveChannel(channel.channel_id);
  }

  ngOnDestroy(): void {
    if (this.channelsSubscription) {
      this.channelsSubscription.unsubscribe();
    }
  }

  deleteChannel(channel: IAllChannelResponse): void {
    this.loadingProcedure();
    this.chatSocketService.deleteChannel(channel.channel_id);
  }

  createChannel(): void {
    this.dialogRef.close('CREATE');
  }

  loadingProcedure(): void {
    this.isLoading = true;
    this.dialogRef.disableClose = true;
  }

}
