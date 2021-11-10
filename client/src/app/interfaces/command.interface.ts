export interface ICommand {
    undo(): void;
    execute(): void;
    actionId: string;
    isSyncAction?: boolean;
}
