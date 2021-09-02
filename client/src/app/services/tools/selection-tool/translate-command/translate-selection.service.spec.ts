import { TestBed } from '@angular/core/testing';

import { Renderer2 } from '@angular/core';
import { RendererProviderService } from 'src/app/services/renderer-provider/renderer-provider.service';
import { TranslateCommand } from './translate-command';
import { TranslateSelectionService } from './translate-selection.service';

describe('TranslateSelectionService', () => {
  let rendererSpy: jasmine.SpyObj<Renderer2>;
  let rendererServiceSpy: { renderer: Renderer2 };
  let translateCommandMock: TranslateCommand;
  beforeEach(() => {
    rendererSpy = jasmine.createSpyObj('Renderer2', ['']);
    rendererServiceSpy = {
      renderer: rendererSpy,
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: RendererProviderService, useValue: rendererServiceSpy },
      ],
    });
    translateCommandMock = new TranslateCommand(rendererSpy, []);
  });

  it('should be created', () => {
    const service: TranslateSelectionService = TestBed.get(TranslateSelectionService);
    expect(service).toBeTruthy();
  });

  it('#createTranslateCommand should create a translate command', () => {
    const service: TranslateSelectionService = TestBed.get(TranslateSelectionService);
    service.createTranslateCommand([]);
    expect(service.hasCommand()).toBeTruthy();
  });

  it('#endCommand should put the translate command to null', () => {
    const service: TranslateSelectionService = TestBed.get(TranslateSelectionService);

    service.createTranslateCommand([]);
    expect(service.hasCommand()).toBeTruthy();

    service.endCommand();
    expect(service.hasCommand()).toBeFalsy();
  });

  it('#getCommand should get the translate command', () => {
    let service: TranslateSelectionService;
    service = {
      ...TestBed.get(TranslateSelectionService),
      getCommand: TestBed.get(TranslateSelectionService).getCommand,
      translateCommand: translateCommandMock,
    };
    expect(service.getCommand()).toEqual(translateCommandMock);
  });

  it('#translate should call translate of the translate command', () => {
    let service: TranslateSelectionService;
    service = {
      ...TestBed.get(TranslateSelectionService),
      translate: TestBed.get(TranslateSelectionService).translate,
      translateCommand: translateCommandMock,
    };
    const spy = spyOn(translateCommandMock, 'translate');

    service.translate(0, 1);

    expect(spy).toHaveBeenCalled();
  });

  it('#translate should not call translate of the translate command', () => {
    let service: TranslateSelectionService;
    service = {
      ...TestBed.get(TranslateSelectionService),
      translate: TestBed.get(TranslateSelectionService).translate,
      translateCommand: null,
    };
    const spy = spyOn(translateCommandMock, 'translate');

    service.translate(0, 1);

    expect(spy).not.toHaveBeenCalled();
  });
});
