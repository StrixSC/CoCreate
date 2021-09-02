import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorkspaceService } from 'src/app/services/workspace/workspace.service';

/// Service pour créer des nouveau canvas de dessin
@Injectable()
export class NewDrawingService {

  form: FormGroup;
  private isSizeModified = false;

  constructor(
    private formBuilder: FormBuilder,
    private workspaceService: WorkspaceService,
  ) {
    this.form = this.formBuilder.group({
      size: this.formBuilder.group({
        width: this.formBuilder.control(0, [Validators.required, Validators.min(0), Validators.pattern('[0-9]*')]),
        height: this.formBuilder.control(0, [Validators.required, Validators.min(0), Validators.pattern('[0-9]*')]),
      }),
    });
    this.sizeGroup.valueChanges.subscribe((size) => {
      this.isSizeModified = !(size.width === this.workspaceService.width && size.height === this.workspaceService.height);
      this.form.updateValueAndValidity();
    });
  }

  get sizeGroup(): FormGroup {
    return this.form.get('size') as FormGroup;
  }

  /// Réajuste le grandeur du workspace
  onResize(): void {
    if (!this.isSizeModified) {
      this.sizeGroup.setValue({ width: this.workspaceService.width, height: this.workspaceService.height });
    }
  }
}
