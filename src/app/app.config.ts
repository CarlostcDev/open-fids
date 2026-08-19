import {ApplicationConfig, provideBrowserGlobalErrorListeners} from '@angular/core';
import {IMAGE_CONFIG} from '@angular/common';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    {
      provide: IMAGE_CONFIG,
      useValue: {
        disableImageSizeWarning: true
      }
    }
  ]
};
