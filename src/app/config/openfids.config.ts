import {environment} from '../../environments/environment';
import {runtimeConfig} from './runtime.config';

export const app = {
  apiUrl: runtimeConfig.apiUrl,
  urlAirlineLogo: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo'
};

export function apiRequestUrl(path: string, params?: Record<string, string>): string {
  const url = new URL(`${app.apiUrl}/${path}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  if (!environment.production) {
    url.searchParams.set('dev', 'true');
  }

  return url.toString();
}
