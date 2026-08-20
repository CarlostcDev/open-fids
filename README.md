# OpenFIDS

<img src="public/banners/open-fids-banner-without.webp" alt="OpenFIDS - Flight Information Display System">

**OpenFIDS** is an open-source **Flight Information Display System (FIDS)** released under the **MIT License**.

It provides a free FIDS solution for **Windows**, **Linux distributions** and **Raspberry Pi**, aimed especially at small airports and organizations that need a functional flight information display without investing in commercial FIDS software.

The application uses **AirLabs API** as its flight and airport data provider. A Cloudflare Worker acts as a backend proxy so the AirLabs API key is never exposed in the frontend.

> OpenFIDS is currently under development. The public deployment is intended for development and demonstration purposes and does not have enough AirLabs API capacity for continuous operation in a real airport.

## How it works

The system is composed of three main parts:

```text
OpenFIDS
   │
   │ HTTPS
   ▼
Cloudflare Worker
   │
   │ API request with secret API key
   ▼
AirLabs API
   │
   └── Airport and flight data
```

The production Worker currently used by the public OpenFIDS deployment is:

**https://fids.carlostcdev.workers.dev/**

Its source code is contained in the `fids` directory of:

**https://github.com/CarlostcDev/carlostcdev-workers**

The Worker keeps the `AIRLABS_API_KEY` as a Cloudflare secret instead of exposing it to the frontend. It provides the following endpoints:

- `/airports` — retrieves airports containing an IATA code.
- `/airport?iata=XXX` — retrieves information for a specific airport.
- `/schedules?dep_iata=XXX` — retrieves departure schedules.
- `/schedules?arr_iata=XXX` — retrieves arrival schedules.
- `/docs` — Swagger API documentation.
- `/openapi.json` — OpenAPI specification.

The schedules endpoint requests a maximum of **50 records** from AirLabs. The Worker also removes duplicate schedule records and combines available codeshare information before ordering the results by flight time.

## Data source

All airport and flight information displayed by OpenFIDS comes from **AirLabs**.

The availability, accuracy, freshness and coverage of the information therefore depend on AirLabs and the data available through its API.

If an airport cannot be found in OpenFIDS, this does not necessarily mean that the airport does not exist. It may mean that AirLabs does not currently provide the corresponding airport data. In that case, the airport operator should contact AirLabs.

## Using OpenFIDS

### 1. Search for an airport

OpenFIDS allows the user to search for an airport using:

- its three-letter IATA code;
- its airport name in English.

At least **three characters** must be entered before search results are displayed.

The application then displays all matching airports.

### 2. Select the airport

Every airport in the search results contains a **Download FIDS** button.

Selecting an airport generates the appropriate startup script for the operating system.

### 3. Start the FIDS

The downloaded script starts the FIDS for the selected airport.

On Windows, the generated file is a **Batch/Windows-compatible startup script**.

On Linux, the generated file is a **Shell script**.

The script handles the browser required by OpenFIDS:

- If Chrome/Chromium is already installed, it uses the existing installation.
- If it is not available, the script installs the required browser.
- It launches the FIDS in **kiosk mode**.
- The browser is opened in fullscreen.
- Browser menus and normal browser controls are hidden to prevent normal interaction with the underlying browser interface.

The kiosk process is intentionally designed so that the FIDS behaves as a dedicated display rather than as a normal browser tab.

### Important: existing browser processes

When the startup script is executed, it will **force the closure of existing Chrome/Chromium processes** before launching the FIDS.

This is required to make sure the browser can be started correctly in kiosk mode without an existing browser session interfering with the launch parameters.

Save any work using Chrome/Chromium before executing the script.

To exit the FIDS, close the kiosk browser using the operating system's normal force-close methods, such as `Alt + F4` on Windows/Linux desktop environments where applicable.

## Installing your own backend

The public OpenFIDS deployment uses:

```text
https://fids.carlostcdev.workers.dev/
```

That endpoint is intended for the development version of OpenFIDS and should not be considered suitable for running a real airport installation.

For your own deployment, create your own Cloudflare Worker and your own AirLabs API configuration.

### 1. Clone the repositories

Clone the OpenFIDS repository:

```bash
git clone https://github.com/CarlostcDev/open-fids.git
cd open-fids
```

Clone the Cloudflare Workers repository:

```bash
git clone https://github.com/CarlostcDev/carlostcdev-workers.git
cd carlostcdev-workers/fids
```

The `carlostcdev-workers` repository contains multiple Workers. For OpenFIDS, you only need the:

```text
/fids
```

directory.

The FIDS Worker currently uses Wrangler and contains its own `package.json` and `wrangler.jsonc`.

### 2. Create an AirLabs account

Create an account at:

https://airlabs.co/

Obtain an **AirLabs API key** from your AirLabs account.

Your API key is a secret and must not be placed directly into the OpenFIDS frontend or committed to Git.

### 3. Configure the Cloudflare Worker

Install the Worker dependencies:

```bash
npm install
```

Log in to Cloudflare:

```bash
npx wrangler login
```

Configure the AirLabs API key as a Cloudflare Worker Secret:

```bash
npx wrangler secret put AIRLABS_API_KEY
```

When prompted, enter your AirLabs API key.

The Worker is explicitly implemented to read the `AIRLABS_API_KEY` secret from its environment and returns a server configuration error when that secret is unavailable.

You can verify the configured secrets with:

```bash
npx wrangler secret list
```

### 4. Test the Worker

Run the Worker locally:

```bash
npm run dev
```

The FIDS Worker can then be tested locally before deployment.

The Worker exposes the same core endpoints used by the frontend:

```text
/airports
/airport?iata=MAD
/schedules?dep_iata=MAD
/schedules?arr_iata=MAD
```

### 5. Deploy the Worker

Deploy the Worker with:

```bash
npm run deploy
```

The Worker configuration currently defines the Worker name as `fids` and uses `src/index.ts` as its entry point.

After deployment, Cloudflare will provide the public Worker URL.

### 6. Configure OpenFIDS to use your Worker

Clone the OpenFIDS repository:

```bash
git clone https://github.com/CarlostcDev/open-fids.git
cd open-fids
```

Install the dependencies:

```bash
npm install
```

The current OpenFIDS project is an Angular 22 application and uses npm 11.12.1 as its package manager specification.

Replace the API URLs used by OpenFIDS so they point to your own Cloudflare Worker instead of:

```text
https://fids.carlostcdev.workers.dev/
```

The frontend must use the URL of the Worker you deployed.

After configuring the URLs, build the application:

```bash
npm run build
```

For local development:

```bash
npm start
```

The current project is an Angular application generated with Angular CLI and uses `ng serve`/`ng build` through its npm scripts.

## Recommended deployment model

For a real installation, the recommended architecture is:

```text
Airport Display
      │
      ▼
   OpenFIDS
      │
      ▼
Your Cloudflare Worker
      │
      ▼
Your AirLabs API account
```

This keeps the AirLabs API key on the backend and allows the airport operator to control its own API account and usage limits.

The public OpenFIDS deployment should therefore be treated as a demonstration/development endpoint rather than the backend for a production airport installation.

## Display behavior

OpenFIDS calculates how many flight records can fit on the available display and loads the corresponding number of records.

The AirLabs schedule request is currently limited to **50 records**, so the FIDS cannot display more than the number of records available from that request.

The application is therefore designed to adapt the visible number of rows to the screen rather than always rendering a fixed number of flights.

## Intended use

OpenFIDS is particularly intended for:

- small airports;
- low-budget airport projects;
- educational or demonstration environments;
- Raspberry Pi-based display systems;
- organizations that need a simple FIDS without purchasing a commercial FIDS platform.

The software itself is free and released under the MIT License. The external flight and airport data comes from AirLabs and therefore depends on the AirLabs service and the API plan used by the deployment.

For a real airport installation, the operator should use its own AirLabs account and API limits appropriate for its expected traffic and refresh requirements.

## SEO, Performance & Accessibility

[![PageSpeed Insights](docs/pagespeed-insight-statistics.png)](https://pagespeed.web.dev/analysis/https-carlostcdev-github-io-open-fids/8fty97twp7?hl=es&form_factor=desktop)

## Current limitations

OpenFIDS is still under development.

Known improvements planned for future versions:

1. **Departure data filtering**

   In some airports, the departure list can contain aircraft that departed several hours earlier. The departure data handling needs to be improved so that obsolete records are excluded more reliably.

2. **FIDS customization**

   Add a customization system allowing operators to modify interface colors and replace the default OpenFIDS branding with their own company or airport logo.

3. **Arrival/departure switching**

   Add a button allowing the display to switch between departure and arrival flights.

4. **Pagination and multiscreen support**

   Add pagination so more flight records can be distributed across multiple screens.

5. **Display city names**

   The FIDS currently displays city codes instead of city names. The airport information should be updated so that the corresponding city name is displayed.

## License

OpenFIDS is distributed under the **MIT License**.

The project is open source and can be used, modified and redistributed according to the terms of that license.

## Repositories

### OpenFIDS

https://github.com/CarlostcDev/open-fids

### Cloudflare Workers

https://github.com/CarlostcDev/carlostcdev-workers

The FIDS backend is located at:

```text
carlostcdev-workers/fids
```

### Public FIDS API

https://fids.carlostcdev.workers.dev/

### AirLabs

https://airlabs.co/
