import { DrawingLoadService } from './../../services/drawing-load.service';
import { SelectionToolService } from 'src/app/services/tools/selection-tool/selection-tool.service';
import { ToolIdConstants } from './../../services/tools/tool-id-constants';
import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ToolsService } from 'src/app/services/tools/tools.service';
import { WorkspaceService } from 'src/app/services/workspace/workspace.service';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss'],
})
export class WorkspaceComponent implements AfterViewInit {

  @ViewChild('workspaceEnv', { read: ElementRef, static: false })
  workspaceEnv: ElementRef;

  constructor(
    private drawingLoader: DrawingLoadService,
    private el: ElementRef,
    private workspaceService: WorkspaceService,
    private toolsService: ToolsService,
  ) {
  }

  ngAfterViewInit(): void {
    this.workspaceService.el = this.el;
    this.workspaceService.scrolledElement = this.workspaceEnv;
  }

  /// Effectue un onPress sur le clique droit de la sourie
  onRightClick(event: MouseEvent): boolean {
    return false;
  }

  /// Effectue un onPress sur le clique gauche de la sourie
  onMouseDown(event: MouseEvent): void {
    this.toolsService.onPressed(event);
  }

  /// Effectue un onRelease quand le clique de la sourie est relaché
  @HostListener('window:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    this.toolsService.onRelease(event);
  }

  /// Effectue un onMove quand la sourie bouge
  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.toolsService.onMove(event);
  }

  @HostListener('wheel', ['$event']) onMouseWheel(event: WheelEvent) {
    if (this.toolsService.selectedToolId === ToolIdConstants.SELECTION_ID) {
      (this.toolsService.selectedTool as SelectionToolService).rotate(event);
    }
  }
}
