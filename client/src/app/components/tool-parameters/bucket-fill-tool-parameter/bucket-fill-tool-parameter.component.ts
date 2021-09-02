import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BucketFillToolService } from 'src/app/services/tools/bucket-fill-tool/bucket-fill-tool.service';

@Component({
  selector: 'app-bucket-fill-tool-parameter',
  templateUrl: './bucket-fill-tool-parameter.component.html',
  styleUrls: ['./bucket-fill-tool-parameter.component.scss'],
})

/// Le component d'affichage des paramètres du applicateur de couleur
export class BucketFillToolParameterComponent implements OnInit {

  form: FormGroup;
  currentStrokeStyle: { id: number, type: string, tooltip: string };

  constructor(private bucketFillToolService: BucketFillToolService) { }

  ngOnInit(): void {
    this.form = this.bucketFillToolService.parameters;
  }

  get toolName(): string {
    return this.bucketFillToolService.toolName;
  }

}
