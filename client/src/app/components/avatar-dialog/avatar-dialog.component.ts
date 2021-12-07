import { MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Subscription } from 'rxjs';
import { AuthService } from './../../services/auth.service';
import { Component, OnInit, Inject } from '@angular/core';

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
  constructor(private dialogRef: MatDialogRef<AvatarDialogComponent>, private auth: AuthService, private snackBar: MatSnackBar, @Inject(MAT_DIALOG_DATA) private data: {
    getUserHistory: boolean;
  }) { }

  ngOnInit() {
    this.isLoading = true;
    if (this.data && this.data.getUserHistory) {
      this.avatarSub = this.auth.getUserAvatars().subscribe((d: { avatars: string[] }) => {
        this.avatars = d.avatars;
        this.isLoading = false;
      }, (error: Error) => {
        this.snackBar.open('Une erreur a survenu lors de la demande des avatars, essayez à nouveau plus tard...', '', {
          duration: 5000
        })
      });
    } else {

      this.avatarSub = this.auth.getPublicAvatars().subscribe((d: { avatars: string[] }) => {
        this.avatars = d.avatars;
        this.isLoading = false;
      }, (error: Error) => {
        this.snackBar.open('Une erreur a survenu lors de la demande des avatars, essayez à nouveau plus tard...', '', {
          duration: 5000
        })
      })
    }
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
    if (index !== undefined && index !== null) {
      this.dialogRef.close(this.avatars[index]);
    } else {
      this.dialogRef.close();
    }
  }
}
