import { ICommand } from 'src/app/interfaces/command.interface';
import { IAction } from '../../model/IAction.model';

export abstract class SyncCommand {
    public command: ICommand;
    public selectedBy: string = "";
    public isSelected: boolean = false;
    public payload: IAction;
    abstract undo(): void;
    abstract execute(): SyncCommand | void;
    abstract update(payload: IAction): SyncCommand | void;
    abstract redo(): void;
}