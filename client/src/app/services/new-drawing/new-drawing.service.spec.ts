import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { NewDrawingService } from './new-drawing.service';

describe('DrawingSizeService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NewDrawingService,
        FormBuilder],
    });
  });

  it('should be created', () => {
    const service: NewDrawingService = TestBed.get(NewDrawingService);
    expect(service).toBeTruthy();
  });

  it('should updatethe value and the validity of the new drawing service form on resize', () => {
    const service: NewDrawingService = TestBed.get(NewDrawingService);

    const spy = spyOn(service.form, 'updateValueAndValidity');

    service.onResize();

    expect(spy).toHaveBeenCalled();
  });

  it('should updatethe value and the validity of the new drawing service form on resize', () => {
    const service: NewDrawingService = TestBed.get(NewDrawingService);
    service.sizeGroup.patchValue({ width: 10, height: 10 });

    const spy = spyOn(service.form, 'updateValueAndValidity');

    service.onResize();

    expect(spy).not.toHaveBeenCalled();
  });
});
