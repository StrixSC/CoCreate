import { FormGroup } from '@angular/forms';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { ICommand } from 'src/app/interfaces/command.interface';

/// Interface pour tous les outils
export interface Tools {
    readonly id: number;
    readonly faIcon: IconDefinition;
    readonly toolName: string;
    parameters: FormGroup;
    onPressed(event: MouseEvent): void;
    onRelease(event: MouseEvent): ICommand | void;
    onMove(event: MouseEvent): void;
    onKeyDown(event: KeyboardEvent): void;
    onKeyUp(event: KeyboardEvent): void;
    pickupTool(): void;
    dropTool(): void;
}
