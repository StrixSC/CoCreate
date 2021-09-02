import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModules } from 'src/app/app-material.module';
import { BucketFillToolService } from 'src/app/services/tools/bucket-fill-tool/bucket-fill-tool.service';
import { BucketFillToolParameterComponent } from './bucket-fill-tool-parameter.component';

describe('BucketFillToolParameterComponent', () => {
  let component: BucketFillToolParameterComponent;
  let fixture: ComponentFixture<BucketFillToolParameterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BucketFillToolParameterComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [ReactiveFormsModule, BrowserAnimationsModule,
        MaterialModules],
      providers: [
        {
          provide: BucketFillToolService, useClass: class {
            toolName = 'ToolTest';
            parameters = new FormGroup(
              {
                tolerance: new FormControl(0),
                strokeStyle: new FormControl(0),
                strokeWidth: new FormControl(0),
              },
            );
          },
        }],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BucketFillToolParameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.ngOnInit();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should get tool name', () => {
    expect(component.toolName).toEqual('ToolTest');
  });

});
