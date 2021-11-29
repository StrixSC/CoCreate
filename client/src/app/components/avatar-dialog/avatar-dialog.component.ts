import { MatSnackBar, MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';
import { AuthService } from './../../services/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-avatar-dialog',
  templateUrl: './avatar-dialog.component.html',
  styleUrls: ['./avatar-dialog.component.scss']
})
export class AvatarDialogComponent implements OnInit {

  isLoading: boolean = false;
  selectedIndex: number = 0;
  avatarSub: Subscription;
  avatars: string[];
  constructor(private dialogRef: MatDialogRef<AvatarDialogComponent>, private auth: AuthService, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.isLoading = true;
    this.avatarSub = this.auth.getPublicAvatars().subscribe((d: { avatars: string[] }) => {
      this.avatars = d.avatars;
      this.isLoading = false;
    }, (error) => {
      this.snackBar.open('Une erreur a survenu lors de la demande des avatars, essayez à nouveau plus tard...', '', {
        duration: 5000
      })
    })
  }

  ngOnDestroy(): void {
    if (this.avatarSub) {
      this.avatarSub.unsubscribe();
    }
  }

  selectAvatarByIndex(index: number): void {
    this.selectedIndex = index;
  }

  close(index?: number): void {
    if (index) {
      this.dialogRef.close(this.avatars[index]);
    } else {
      this.dialogRef.close();
    }
  }
}
