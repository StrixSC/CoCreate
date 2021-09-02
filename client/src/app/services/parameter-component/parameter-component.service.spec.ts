import { TestBed } from '@angular/core/testing';
import { SelectionToolParameterComponent } from 'src/app/components/tool-parameters/selection-tool-parameter/selection-tool-parameter.component';
import { ParameterComponentService } from './parameter-component.service';

describe('ParameterComponentService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('parameter-component service should be created', () => {
    const service: ParameterComponentService = TestBed.get(ParameterComponentService);
    expect(service).toBeTruthy();
  });

  it('should getComponent', () => {
    const service: ParameterComponentService = TestBed.get(ParameterComponentService);
    spyOn(service, 'getComponent').and.callThrough();
    expect(service.getComponent(0)).toEqual(SelectionToolParameterComponent);
  });
});
