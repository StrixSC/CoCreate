import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModules } from 'src/app/app-material.module';
import { NewDrawingFormComponent } from './new-drawing-form.component';

describe('NewDrawingFormComponent', () => {
  let component: NewDrawingFormComponent;
  let fixture: ComponentFixture<NewDrawingFormComponent>;
  const formBuilder: FormBuilder = new FormBuilder();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, MaterialModules, BrowserAnimationsModule],
      declarations: [NewDrawingFormComponent],
      providers: [{ provide: FormBuilder, useValue: formBuilder }],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewDrawingFormComponent);
    component = fixture.componentInstance;
    component.sizeForm = formBuilder.group({
      width: null,
      height: null,
    });
    fixture.detectChanges();
  });

  it('should create new drawing form', () => {
    expect(component).toBeTruthy();
  });
});
