import { getTestBed, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModules } from 'src/app/app-material.module';
import { OpenDrawingDialogService } from './open-drawing-dialog.service';

describe('OpenDrawingDialogService', () => {
  let injector: TestBed;
  let service: OpenDrawingDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MaterialModules, BrowserAnimationsModule],
      providers: [OpenDrawingDialogService],
    });
    injector = getTestBed();
    service = injector.get(OpenDrawingDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#openDialog should open the modal window', () => {
    const spy = spyOn(service.dialog, 'open');
    service.openDialog();
    expect(spy).toHaveBeenCalled();
  });
});
