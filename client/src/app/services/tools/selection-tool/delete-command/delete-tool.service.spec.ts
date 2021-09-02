import { TestBed } from '@angular/core/testing';
import { CommandInvokerService } from '../../../command-invoker/command-invoker.service';
import { SelectionToolService } from '../selection-tool.service';
import { DeletingToolService } from './delete-tool.service';

describe('DeletingToolService', () => {
  let commandInvokerSpy: jasmine.SpyObj<CommandInvokerService>;
  let selectionServiceSpy: jasmine.SpyObj<SelectionToolService>;

  beforeEach(() => {
    const invokerSpy = jasmine.createSpyObj('CommandInvokerService', ['executeCommand']);
    const selectSpy = jasmine.createSpyObj('SelectionToolService', ['removeSelection', 'getObjectList']);
    TestBed.configureTestingModule({
      providers: [
        { provide: CommandInvokerService, useValue: invokerSpy },
        { provide: SelectionToolService, useValue: selectSpy },
      ],
    });

    commandInvokerSpy = TestBed.get(CommandInvokerService);
    selectionServiceSpy = TestBed.get(SelectionToolService);
  });

  it('should be created', () => {
    const service: DeletingToolService = TestBed.get(DeletingToolService);
    expect(service).toBeTruthy();
  });

  it('#deleteSelection to execute the command to delete the selection', () => {
    const service: DeletingToolService = TestBed.get(DeletingToolService);

    service.deleteSelection();

    expect(selectionServiceSpy.removeSelection).toHaveBeenCalled();
    expect(commandInvokerSpy.executeCommand).toHaveBeenCalled();
  });
});
