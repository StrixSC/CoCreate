import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material';
import { of } from 'rxjs';
import { ErrorMessageComponent } from 'src/app/components/error-message/error-message.component';
import { ErrorMessageService } from './error-message.service';

describe('ErrorMessageService', () => {

  beforeEach(() => TestBed.configureTestingModule({
    imports: [MatDialogModule],

  }));

  it('should be created', () => {
    const service: ErrorMessageService = TestBed.get(ErrorMessageService);
    expect(service).toBeTruthy();
  });

  it('should return a message', () => {
    const service: ErrorMessageService = TestBed.get(ErrorMessageService);
    const dialogRefSpyObj = jasmine.createSpyObj({
      afterClosed: of({}),
      afterOpened: of({}),
      close: null,
    });
    const dialog = TestBed.get(MatDialog);
    const dialogSpy = spyOn(dialog, 'open');
    dialogSpy.and.returnValue(dialogRefSpyObj);
    service.showError('title', 'descr');
    expect(dialogSpy).toHaveBeenCalledWith(ErrorMessageComponent, { data: { title: 'title', description: 'descr' } });
  });
});
