import { TestBed } from '@angular/core/testing';
import { DrawingService } from '../../drawing/drawing.service';
import { EraserCommand } from './eraser-command';

describe('EraserCommand', () => {
  let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
  let eraserCommand: EraserCommand;
  const mockSelected: Map<string, SVGElement> = new Map();
  let drawing: SVGElement;
  let domSpy: jasmine.Spy;

  beforeEach(() => {
    drawing = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    element.setAttribute('id', '1');
    element.setAttribute('width', '10');
    element.setAttribute('height', '10');
    element.setAttribute('x', '10');
    element.setAttribute('y', '10');
    const polyline: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('marker-start', 'url(#24-Marker-0)');
    polyline.setAttribute('id', '2');
    polyline.setAttribute('style', 'fill: none; stroke: rgb(0, 0, 0); stroke-width: 8px; stroke-opacity: 1;');
    const defs: SVGDefsElement = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.setAttribute('id', '3');
    const marker: SVGMarkerElement = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('markerUnits', 'userSpaceOnUse');
    marker.setAttribute('id', '24-Marker-0');
    defs.appendChild(marker);
    drawing.appendChild(element);
    drawing.appendChild(polyline);
    drawing.appendChild(defs);
    domSpy = spyOn(document, 'getElementById').and.returnValue(marker as unknown as HTMLElement);
    drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['removeObject', 'addObject']);
    drawingServiceSpy.drawing = drawing;
    mockSelected.set(polyline.id, polyline);
    mockSelected.set(element.id, element);
    TestBed.configureTestingModule({
      providers: [,
        { provide: DrawingService, useValue: drawingServiceSpy },
      ],
    });
  });

  afterEach(() => {
    domSpy.and.callThrough();
  });

  it('should be created', () => {
    eraserCommand = new EraserCommand(mockSelected, drawingServiceSpy);
    expect(eraserCommand).toBeTruthy();
  });

  it('#execute should call removeObject on eraser.selected and call removeChild on eraser.hover', () => {
    eraserCommand = new EraserCommand(mockSelected, drawingServiceSpy);
    eraserCommand.execute();
    expect(drawingServiceSpy.removeObject).toHaveBeenCalledWith(1);
    expect(drawingServiceSpy.removeObject).toHaveBeenCalledWith(2);
    expect(drawingServiceSpy.removeObject).toHaveBeenCalledWith(3);
  });

  it('#undo should call addObject on eraser.selected', () => {
    eraserCommand = new EraserCommand(mockSelected, drawingServiceSpy);
    eraserCommand.execute();
    eraserCommand.undo();
    expect(drawingServiceSpy.addObject).toHaveBeenCalledWith(mockSelected.get('1'));
    expect(drawingServiceSpy.addObject).toHaveBeenCalledWith(mockSelected.get('2'));
  });

});
