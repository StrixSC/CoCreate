import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatPopedOutComponent } from './chat-poped-out.component';

describe('ChatPopedOutComponent', () => {
  let component: ChatPopedOutComponent;
  let fixture: ComponentFixture<ChatPopedOutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatPopedOutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatPopedOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
