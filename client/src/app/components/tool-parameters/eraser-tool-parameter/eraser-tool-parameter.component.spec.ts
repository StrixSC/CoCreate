import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModules } from 'src/app/app-material.module';
import { EraserToolService } from 'src/app/services/tools/eraser-tool/eraser-tool.service';
import { EraserToolParameterComponent } from './eraser-tool-parameter.component';

describe('EraserToolParameterComponent', () => {
  let component: EraserToolParameterComponent;
  let fixture: ComponentFixture<EraserToolParameterComponent>;
  let eraserToolService: EraserToolService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EraserToolParameterComponent ],
      imports: [ ReactiveFormsModule, BrowserAnimationsModule, MaterialModules ],
    })
    .compileComponents();
    eraserToolService = TestBed.get(EraserToolService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EraserToolParameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return the tool name', () => {
    expect(component.toolName).toEqual(eraserToolService.toolName);
  });
});
