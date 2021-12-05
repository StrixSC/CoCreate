import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsernameUpdateDialogComponent } from './username-update-dialog.component';

describe('UsernameUpdateDialogComponent', () => {
  let component: UsernameUpdateDialogComponent;
  let fixture: ComponentFixture<UsernameUpdateDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsernameUpdateDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsernameUpdateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
