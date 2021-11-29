import { v4 } from 'uuid';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Subscription, Observable, timer } from 'rxjs';
import { TeamService } from './../../services/team.service';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/storage';

@Component({
  selector: 'app-create-team-dialog',
  templateUrl: './create-team-dialog.component.html',
  styleUrls: ['./create-team-dialog.component.scss']
})
export class CreateTeamDialogComponent implements OnInit {

  creationForm: FormGroup;
  isLoading: boolean = false;
  ref: AngularFireStorageReference;
  task: AngularFireUploadTask;
  exceptionSubscription: Subscription;
  createSubscription: Subscription;
  activeUrlBlob: Blob | null = null;
  readonly defaultImage = "/assets/img/default.png"

  types = [
    { key: 'Protected', value: 'Protégé' },
    { key: 'Public', value: 'Public' }
  ];

  mascots = [
    { key: '', value: 'Choisir pour moi!' },
    { key: 'tiger', value: 'Tigre' },
    { key: 'lion', value: 'Lion' },
    { key: 'elephant', value: 'Éléphant' },
    { key: 'walrus', value: 'Morse' },
    { key: 'gorilla', value: 'Gorille' },
    { key: 'cobra', value: 'Cobra' },
    { key: 'zebra', value: 'Zebre' },
    { key: 'horse', value: 'Cheval' },
    { key: 'eagle', value: 'Aigle' }
  ];

  constructor(
    private auth: AuthService,
    private snackbar: MatSnackBar,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateTeamDialogComponent>,
    private teamService: TeamService,
  ) { }

  ngOnInit() {
    this.createSubscription = this.teamService.onCreationFinished().subscribe((d) => {
      if (d) {
        this.dialogRef.disableClose = false;
        this.isLoading = false;
        this.snackbar.open(`Équipe "${this.teamName.value}" a été créée avec succès!`, 'OK', { duration: 5000 });
        this.dialogRef.close();
      }
    }, (error) => {
      console.log(error);
      this.errorRoutine(error);
    });

    this.exceptionSubscription = this.teamService.onCreationException().subscribe((data: any) => this.errorRoutine(data))

    this.creationForm = this.fb.group({
      teamName: ['', [Validators.minLength(4), Validators.maxLength(256), Validators.required]],
      bio: ['', [Validators.maxLength(1024)]],
      type: ['', [Validators.required]],
      password: ['', []],
      maxMemberCount: [4, [Validators.min(1), Validators.max(30)]],
      mascot: ['', []]
    })
  }

  ngOnDestroy(): void {
    if (this.createSubscription) {
      this.createSubscription.unsubscribe();
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  changeType(e: any) {
    if (this.type.value === 'Protected') {
      this.password.setValidators([
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(256)
      ]);
    } else {
      this.password.setValidators([]);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.creationForm.valid && this.auth.activeUser) {
      this.creationForm.disable();
      this.dialogRef.disableClose = true;
      this.isLoading = true;
      if (!this.mascot.value) {
        this.mascot.setValue(this.getRandomMascot());
      }

      const payload = {
        teamName: this.teamName.value,
        bio: this.bio.value,
        maxMemberCount: this.maxMemberCount.value,
        type: this.type.value,
        password: this.password.value,
        mascot: this.mascot.value
      }

      this.teamService.sendCreateTeam(payload);
    }
  }

  get maxMemberCount(): AbstractControl {
    return this.creationForm.get('maxMemberCount')!;
  }

  get password(): AbstractControl {
    return this.creationForm.get('password')!;
  }

  get teamName(): AbstractControl {
    return this.creationForm.get('teamName')!;
  }

  get type(): AbstractControl {
    return this.creationForm.get('type')!;
  }

  get bio(): AbstractControl {
    return this.creationForm.get('bio')!;
  }

  get mascot(): AbstractControl {
    return this.creationForm.get('mascot')!;
  }

  errorRoutine(data: any): void {
    this.snackbar.open(data.message, '', { duration: 5000 });
    this.creationForm.enable();
    this.isLoading = false;
    this.dialogRef.disableClose = false;
  }

  getRandomMascot(): string {
    const max = this.mascots.length - 1;
    const min = 1;
    return this.mascots[Math.floor(Math.random() * (max - min + 1) + min)].key;
  }

}
