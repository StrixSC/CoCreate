import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDrawingComponent } from './create-drawing.component';

describe('CreateDrawingComponent', () => {
  let component: CreateDrawingComponent;
  let fixture: ComponentFixture<CreateDrawingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateDrawingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateDrawingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
