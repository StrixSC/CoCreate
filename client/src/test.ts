// This file is required by karma.conf.js and loads recursively all the .spec and framework files
import 'zone.js/dist/zone-testing';
/* Disable puisque lorsque certain test sont rouler sur jasmine une erreur :'TypeError: Cannot read
property 'assertPresent' of undefined:' s'affiche et l'une des solution trouver sur github etait de
mettre le zone.js au debut : 'The zone import must come before all other imports.' */
// tslint:disable-next-line: ordered-imports
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// tslint:disable-next-line:no-any from cli
declare const require: any;

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);
// Then we find all the tests.
const context = require.context('./', true, /.spec\.ts$/);
// And load the modules.
context.keys().map(context);
