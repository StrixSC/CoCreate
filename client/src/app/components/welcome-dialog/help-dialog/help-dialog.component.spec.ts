import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import SpyObj = jasmine.SpyObj;
import { of } from 'rxjs';
import { MaterialModules } from 'src/app/app-material.module';
import { IndexService } from 'src/app/services/index/index.service';
import { HelpDialogComponent } from './help-dialog.component';

describe('HelpDialogComponent', () => {
  let component: HelpDialogComponent;
  let fixture: ComponentFixture<HelpDialogComponent>;
  let indexServiceSpy: SpyObj<IndexService>;
  const mockDialogRef = { close: jasmine.createSpy('close') };

  beforeEach(() => {
    indexServiceSpy = jasmine.createSpyObj('IndexService', ['aideGet']);
    indexServiceSpy.aideGet.and.returnValue(of({
      O: '', S: '', G: '', E: '', X: '', C: '', V: '', D: '',
      Sup: '', A: '', Z: '', ShiftZ: '', Cray: '', W: '', P: '', Y: '', Aer: '', Rec: '', Ell: '', Poly: '',
      L: '', T: '', R: '', B: '', Eff: '', I: '', Sel: '', Gri: '', M: '', Aug: '', Dim: '',
    }));
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MaterialModules, BrowserAnimationsModule],
      declarations: [HelpDialogComponent],
      providers: [
        HelpDialogComponent, { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: IndexService, useValue: indexServiceSpy }],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create aide-dialog component', () => {
    expect(component).toBeTruthy();
  });

  it('should close the dialog', () => {
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
