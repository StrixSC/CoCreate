import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialModules } from 'src/app/app-material.module';
import { ToolsService } from 'src/app/services/tools/tools.service';
import { WorkspaceComponent } from './workspace.component';

describe('WorkspaceComponent', () => {
  let component: WorkspaceComponent;
  let fixture: ComponentFixture<WorkspaceComponent>;
  let toolServiceSpy: jasmine.SpyObj<ToolsService>;

  beforeEach(async(() => {
    const spyTool = jasmine.createSpyObj('ToolsService', ['onPressed', 'onRelease', 'onMove']);

    TestBed.configureTestingModule({
      declarations: [WorkspaceComponent],
      imports: [MaterialModules],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: ToolsService, useValue: spyTool },
      ],
    });

    toolServiceSpy = TestBed.get(ToolsService);

    TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call press on mouse button press', () => {
    component.onMouseDown(new MouseEvent('mousedown'));
    expect(toolServiceSpy.onPressed).toHaveBeenCalled();
  });

  it('should call move on mouse move', () => {
    component.onMouseMove(new MouseEvent('mousedown'));
    expect(toolServiceSpy.onMove).toHaveBeenCalled();
  });

  it('should call release on mouse button unpress', () => {
    component.onMouseUp(new MouseEvent('mousedown'));
    expect(toolServiceSpy.onRelease).toHaveBeenCalled();
  });

  it('should call press on mouse button right press', () => {
    expect(component.onRightClick(new MouseEvent('mousedown'))).not.toBeTruthy();
  });
});
