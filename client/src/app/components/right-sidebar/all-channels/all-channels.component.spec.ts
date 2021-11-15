import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllChannelsComponent } from './all-channels.component';

describe('AllChannelsComponent', () => {
  let component: AllChannelsComponent;
  let fixture: ComponentFixture<AllChannelsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllChannelsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllChannelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
