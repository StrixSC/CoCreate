
import { Injectable } from '@angular/core';
import { HotkeysEmitterService } from './hotkeys-emitter/hotkeys-emitter.service';

/// Permet de s'assurer de la gestion des services hotkeys pour les activer et les desactiver
@Injectable({
    providedIn: 'root',
})
export class HotkeysEnablerService {

    canClick = false;

    constructor(
        private hotkeysTravailService: HotkeysEmitterService,
    ) {
        this.eventListenerOnInput();
    }

    /// Met les canExecutes des hotkeys a false
    disableHotkeys(): void {
        this.hotkeysTravailService.canExecute = false;
    }

    /// Met les canExecutes des hotkeys a true
    enableHotkeys(): void {
        this.hotkeysTravailService.canExecute = true;
    }

    /// Verifie si on doit appeller les hotkeys
    private eventListenerOnInput(): void {
        window.addEventListener('mousedown', (event) => {
            if ((event.target as HTMLInputElement).value !== undefined) {
                this.disableHotkeys();
            } else if (this.canClick) {
                this.enableHotkeys();
            }
        });
    }
}
