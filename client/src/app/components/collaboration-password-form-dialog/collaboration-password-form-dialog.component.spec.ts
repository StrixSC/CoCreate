import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollaborationPasswordFormDialogComponent } from './collaboration-password-form-dialog.component';

describe('CollaborationPasswordFormDialogComponent', () => {
  let component: CollaborationPasswordFormDialogComponent;
  let fixture: ComponentFixture<CollaborationPasswordFormDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollaborationPasswordFormDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollaborationPasswordFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
