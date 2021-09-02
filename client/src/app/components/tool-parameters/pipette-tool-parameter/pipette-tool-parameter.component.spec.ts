import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PipetteToolService } from 'src/app/services/tools/pipette-tool/pipette-tool.service';
import { PipetteToolParameterComponent } from './pipette-tool-parameter.component';

describe('PipetteToolParameterComponent', () => {
  let component: PipetteToolParameterComponent;
  let fixture: ComponentFixture<PipetteToolParameterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PipetteToolParameterComponent ],
      providers: [
        {
          provide: PipetteToolService, useClass: class {
            toolName = 'ToolTest';
          },
        }],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PipetteToolParameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should get tool name', () => {
    expect(component.toolName).toEqual('ToolTest');
  });
});
