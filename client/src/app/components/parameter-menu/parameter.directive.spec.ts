import { ViewContainerRef } from '@angular/core';
import { ParameterDirective } from './parameter.directive';

class MockRef extends ViewContainerRef {
  element: import('@angular/core').ElementRef<any>; injector: import('@angular/core').Injector;
  parentInjector: import('@angular/core').Injector;
  length: number;
  clear(): void {
    throw new Error('Method not implemented.');
  }
  get(index: number): import('@angular/core').ViewRef | null {
    throw new Error('Method not implemented.');
  }
  createEmbeddedView<C>(
    templateRef: import('@angular/core').TemplateRef<C>,
    context?: C | undefined, index?: number | undefined,
  ): import('@angular/core').EmbeddedViewRef<C> {
    throw new Error('Method not implemented.');
  }
  createComponent<C>(
    componentFactory: import('@angular/core').ComponentFactory<C>,
    index?: number | undefined, injector?: import('@angular/core').Injector | undefined,
    projectableNodes?: any[][] | undefined, ngModule?: import('@angular/core').NgModuleRef<any> | undefined,
  ):
    import('@angular/core').ComponentRef<C> {
    throw new Error('Method not implemented.');
  }
  insert(viewRef: import('@angular/core').ViewRef, index?: number | undefined): import('@angular/core').ViewRef {
    throw new Error('Method not implemented.');
  }
  move(viewRef: import('@angular/core').ViewRef, currentIndex: number): import('@angular/core').ViewRef {
    throw new Error('Method not implemented.');
  }
  indexOf(viewRef: import('@angular/core').ViewRef): number {
    throw new Error('Method not implemented.');
  }
  remove(index?: number | undefined): void {
    throw new Error('Method not implemented.');
  }
  detach(index?: number | undefined): import('@angular/core').ViewRef | null {
    throw new Error('Method not implemented.');
  }
}

describe('ParameterDirective', () => {
  it('should create an instance', () => {
    const directive = new ParameterDirective(new MockRef());
    expect(directive).toBeTruthy();
  });
});
