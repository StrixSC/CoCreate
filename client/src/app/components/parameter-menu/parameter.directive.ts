import { Directive, ViewContainerRef } from '@angular/core';
/// Permet de charger le bon component
@Directive({
  selector: '[appParameter]',
})
export class ParameterDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
