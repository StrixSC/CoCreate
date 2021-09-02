import { OverlayModule } from '@angular/cdk/overlay';
import { Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CommandInvokerService } from '../../command-invoker/command-invoker.service';
import { DrawingService } from '../../drawing/drawing.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { ToolsColorService } from '../../tools-color/tools-color.service';
import { GridService } from '../grid-tool/grid.service';
import { BucketFillCommand } from './bucket-fill-command';
import { BucketFillToolService } from './bucket-fill-tool.service';

describe('BucketFillToolService', () => {
    let offsetManagerServiceSpy: jasmine.SpyObj<OffsetManagerService>;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let rendererSpy: jasmine.SpyObj<Renderer2>;
    let commandInvokerSpy: jasmine.SpyObj<CommandInvokerService>;
    let gridServiceSpy: jasmine.SpyObj<GridService>;

    beforeEach(() => {
        rendererSpy = jasmine.createSpyObj('Renderer2', ['createElement', 'setProperty', 'setAttribute', 'appendChild', 'setStyle']);
        const spyOffset = jasmine.createSpyObj('OffsetManagerService', ['offsetFromMouseEvent']);
        let spyDrawingService = jasmine.createSpyObj('DrawingService', ['addObject', 'removeObject']);
        const spyCommandInvoker = jasmine.createSpyObj('CommandInvokerService', ['executeCommand']);
        let spyGridService = jasmine.createSpyObj('GridService', ['']);

        spyDrawingService = {
            ...spyDrawingService,
            renderer: rendererSpy,
            width: 100,
            height: 100,
        };
        spyGridService = {
            ...
            spyGridService,
            activateGrid: new FormControl(false),
        };

        TestBed.configureTestingModule({
            imports: [MatSnackBarModule, OverlayModule, BrowserAnimationsModule, NoopAnimationsModule],
            providers: [RendererProviderService,
                { provide: DrawingService, useValue: spyDrawingService },
                { provide: OffsetManagerService, useValue: spyOffset },
                {
                    provide: ToolsColorService, useValue: {
                        primaryColorString: 'rgb(255,0,0)', primaryAlpha: 0.6, primaryColor: { r: 255, g: 0, b: 0 },
                        secondaryColor: { r: 200, g: 50, b: 100 },
                        secondaryColorString: 'rgb(200,50,100)', secondaryAlpha: 0.3,
                    },
                },
                { provide: CommandInvokerService, useValue: spyCommandInvoker },
                { provide: GridService, useValue: spyGridService },
            ],
        });
        drawingServiceSpy = TestBed.get(DrawingService);
        commandInvokerSpy = TestBed.get(CommandInvokerService);
        gridServiceSpy = TestBed.get(GridService);

        const rendererProvider: RendererProviderService = TestBed.get(RendererProviderService);
        drawingServiceSpy.drawing = rendererProvider.renderer.createElement('svg', 'svg');
        const rect: SVGRectElement = rendererProvider.renderer.createElement('rect', 'svg');
        rendererProvider.renderer.setAttribute(drawingServiceSpy.drawing, 'width', '5');
        rendererProvider.renderer.setAttribute(drawingServiceSpy.drawing, 'height', '5');
        rendererProvider.renderer.setAttribute(rect, 'width', '5');
        rendererProvider.renderer.setAttribute(rect, 'height', '5');
        rendererProvider.renderer.setAttribute(rect, 'x', '0');
        rendererProvider.renderer.setAttribute(rect, 'y', '0');
        rendererProvider.renderer.appendChild(drawingServiceSpy.drawing, rect);
        drawingServiceSpy.width = 5;
        drawingServiceSpy.height = 5;
        offsetManagerServiceSpy = TestBed.get(OffsetManagerService);
        drawingServiceSpy.addObject.and.returnValue(1);

    });

    it('should be created', () => {
        const service: BucketFillToolService = TestBed.get(BucketFillToolService);
        expect(service).toBeTruthy();
    });

    it('#onPressed should call algorithm', async () => {
        const service: BucketFillToolService = TestBed.get(BucketFillToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 1, y: 1 });
        await service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        const bc: BucketFillCommand = (commandInvokerSpy.executeCommand.calls.mostRecent()).args[0] as BucketFillCommand;
        expect(bc).toBeDefined();
    });

    it('#onPressed should call algorithm of same color', () => {
        const service: BucketFillToolService = TestBed.get(BucketFillToolService);
        const toolsColorService = TestBed.get(ToolsColorService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 1, y: 1 });
        toolsColorService.primaryColor = { r: 0, g: 0, b: 0 };
        service.onPressed(new MouseEvent('mousedown', { button: 2 }));
        expect(commandInvokerSpy.executeCommand.calls.mostRecent()).not.toBeDefined();
    });

    it('should do nothing', () => {
        const service: BucketFillToolService = TestBed.get(BucketFillToolService);
        service.onRelease({} as MouseEvent);
        service.onMove({} as MouseEvent);
        service.onKeyUp({} as KeyboardEvent);
        service.onKeyDown({} as KeyboardEvent);
        service.pickupTool();
        service.dropTool();
        expect(service).toBeTruthy();
    });

    it('#onPressed should disable then reenable the grid if grid is active', async () => {
        gridServiceSpy.activateGrid = new FormControl(true);
        const spyHideGrid = spyOn(gridServiceSpy.activateGrid, 'setValue');

        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 1, y: 1 });
        const service: BucketFillToolService = TestBed.get(BucketFillToolService);

        await service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        expect(spyHideGrid).toHaveBeenCalledWith(false);
        expect(spyHideGrid).toHaveBeenCalledWith(true);

    });

    it('#onPressed should not enable the grid if grid is not active prior to onPressed', async () => {
        gridServiceSpy.activateGrid = new FormControl(false);
        const spyHideGrid = spyOn(gridServiceSpy.activateGrid, 'setValue');

        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 1, y: 1 });
        const service: BucketFillToolService = TestBed.get(BucketFillToolService);

        await service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        expect(spyHideGrid).not.toHaveBeenCalledWith(true);

    });

});
