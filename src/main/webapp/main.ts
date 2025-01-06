// main.ts
import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import AppComponent from './app/app.component';
import { DEBUG_INFO_ENABLED } from './app/app.constants';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

if (!DEBUG_INFO_ENABLED) {
  enableProdMode();
}

bootstrapApplication(AppComponent, appConfig)
  .then(() => console.log('Application started'))
  .catch(err => console.error(err));
