import { TestBed } from '@angular/core/testing';

import { EmitReturn } from '../hotkeys-constants';
import { HotkeysEmitterService } from './hotkeys-emitter.service';

describe('HotkeysEmitterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HotkeysEmitterService = TestBed.get(HotkeysEmitterService);
    expect(service).toBeTruthy();
  });

  it('should emit with shift and ctrl', () => {
    const service: HotkeysEmitterService = new HotkeysEmitterService();
    let eventEmited = '';
    service.hotkeyEmitter.subscribe((event: string) => { eventEmited = event; });

    const keyBoardEvent = new KeyboardEvent('keydown', { code: 'KeyZ', ctrlKey: true, shiftKey: true });

    service.handleKeyboardEvent(keyBoardEvent);

    expect(eventEmited).toBe(EmitReturn.REDO);
  });

  it('should emit with ctrl', () => {
    let eventEmited = '';

    const service: HotkeysEmitterService = new HotkeysEmitterService();
    service.hotkeyEmitter.subscribe((event: string) => { eventEmited = event; });

    const keyBoardEvent = new KeyboardEvent('keydown', { code: 'KeyZ', ctrlKey: true, shiftKey: false });

    service.handleKeyboardEvent(keyBoardEvent);

    expect(eventEmited).toBe(EmitReturn.UNDO);
  });

  it('should emit with no special key', () => {
    let eventEmited = '';

    const service: HotkeysEmitterService = new HotkeysEmitterService();
    service.hotkeyEmitter.subscribe((event: string) => { eventEmited = event; });

    const keyBoardEvent = new KeyboardEvent('keydown', { code: 'KeyW', ctrlKey: false, shiftKey: false });

    service.handleKeyboardEvent(keyBoardEvent);

    expect(eventEmited).toBe(EmitReturn.BRUSH);
  });

  it('should not emit with unknownkey', () => {
    let eventEmited = '';

    const service: HotkeysEmitterService = new HotkeysEmitterService();
    service.hotkeyEmitter.subscribe((event: string) => { eventEmited = event; });

    const keyBoardEvent = new KeyboardEvent('keydown', { code: 'hehehehe', ctrlKey: false, shiftKey: false });

    service.handleKeyboardEvent(keyBoardEvent);

    expect(eventEmited).toBe('');
  });

  it('should not emit if cant execute', () => {
    let eventEmited = '';

    const service: HotkeysEmitterService = new HotkeysEmitterService();
    service.canExecute = false;
    service.hotkeyEmitter.subscribe((event: string) => { eventEmited = event; });

    const keyBoardEvent = new KeyboardEvent('keydown', { code: 'KeyW', ctrlKey: false, shiftKey: false });

    service.handleKeyboardEvent(keyBoardEvent);

    expect(eventEmited).toBe('');
  });
});
