import {ApplicationConfig, provideZonelessChangeDetection, provideBrowserGlobalErrorListeners} from '@angular/core';
import {IMAGE_CONFIG} from '@angular/common';
import {provideRouter, withComponentInputBinding, withViewTransitions} from '@angular/router';
import {routes} from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions({ skipInitialTransition: true })
    ),
    {
      provide: IMAGE_CONFIG,
      useValue: {
        disableImageSizeWarning: true
      }
    }
  ]
};
