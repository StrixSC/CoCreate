import { ICommand } from 'src/app/interfaces/command.interface';

export class RotateTranslateCompositeCommand implements ICommand {
    public subCommand: ICommand[] = [];
    public actionId: string = "";
    public userId: string = "";

    addSubCommand(command: ICommand): void {
        this.subCommand.push(command);
    }

    hasSubCommand(): boolean {
        return this.subCommand.length > 0;
    }

    undo(): void {
        for (const command of this.subCommand.reverse()) {
            command.undo();
        }
    }

    execute(): void {
        for (const command of this.subCommand.reverse()) {
            command.execute();
        }
    }

}
