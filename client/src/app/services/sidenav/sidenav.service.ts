import { Injectable } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material';
import { Tools } from '../../interfaces/tools.interface';
import { ToggleDrawerService } from '../toggle-drawer/toggle-drawer.service';
import { ToolsService } from '../tools/tools.service';

/// Service permettant au sidenav de bien interagir avec les hotkeys et de bien gerer
/// sa selection d'outil. Vérifie aussi s'il s'agit du menu fichier ou d'outil
const ID_GRID_MENU = 16;
const ID_CONTROL_MENU = 17;

@Injectable({
  providedIn: 'root',
})

export class SidenavService {

  isControlMenu = false;
  isGridMenu = false;

  constructor(
    private toggleDrawerService: ToggleDrawerService,
    private toolService: ToolsService,
  ) {
  }

  /// Retourne la liste d'outils
  get toolList(): Map<number, Tools> {
    return this.toolService.tools;
  }

  /// Retourne si le drawer est ouvert
  get isOpened(): boolean {
    return this.toggleDrawerService.isOpened;
  }

  /// Retourne un index detourner pour le numero d'outil choisi
  get selectedParameter(): number {
    if (this.isControlMenu) {
      return ID_CONTROL_MENU;
    }
    if (this.isGridMenu) {
      return ID_GRID_MENU;
    }
    return this.toolService.selectedToolId;
  }

  /// Ouvre le drawer de paramètre
  open(): void {
    this.toggleDrawerService.open();
  }

  /// Ferme le drawer de paramètre
  close(): void {
    this.toggleDrawerService.close();
    this.isControlMenu = false;
    this.isGridMenu = false;
  }

  /// Change la selection d'outil
  selectionChanged(selectedItem: MatButtonToggleChange): void {
    this.toolService.selectTool(selectedItem.value);
    this.isControlMenu = false;
    this.isGridMenu = false;
  }

  /// Définit une ouverture de menu d'option fichier
  openControlMenu(): void {
    this.isControlMenu = true;
    this.isGridMenu = false;
    this.open();
  }

  /// Definit une ouverture du menu de la grille

  openGridMenu(): void {
    this.isGridMenu = true;
    this.isControlMenu = false;
    this.open();
  }
}
