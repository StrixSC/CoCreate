import { TestBed } from '@angular/core/testing';

import { WorkspaceService } from '../workspace/workspace.service';
import { OffsetManagerService } from './offset-manager.service';

class MockNativeElement {
  x = 10;
  y = 15;
  getBoundingClientRect(): { x: number, y: number } {
    return { x: this.x, y: this.y };
  }
}

describe('OffsetManagerService', () => {
  let service: OffsetManagerService;
  const scrollLeft = 5;
  const scrollTop = 10;
  const nativeElement = new MockNativeElement();
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{
        // tslint:disable-next-line: max-classes-per-file
        provide: WorkspaceService, useClass: class {
          scrolledElement = {
            nativeElement: { scrollLeft, scrollTop },
          };
          el = { nativeElement };
        },
      },
      ],
    });
    service = TestBed.get(OffsetManagerService);
  });

  it('should be created', () => {

    expect(service).toBeTruthy();
  });

  it('should return the offset from the element of workspace service', () => {
    const mouseEvent: MouseEvent = new MouseEvent('mousedown');
    const returnX = 40;
    const returnY = 50;
    spyOnProperty(mouseEvent, 'pageX').and.returnValue(returnX);
    spyOnProperty(mouseEvent, 'pageY').and.returnValue(returnY);
    spyOnProperty(mouseEvent, 'offsetX').and.returnValue(returnX - nativeElement.x + scrollLeft);
    spyOnProperty(mouseEvent, 'offsetY').and.returnValue(returnY - nativeElement.y + scrollTop);
    const offset: { x: number, y: number } = service.offsetFromMouseEvent(mouseEvent);
    expect(offset.x).toBe(returnX - nativeElement.x + scrollLeft);
    expect(offset.y).toBe(returnY - nativeElement.y + scrollTop);
  });
});
