import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material';
import { StampStyle } from 'src/app/model/stamp-style.model';
import { StampToolService } from 'src/app/services/tools/stamp-tool/stamp-tool.service';
import {
  emoji1SvgString, emoji2SvgString, emoji3SvgString, emoji4SvgString, emoji5SvgString, emoji6SvgString, emoji7SvgString,
  emoji8SvgString
} from 'src/assets/stamps/svg';

const SMILEY = 0;
const SAD = 1;
const FROWNY = 2;
const HEART = 3;
const UP = 4;
const GHOST = 5;
const TONGUE = 6;
const KISS = 7;

@Component({
  selector: 'app-etampe-tool-parameter',
  templateUrl: './stamp-tool-parameter.component.html',
  styleUrls: ['./stamp-tool-parameter.component.scss'],
})
export class StampToolParameterComponent implements OnInit {
  constructor(private stampToolService: StampToolService) { }

  get toolName(): string {
    return this.stampToolService.toolName;
  }

  form: FormGroup;
  styles: StampStyle[] = [
    {
      id: SMILEY,
      svgString: emoji1SvgString,
      tooltip: 'Content',
    },
    {
      id: SAD,
      svgString: emoji2SvgString,
      tooltip: 'Triste',
    },
    {
      id: FROWNY,
      svgString: emoji3SvgString,

      tooltip: 'Facher',
    },
    {
      id: HEART,
      svgString: emoji4SvgString,

      tooltip: 'Coeur',
    },
    {
      id: UP,
      svgString: emoji5SvgString,

      tooltip: 'Pouce',
    },
    {
      id: GHOST,
      svgString: emoji6SvgString,

      tooltip: 'Fantôme',
    },
    {
      id: TONGUE,
      svgString: emoji7SvgString,
      tooltip: 'Grimace',
    },
    {
      id: KISS,
      svgString: emoji8SvgString,

      tooltip: 'Bisou',
    },
  ];

  ngOnInit(): void {
    this.form = this.stampToolService.parameters;
  }

  get scaleValue() {
    return (this.form.get('facteurSize') as FormControl).value;
  }

  changeStamp(event: MatButtonToggleChange) {
    this.form.patchValue({
      stampSvgString: this.styles[event.value].svgString,
    });
  }
}
