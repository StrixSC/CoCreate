import { UpdateProfileDialogComponent } from './../update-profile-dialog/update-profile-dialog.component';
import { UserResponse, Log } from './../../model/IUser.model';
import { UserService } from 'src/app/services/user.service';
import { UpdatePasswordDialogComponent } from './../update-password-dialog/update-password-dialog.component';
import { MatDialog, MatSlideToggleChange, MatSnackBar, MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  isLoading: boolean;
  userInfo: UserResponse;
  logs: MatTableDataSource<Log>;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  historyDataColumns = ['entry', 'link', 'time'];
  statsDataColumns = ['key', 'value'];
  updateUserForm: FormGroup;
  constructor(private snackBar: MatSnackBar, private userService: UserService, private dialog: MatDialog, private fb: FormBuilder) { }

  ngOnInit() {
    this.isLoading = true;
  }

  ngAfterViewInit() {
    this.fetchUserAccount();
  }

  openPasswordDialog() {
    this.dialog.open(UpdatePasswordDialogComponent);
  }

  openUpdateProfileDialog() {
    this.dialog.open(UpdateProfileDialogComponent, { data: this.userInfo }).afterClosed().subscribe((c) => {
      this.fetchUserAccount();
    })
  }

  onConfidentialityChange(event: MatSlideToggleChange) {
    const previousValue = !event.checked;
    this.userService.toggleConfidentiality({ value: event.checked }).subscribe(() => {
      this.snackBar.open('Succès! Niveau de confidentialité modifié.', "OK", { duration: 1500 });
    }, (error: Error) => {
      event.source.checked = previousValue;
      this.snackBar.open(error.message, 'OK', { duration: 1500 });
    })
  }

  fetchUserAccount() {
    this.userService.fetchUserInformation().subscribe((c: UserResponse) => {
      this.userInfo = c;
      console.log(this.userInfo);
      this.logs = new MatTableDataSource(this.userInfo.logs);
      this.isLoading = false;
      setTimeout(
        () => {
          this.logs.paginator = this.paginator;
        });
    })
  }
}
