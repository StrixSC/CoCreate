import { Component, CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModules } from 'src/app/app-material.module';
import { ParameterComponentService } from 'src/app/services/parameter-component/parameter-component.service';
import { ParameterMenuComponent } from './parameter-menu.component';
import { ParameterDirective } from './parameter.directive';

@Component({
  selector: 'mock-component',
  template: '<p>MOCK</p>',
})
class MockComponent { }

describe('ParameterMenuComponent', () => {
  let component: ParameterMenuComponent;
  let fixture: ComponentFixture<ParameterMenuComponent>;
  let parameterComponentService: ParameterComponentService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ParameterMenuComponent, ParameterDirective, MockComponent,
      ],
      imports: [MaterialModules, BrowserAnimationsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [MockComponent],
      },
    });
    TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParameterMenuComponent);
    parameterComponentService = TestBed.get(ParameterComponentService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load component onchange of the tool id', () => {
    const spy = spyOn(parameterComponentService, 'getComponent').and.returnValue(MockComponent);
    component.selectId = 1;
    component.ngOnChanges({ selectId: new SimpleChange(null, component.selectId, false) });
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
  });

  it('should load component onchange of the tool id', () => {
    const spy = spyOn(parameterComponentService, 'getComponent').and.returnValue(MockComponent);
    component.selectId = 1;
    component.ngOnChanges({});
    fixture.detectChanges();
    expect(spy).not.toHaveBeenCalled();
  });

});
