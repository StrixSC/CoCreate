import { EventEmitter, Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CommandInvokerService } from '../../command-invoker/command-invoker.service';
import { DrawingService } from '../../drawing/drawing.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { ToolsColorService } from '../../tools-color/tools-color.service';
import { INITIAL_WIDTH } from '../tools-constants';
import { TextCommand } from './text-command';
import { TextToolService } from './text-tool.service';

describe('TextToolService', () => {
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let rendererSpy: jasmine.SpyObj<Renderer2>;
    let offsetManagerServiceSpy: jasmine.SpyObj<OffsetManagerService>;
    let commandInvokerSpy: jasmine.SpyObj<CommandInvokerService>;

    beforeEach(() => {
        rendererSpy = jasmine.createSpyObj
            ('Renderer2', ['createElement', 'createText', 'setProperty', 'setAttribute', 'appendChild', 'setStyle', 'listen']);
        const spyOffset = jasmine.createSpyObj('OffsetManagerService', ['offsetFromMouseEvent']);
        let spyDrawingService = jasmine.createSpyObj('DrawingService', ['addObject', 'removeObject']);
        spyDrawingService = {
            ...spyDrawingService,
            renderer: rendererSpy,
            drawingEmit: new EventEmitter(),
        };
        const spyCommandInvoker = jasmine.createSpyObj('CommandInvokerService', ['addCommand', 'executeCommand', 'undo', 'redo']);

        TestBed.configureTestingModule({
            providers: [RendererProviderService,
                { provide: DrawingService, useValue: spyDrawingService },
                { provide: OffsetManagerService, useValue: spyOffset },
                { provide: CommandInvokerService, useValue: spyCommandInvoker },
                {
                    provide: ToolsColorService, useValue: {
                        primaryColor: { r: 100, g: 200, b: 50 },
                        primaryColorString: 'rgb(100,200,50)', primaryAlpha: 0.6,
                        secondaryColorString: 'rgb(200,50,100)', secondaryAlpha: 0.3,
                        colorChangeEmitter: new EventEmitter(),
                    },
                },
            ],
        });

        drawingServiceSpy = TestBed.get(DrawingService);
        offsetManagerServiceSpy = TestBed.get(OffsetManagerService);
        commandInvokerSpy = TestBed.get(CommandInvokerService);
        commandInvokerSpy.executeCommand.and.callFake((com) => com.execute());
        drawingServiceSpy.addObject.and.callFake((obj) => { document.body.appendChild(obj); return 0; });

    });

    it('text service should be created', () => {

        const service: TextToolService = TestBed.get(TextToolService);
        expect(service).toBeTruthy();
    });

    it('should create foreignObject  onpressed', () => {

        const service: TextToolService = TestBed.get(TextToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        // recuperer le foreignObject
        const foreignObject = (drawingServiceSpy.addObject.calls.first()).args[0];
        expect(foreignObject.getAttribute('x')).toEqual('0px');
        expect(foreignObject.getAttribute('y')).toEqual('0px');
        expect(foreignObject.getAttribute('width')).toEqual('100%');
        expect(foreignObject.getAttribute('height')).toEqual('100%');
        const textArea = foreignObject.children[0] as HTMLAreaElement;
        expect(textArea.getAttribute('wrap')).toEqual('off');
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        expect(drawingServiceSpy.addObject).toHaveBeenCalledTimes(1);

    });

    it('should not create foreignObject ', () => {
        const service: TextToolService = TestBed.get(TextToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 1 }));
        expect(drawingServiceSpy.addObject).not.toHaveBeenCalled();
        service.parameters.patchValue({ fontSize: -1 });
        service.onPressed(new MouseEvent('mousedown', { button: 2 }));
        expect(drawingServiceSpy.addObject).not.toHaveBeenCalled();
    });

    it('should do nothing ', () => {

        const service: TextToolService = TestBed.get(TextToolService);
        service.pickupTool();
        service.dropTool();
        expect(service.onRelease(new MouseEvent('mouseup', { button: 0 }))).toBeUndefined();
        expect(service.onKeyDown(new KeyboardEvent('keydown'))).toBeUndefined();
        expect(service.onKeyUp(new KeyboardEvent('keyup'))).toBeUndefined();
        const moveEvent = new MouseEvent('mousemove', { movementX: 2, movementY: 2 });
        expect(service.onMove(moveEvent)).toBeUndefined();
    });

    it('should confirm text with normal style and start alignemnt', () => {
        const service: TextToolService = TestBed.get(TextToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.parameters.patchValue({ fontSize: 8 });
        service.parameters.patchValue({ textStyle: 'normal' });
        service.parameters.patchValue({ textAlignment: 'start' });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        TestBed.get(ToolsColorService).colorChangeEmitter.emit();
        const textArea: HTMLTextAreaElement = service.getTextArea() as HTMLTextAreaElement;
        textArea.value = 'Du text random\nyoupi\n';
        textArea.dispatchEvent(new Event('focus'));
        const mouseEvent = new MouseEvent('mousedown', { button: 2 });
        spyOnProperty(mouseEvent, 'target').and.returnValue({ tagName: 'test' });
        textArea.dispatchEvent(new Event('keydown'));
        service.onPressed(mouseEvent);
        expect(drawingServiceSpy.removeObject).toHaveBeenCalled();
        expect(commandInvokerSpy.executeCommand).toHaveBeenCalled();
        const textCommand = ((commandInvokerSpy.executeCommand.calls.mostRecent()).args[0] as TextCommand);
        const text = textCommand.getText();
        expect(text.children.length).toEqual(2);
        expect(text.getAttribute('x')).toEqual('10px');
        expect(text.getAttribute('y')).toEqual('12px');
        expect(text.getAttribute('name')).toEqual('text');
        expect(text.style.fontFamily).toEqual('"Times New Roman", Times, serif');
        expect(text.style.fontSize).toEqual(INITIAL_WIDTH + 'px');
        expect(text.style.fontWeight).toEqual('normal');
        expect(text.style.textAnchor).toEqual('start');
        expect(text.style.fontStyle).toEqual('normal');
        expect(text.style.fill).toEqual('rgb(100, 200, 50)');
        expect(text.style.fillOpacity).toEqual('0.6');
    });

    it('should confirm text with italic style and middle alignemnt', () => {
        const service: TextToolService = TestBed.get(TextToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        service.parameters.patchValue({ fontSize: 8 });
        service.parameters.patchValue({ textStyle: 'italic' });
        service.parameters.patchValue({ textAlignment: 'middle' });
        const textArea: HTMLTextAreaElement = service.getTextArea() as HTMLTextAreaElement;
        textArea.value = 'Du text random\nyoupi\n';
        textArea.dispatchEvent(new Event('keydown'));
        service.dropTool();
        expect(drawingServiceSpy.removeObject).toHaveBeenCalled();
        expect(commandInvokerSpy.executeCommand).toHaveBeenCalled();
        const textCommand = ((commandInvokerSpy.executeCommand.calls.mostRecent()).args[0] as TextCommand);
        const text = textCommand.getText();
        expect(text.children.length).toEqual(2);
        expect(text.getAttribute('x')).toEqual('10px');
        expect(text.getAttribute('y')).toEqual('12px');
        expect(text.getAttribute('name')).toEqual('text');
        expect(text.style.fontFamily).toEqual('"Times New Roman", Times, serif');
        expect(text.style.fontSize).toEqual(INITIAL_WIDTH + 'px');
        expect(text.style.fontWeight).toEqual('normal');
        expect(text.style.textAnchor).toEqual('middle');
        expect(text.style.fontStyle).toEqual('italic');
        expect(text.style.fill).toEqual('rgb(100, 200, 50)');
        expect(text.style.fillOpacity).toEqual('0.6');
    });

    it('should confirm text with bold style and end alignemnt', () => {
        const service: TextToolService = TestBed.get(TextToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.parameters.patchValue({ fontSize: 8 });
        service.parameters.patchValue({ textStyle: 'bold' });
        service.parameters.patchValue({ textAlignment: 'end' });
        service.onPressed(new MouseEvent('mousedown', { button: 2 }));
        service.onRelease(new MouseEvent('mouseup', { button: 2 }));
        const textArea: HTMLTextAreaElement = service.getTextArea() as HTMLTextAreaElement;
        textArea.value = 'Du text random\nyoupi\n';
        const mouseEvent = new MouseEvent('mousedown', { button: 2 });
        spyOnProperty(mouseEvent, 'target').and.returnValue({ tagName: 'test' });
        textArea.dispatchEvent(new Event('keydown'));
        service.onPressed(mouseEvent);
        expect(drawingServiceSpy.removeObject).toHaveBeenCalled();
        expect(commandInvokerSpy.executeCommand).toHaveBeenCalled();
        const textCommand = ((commandInvokerSpy.executeCommand.calls.mostRecent()).args[0] as TextCommand);
        const text = textCommand.getText();
        expect(text.children.length).toEqual(2);
        expect(text.getAttribute('x')).toEqual('10px');
        expect(text.getAttribute('y')).toEqual('12px');
        expect(text.getAttribute('name')).toEqual('text');
        expect(text.style.fontFamily).toEqual('"Times New Roman", Times, serif');
        expect(text.style.fontSize).toEqual(INITIAL_WIDTH + 'px');
        expect(text.style.fontWeight).toEqual('bold');
        expect(text.style.textAnchor).toEqual('end');
        expect(text.style.fontStyle).toEqual('normal');
        expect(text.style.fill).toEqual('rgb(100, 200, 50)');
        expect(text.style.fillOpacity).toEqual('0.6');
    });

});
