import { TestBed } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { WelcomeDialogModule } from 'src/app/components/welcome-dialog/welcome-dialog.module';
import { Tools } from '../../interfaces/tools.interface';
import { ToggleDrawerService } from '../toggle-drawer/toggle-drawer.service';
import { LEFT_CLICK } from '../tools/tools-constants';
import { ToolsService } from '../tools/tools.service';
import { SidenavService } from './sidenav.service';

describe('SidenavService', () => {
  let toggleDrawerServiceSpy: jasmine.SpyObj<ToggleDrawerService>;
  let toolServiceSpy: jasmine.SpyObj<ToolsService>;

  beforeEach(() => {
    const toogleSpy = jasmine.createSpyObj('ToggleDrawerService', ['open', 'close']);
    const toolSpy = jasmine.createSpyObj('ToolsService', ['selectTool']);
    TestBed.configureTestingModule({
      imports: [MatDialogModule, BrowserAnimationsModule, WelcomeDialogModule, HttpClientModule, MatButtonToggleModule],
      providers: [{ provide: ToggleDrawerService, useValue: toogleSpy },
      { provide: ToolsService, useValue: toolSpy }],
    });
    toggleDrawerServiceSpy = TestBed.get(ToggleDrawerService);
    toolServiceSpy = TestBed.get(ToolsService);
  });

  it('sidenav service should be created', () => {
    const service: SidenavService = TestBed.get(SidenavService);
    expect(service).toBeTruthy();
  });

  it('should get tool list', () => {
    const service: SidenavService = TestBed.get(SidenavService);
    expect(service.toolList).toEqual(toolServiceSpy.tools);
  });

  it('should get isOpened', () => {
    const service: SidenavService = TestBed.get(SidenavService);
    toggleDrawerServiceSpy.isOpened = false;
    expect(service.isOpened).toEqual(false);
    toggleDrawerServiceSpy.isOpened = true;
    expect(service.isOpened).toEqual(true);
  });

  it('should get tool list length when selectedParameter is called and isControlMenu is true', () => {
    const service: SidenavService = TestBed.get(SidenavService);
    service.isControlMenu = true;
    toolServiceSpy.tools = new Map([[1, new MockItool()]]);
    expect(service.selectedParameter).toEqual(17);
  });

  it('should get tool list length when selectedParameter is called and isGridMenu is true', () => {
    const service: SidenavService = TestBed.get(SidenavService);
    service.isGridMenu = true;
    toolServiceSpy.tools = new Map([[1, new MockItool()]]);
    expect(service.selectedParameter).toEqual(16);
  });

  it('should get tool list selected tools id when selectedParameter is called and isControlMenu is false', () => {
    const service: SidenavService = TestBed.get(SidenavService);
    service.isControlMenu = false;
    toolServiceSpy.selectedToolId = 4;
    expect(service.selectedParameter).toEqual(4);
  });

  it('should get tool list selected tools id when selectedParameter is called and isGridMenu is false', () => {
    const service: SidenavService = TestBed.get(SidenavService);
    service.isGridMenu = false;
    toolServiceSpy.selectedToolId = 4;
    expect(service.selectedParameter).toEqual(4);
  });

  it('should open', () => {
    const service: SidenavService = TestBed.get(SidenavService);
    service.open();
    expect(toggleDrawerServiceSpy.open).toHaveBeenCalled();
  });

  it('should close and change isControlMenu and isGridMenu to false', () => {
    const service: SidenavService = TestBed.get(SidenavService);
    service.isControlMenu = true;
    service.isGridMenu = true;
    service.close();
    expect(toggleDrawerServiceSpy.close).toHaveBeenCalled();
    expect(service.isControlMenu).toEqual(false);
    expect(service.isGridMenu).toEqual(false);
  });

  it('should openControlMenu', () => {
    const service: SidenavService = TestBed.get(SidenavService);
    spyOn(service, 'open').and.callThrough();
    service.openControlMenu();
    expect(service.open).toHaveBeenCalled();
    expect(service.isControlMenu).toEqual(true);
    expect(service.isGridMenu).toEqual(false);

  });

  it('should openGridMenu', () => {
    const service: SidenavService = TestBed.get(SidenavService);
    spyOn(service, 'open').and.callThrough();
    service.openGridMenu();
    expect(service.open).toHaveBeenCalled();
    expect(service.isGridMenu).toEqual(true);
    expect(service.isControlMenu).toEqual(false);
  });

  it('should get tool list', () => {
    const service: SidenavService = TestBed.get(SidenavService);
    service.isControlMenu = true;

    service.selectionChanged(MatButtonToggleChange.prototype);

    expect(toolServiceSpy.selectTool).toHaveBeenCalled();
  });
});

class MockItool implements Tools {
  readonly id: 5;
  readonly faIcon: any;
  readonly toolName: "brush";
  parameters: FormGroup;
  onPressed(event: MouseEvent) {
    if (event.button === LEFT_CLICK) {
      return null;
    }
    return;
  }
  // tslint:disable-next-line: no-empty
  onRelease(event: MouseEvent): void {}
  // tslint:disable-next-line: no-empty
  onMove(event: MouseEvent): void {}
  // tslint:disable-next-line: no-empty
  onKeyDown(event: KeyboardEvent): void {}
  // tslint:disable-next-line: no-empty
  onKeyUp(event: KeyboardEvent): void {}
  pickupTool(): void {
    return;
  }
  dropTool(): void {
    return;
  }
}
