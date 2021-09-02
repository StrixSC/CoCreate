import { TestBed } from '@angular/core/testing';
import { HotkeysEmitterService } from './hotkeys-emitter/hotkeys-emitter.service';
import { HotkeysEnablerService } from './hotkeys-enabler.service';

describe('HotkeysEnablerService', () => {
    let hotkeyTravailServiceSpy: jasmine.SpyObj<HotkeysEmitterService>;

    beforeEach(() => {
        const hotkeyTravailSpy = { canExecute: true };

        TestBed.configureTestingModule({
            providers: [
                { provide: HotkeysEmitterService, useValue: hotkeyTravailSpy },
            ],
        });

        hotkeyTravailServiceSpy = TestBed.get(HotkeysEmitterService);
    });

    it('should be created', () => {
        const service: HotkeysEnablerService = TestBed.get(HotkeysEnablerService);
        expect(service).toBeDefined();
    });

    it('should disable the hotkeys', () => {
        const service: HotkeysEnablerService = TestBed.get(HotkeysEnablerService);
        service.disableHotkeys();
        expect(hotkeyTravailServiceSpy.canExecute).toBeFalsy();
    });

    it('should enable the hotkeys', () => {
        const service: HotkeysEnablerService = TestBed.get(HotkeysEnablerService);
        service.disableHotkeys();
        service.enableHotkeys();
        expect(hotkeyTravailServiceSpy.canExecute).toBeTruthy();
    });

    it('should disable hotkeys if a click is made in an input box', () => {
        const service: HotkeysEnablerService = TestBed.get(HotkeysEnablerService);

        service.enableHotkeys();

        const spy = spyOn(service, 'disableHotkeys');

        const mouseEvent = new MouseEvent('mousedown');
        const htmlInput = document.createElement('input') as HTMLInputElement;
        htmlInput.value = '1';
        spyOnProperty(mouseEvent, 'target').and.returnValue(htmlInput);
        window.dispatchEvent(mouseEvent);

        expect(spy).toHaveBeenCalled();
    });

    it('should enable hotkeys if a click is made out of an input box and onClick is true', () => {
        const service: HotkeysEnablerService = TestBed.get(HotkeysEnablerService);

        service.disableHotkeys();

        const spy = spyOn(service, 'enableHotkeys');

        const mouseEvent = new MouseEvent('mousedown');
        service.canClick = true;

        window.dispatchEvent(mouseEvent);

        expect(spy).toHaveBeenCalled();
    });

    it('should not enable hotkeys if a click is made out of an input box and onClick is false', () => {
        const service: HotkeysEnablerService = TestBed.get(HotkeysEnablerService);

        service.disableHotkeys();

        const spy = spyOn(service, 'enableHotkeys');

        const mouseEvent = new MouseEvent('mousedown');

        service.canClick = false;

        window.dispatchEvent(mouseEvent);

        expect(spy).not.toHaveBeenCalled();
    });
});
