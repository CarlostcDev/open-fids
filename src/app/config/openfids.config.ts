import {runtimeConfig} from './runtime.config';

export const app = {
  apiUrl: runtimeConfig.apiUrl,
  urlAirlineLogo: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo'
};

export function apiRequestUrl(path: string, params?: Record<string, string>): string {
  const url = new URL(`${app.apiUrl}/${path}`);
  if (params) for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const isLocalDev = typeof window !== 'undefined' && window.location.hostname === 'localhost' && window.location.port === '4200';
  if (isLocalDev) url.searchParams.set('dev', 'true');
  return url.toString();
}
