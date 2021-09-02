import { TestBed } from '@angular/core/testing';

import { ResizeCommand } from '../resize-command/resize-command';
import { TranslateCommand } from '../translate-command/translate-command';
import { RotateTranslateCompositeCommand } from './rotate-translate-composite-command';

describe('RotateTranslateCompositeCommand', () => {

    beforeEach(() => {
        TestBed.configureTestingModule({});
    });

    it('should be created', () => {
        const rotateTranslateCompositeCommandMock = new RotateTranslateCompositeCommand();
        expect(rotateTranslateCompositeCommandMock).toBeTruthy();
    });

    it('#hasSubCommand should be true after #addSubCommand is called', () => {
        const rotateTranslateCompositeCommandMock = new RotateTranslateCompositeCommand();

        expect(rotateTranslateCompositeCommandMock.hasSubCommand()).toBeFalsy();

        const translateCommandMock = TranslateCommand.prototype;
        rotateTranslateCompositeCommandMock.addSubCommand(translateCommandMock);

        expect(rotateTranslateCompositeCommandMock.hasSubCommand()).toBeTruthy();
    });

    it('#undo should call undo of evry command added', () => {
        const rotateTranslateCompositeCommandMock = new RotateTranslateCompositeCommand();

        const translateCommandMock = TranslateCommand.prototype;
        const resizeCommandMock = ResizeCommand.prototype;

        const transSpy = spyOn(translateCommandMock, 'undo');
        const resSpy = spyOn(resizeCommandMock, 'undo');

        rotateTranslateCompositeCommandMock.addSubCommand(translateCommandMock);
        rotateTranslateCompositeCommandMock.addSubCommand(resizeCommandMock);

        rotateTranslateCompositeCommandMock.undo();

        expect(transSpy).toHaveBeenCalled();
        expect(resSpy).toHaveBeenCalled();
    });

    it('#execute should call execute of evry command added', () => {
        const rotateTranslateCompositeCommandMock = new RotateTranslateCompositeCommand();

        const translateCommandMock = TranslateCommand.prototype;
        const resizeCommandMock = ResizeCommand.prototype;

        const transSpy = spyOn(translateCommandMock, 'execute');
        const resSpy = spyOn(resizeCommandMock, 'execute');

        rotateTranslateCompositeCommandMock.addSubCommand(translateCommandMock);
        rotateTranslateCompositeCommandMock.addSubCommand(resizeCommandMock);

        rotateTranslateCompositeCommandMock.execute();

        expect(transSpy).toHaveBeenCalled();
        expect(resSpy).toHaveBeenCalled();
    });
});
