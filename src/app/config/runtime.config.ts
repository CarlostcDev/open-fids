import {environment} from '../../environments/environment';

declare global {
  interface Window {
    OPENFIDS_CONFIG?: {
      apiUrl?: string;
    };
  }
}

export const runtimeConfig = {
  apiUrl: window.OPENFIDS_CONFIG?.apiUrl || environment.apiUrl
};
