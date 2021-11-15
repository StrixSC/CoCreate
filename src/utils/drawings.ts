import { Action, ActionType, ActionState } from '@prisma/client';
import validator from 'validator';

export const DEFAULT_DRAWING_OFFSET = 0;
export const DEFAULT_DRAWING_LIMIT = 12;

const defaultStates = [ActionState.up, ActionState.down, ActionState.move];
const defaultTypes = [
    ActionType.Freedraw,
    ActionType.Shape,
    ActionType.Select,
    ActionType.Translate,
    ActionType.Rotate,
    ActionType.Delete,
    ActionType.Resize,
    ActionType.Text,
    ActionType.Layer,
    ActionType.UndoRedo,
];

export enum FilterType {
    Month = "Month",
    DayOrKeyword = "DayOrKeyword",
    Date = "Date",
    NameOrKeyword = "NameOrKeyword",
    UsernameOrKeyword = "UsernameOrKeyword",
    Keyword = "Keyword",
    YearOrKeyword = "YearOrKeyword"
}

export const daysArray = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];

export const bilingualMonths = [
    'january',
    'janvier',
    'february',
    'febuary',
    'march',
    'mars',
    'april',
    'avril',
    'mai',
    'may',
    'juin',
    'june',
    'july',
    'juillet',
    'august',
    'aout',
    'september',
    'septembre',
    'october',
    'octobre',
    'november',
    'novembre',
    'december',
    'decembre'
];

export const englishLongMonths = ['january', 'febuary', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
export const frenchLongMonths = ['janvier', 'fevrier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'aout', 'september', 'octobre', 'novembre', 'decembre', 'décembre']

const hasEmptyProperties = (obj: any): { result: boolean; field: string | null } => {
    for (const key in obj) {
        if (typeof obj[key] == 'boolean') {
            continue;
        }

        if (!obj[key] || obj[key] === null || obj[key] === '')
            return { result: true, field: `${key} is missing/empty or is invalid` };
    }
    return { result: false, field: null };
};

const validateSelection = (isSelected: string | boolean) => {
    if (typeof isSelected === 'string') {
        if (!validator.isIn(isSelected, ['false', 'true'])) {
            return {
                result: false,
                field: 'isSelected is a string and does not have \'false\' or \'true\' as a value'
            };
        } else {
            return { result: true, field: null };
        }
    }

    if (typeof isSelected === 'boolean') {
        return { result: true, field: null };
    } else {
        return {
            result: false,
            field: 'isSelected must be a boolean value or a string value with  \'false\' or \'true\' as values'
        };
    }
};

const validateBaseAction = (a: Action): { result: boolean; field: string | null } => {
    const action = {
        collaborationId: a.collaborationId || null,
        username: a.username || null,
        userId: a.userId || null,
        actionType: a.actionType || null,
        actionId: a.actionId || null
    };

    const checkEmpty = hasEmptyProperties(action);
    if (checkEmpty.result) {
        return { result: false, field: checkEmpty.field };
    }

    if (!validator.isAscii(action.username!)) {
        return { result: false, field: 'username' };
    }

    if (!validator.isAscii(action.userId!)) {
        return { result: false, field: 'userId' };
    }

    if (!validator.isAscii(action.collaborationId!)) {
        return { result: false, field: 'collaborationId' };
    }

    if (!validator.isIn(action.actionType!, defaultTypes)) {
        return { result: false, field: 'Type' };
    }

    return { result: true, field: null };
};

const typesCallbacks: Record<
    ActionType,
    (action: any) => { result: boolean; field: string | null }
> = {
    Freedraw: (a: Action) => {
        const action = {
            x: a.x || null,
            y: a.y || null,
            width: a.width || null,
            state: a.state || null,
            isSelected: a.isSelected || null
        };

        const checkEmpty = hasEmptyProperties(action);
        if (checkEmpty.result) {
            return { result: false, field: checkEmpty.field };
        }

        if (a.state !== 'up') {
            if (
                !validator.isFloat(action.x!.toString()) ||
                !validator.isInt(action.x!.toString())
            ) {
                return { result: false, field: 'X' };
            }

            if (
                !validator.isFloat(action.y!.toString()) ||
                !validator.isInt(action.y!.toString())
            ) {
                return { result: false, field: 'Y' };
            }
        }

        // if (!validator.isInt(action.color!.toString())) {
        //     return { result: false, field: 'Color' };
        // }

        if (!validator.isFloat(action.width!.toString())) {
            return { result: false, field: 'Width' };
        }

        const selectionValidation = validateSelection(a.isSelected!);
        if (!selectionValidation.result) {
            return { result: false, field: selectionValidation.field };
        }

        if (!validator.isIn(action.state!, defaultStates)) {
            return { result: false, field: 'State' };
        }

        return { result: true, field: null };
    },

    Shape: (a: Action) => {
        if (hasEmptyProperties(a)) return { result: false, field: 'Object' };

        return { result: true, field: null };
    },

    Select: (a: Action) => {
        const action = {
            isSelected: a.isSelected
        };

        const checkEmpty = hasEmptyProperties(action);
        if (checkEmpty.result) {
            return { result: false, field: checkEmpty.field };
        }

        const selectionValidation = validateSelection(a.isSelected!);
        if (!selectionValidation.result) {
            return { result: false, field: selectionValidation.field };
        }

        return { result: true, field: null };
    },
    Translate: () => ({ result: true, field: null }),
    Resize: () => ({ result: true, field: null }),
    Delete: () => ({ result: true, field: null }),
    Rotate: () => ({ result: true, field: null }),
    Text: () => ({ result: true, field: null }),
    Layer: () => ({ result: true, field: null }),
    UndoRedo: () => ({ result: true, field: null }),
};

export const validateDrawingEvents = (
    actionType: ActionType,
    action: Action
): { result: boolean; field: string | null } => {
    const baseActionValidationRes = validateBaseAction(action);

    if (!baseActionValidationRes.result) {
        return baseActionValidationRes;
    }

    return typesCallbacks[actionType](action);
};
