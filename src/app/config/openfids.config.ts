import {environment} from '../../environments/environment';
import {runtimeConfig} from './runtime.config';

export const app = {
  apiUrl: runtimeConfig.apiUrl || environment.apiUrl,
  urlAirlineLogo: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo'
};
