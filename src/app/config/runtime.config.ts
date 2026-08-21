declare global {
  interface Window {
    OPENFIDS_CONFIG: {
      apiUrl: string;
    };
  }
}

export const runtimeConfig = window.OPENFIDS_CONFIG;
