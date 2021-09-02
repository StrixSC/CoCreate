import { Component } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material';
import { SidenavService } from 'src/app/services/sidenav/sidenav.service';
import { Tools } from 'src/app/interfaces/tools.interface';
import { ToolsService } from 'src/app/services/tools/tools.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})

export class SidenavComponent {

  constructor(private sideNavService: SidenavService, private toolService: ToolsService) { }

  get currentToolId(): number {
    return this.toolService.selectedToolId;
  }

  get toolList(): Map<number, Tools> {
    return this.sideNavService.toolList;
  }

  get isOpened(): boolean {
    return this.sideNavService.isOpened;
  }

  /// Choisit un parametre
  get selectedParameter(): number {
    return this.sideNavService.selectedParameter;
  }

  /// Ouvre le sidenav
  open(): void {
    this.sideNavService.open();
  }

  /// Ferme le sidenav
  close(): void {
    this.sideNavService.close();
  }

  /// Changer la selection avec un toggle button
  selectionChanged(selectedItem: MatButtonToggleChange): void {
    this.sideNavService.selectionChanged(selectedItem);
  }

  /// Ouvre le menu control
  openControlMenu(): void {
    this.sideNavService.openControlMenu();
  }

  /// Ouvre le menu de la grille
  openGridMenu(): void {
    this.sideNavService.openGridMenu();
  }
}
