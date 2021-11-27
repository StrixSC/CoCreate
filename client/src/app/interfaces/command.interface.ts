export interface ICommand {
    undo(): void;
    execute(): void;
    userId: string;
    actionId: string;
    isSyncAction?: boolean;
}
