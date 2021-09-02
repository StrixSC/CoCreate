import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ToolsApplierColorsService } from 'src/app/services/tools/tools-applier-colors/tools-applier-colors.service';
import { ApplierToolParameterComponent } from './applier-tool-parameter.component';

describe('ApplierToolParameterComponent', () => {
  let component: ApplierToolParameterComponent;
  let fixture: ComponentFixture<ApplierToolParameterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplierToolParameterComponent ],
      providers: [
        {
          provide: ToolsApplierColorsService, useClass: class {
            toolName = 'ToolTest';
        }}],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplierToolParameterComponent);
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
