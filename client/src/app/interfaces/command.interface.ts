export interface ICommand {
    undo(): void;
    execute(): void;
}
