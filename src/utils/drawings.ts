import { Action, ActionType, ActionState } from '@prisma/client';
import validator from 'validator';
import log from './logger';

const defaultStates = [ ActionState.up, ActionState.down, ActionState.move ];
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
    ActionType.UndoRedo
];

const hasEmptyProperties = (obj: any): { result: boolean; field: string | null } => {
    for (const key in obj) {
        if (!obj[key] || obj[key] === null || obj[key] === '')
            return { result: true, field: `${key} is missing/empty or is invalid` };
    }
    return { result: false, field: null };
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
            color: a.color || null,
            width: a.width || null,
            state: a.state || null,
            isSelected: a.isSelected || null
        };

        const checkEmpty = hasEmptyProperties(action);
        if (checkEmpty.result) {
            return { result: false, field: checkEmpty.field };
        }

        if (!validator.isFloat(action.x!.toString()) || !validator.isInt(action.x!.toString())) {
            return { result: false, field: 'X' };
        }

        if (!validator.isFloat(action.y!.toString()) || !validator.isInt(action.y!.toString())) {
            return { result: false, field: 'Y' };
        }

        if (!validator.isInt(action.color!.toString())) {
            return { result: false, field: 'Color' };
        }

        if (!validator.isFloat(action.width!.toString())) {
            return { result: false, field: 'Width' };
        }

        log('DEBUG', action.isSelected);
        if (!validator.isIn(action.isSelected!.toString(), [ 'false', 'true', false, true ])) {
            return { result: false, field: 'isSelected' };
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

    Select: () => ({ result: false, field: null }),
    Translate: () => ({ result: false, field: null }),
    Resize: () => ({ result: false, field: null }),
    Delete: () => ({ result: false, field: null }),
    Rotate: () => ({ result: false, field: null }),
    Text: () => ({ result: false, field: null }),
    Layer: () => ({ result: false, field: null }),
    UndoRedo: () => ({ result: false, field: null })
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
