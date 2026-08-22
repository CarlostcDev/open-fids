# OpenFIDS

<img src="public/banners/open-fids-banner-without.webp" alt="OpenFIDS - Flight Information Display System">

OpenFIDS is a free and open-source **Flight Information Display System** for airports.

It provides real-time departure and arrival information through a responsive airport display, with support for local installations, Docker deployments and dedicated kiosk displays.

## Features

- Real-time departure and arrival boards.
- Airport search by IATA code or airport name.
- Nearby airport detection.
- Flight number, airline, destination/origin, status, terminal and gate information.
- 12-hour and 24-hour time formats.
- Departure / arrival mode switching.
- Custom airport logo.
- Custom display color.
- Persistent display preferences.
- Windows and Linux kiosk launchers.
- Responsive number of displayed flights depending on the available screen.
- Development mode with local mock data.
- Swagger and OpenAPI documentation.

## Data sources

OpenFIDS uses different providers depending on the type of information:

| Data                  | Provider                 |
|-----------------------|--------------------------|
| Airport list          | AirLabs + local fallback |
| Flight schedules      | AeroDataBox via RapidAPI |
| Nearby airports by ip | AeroDataBox via RapidAPI |
| Development data      | Local mocks              |

The Cloudflare Worker acts as the backend and keeps the API credentials away from the frontend.

## Run locally

### Requirements

- Node.js 24
- npm 11.12.1
- Git

### Installation

```bash
git clone https://github.com/CarlostcDev/open-fids.git
cd open-fids
npm install
npm start
```

Open:

```text
http://localhost:4200
```

To open a specific airport directly:

```text
http://localhost:4200/?airport=MAD
```

### Production build

```bash
npm run build
```

## Run with Docker

Build the image:

```bash
docker build -t open-fids .
```

Run it:

```bash
docker run -d \
  --name open-fids \
  -p 8080:80 \
  -e FIDS_API_URL=https://fids.carlostcdev.workers.dev \
  open-fids
```

Open:

```text
http://localhost:8080
```

To use your own backend:

```bash
docker run -d \
  --name open-fids \
  -p 8080:80 \
  -e FIDS_API_URL=https://your-worker.workers.dev \
  open-fids
```

`FIDS_API_URL` is injected at container startup, so the Docker image does not need to be rebuilt when changing the backend URL.

## Cloudflare Worker

The OpenFIDS Worker is located in the [`carlostcdev-workers`](https://github.com/CarlostcDev/carlostcdev-workers) repository under `/fids`.

### 1. Clone the Worker

```bash
git clone https://github.com/CarlostcDev/carlostcdev-workers.git
cd carlostcdev-workers/fids
npm install
```

### 2. Configure Cloudflare

```bash
npx wrangler login
```

Add the required secrets:

```bash
npx wrangler secret put AIRLABS_API_KEY
npx wrangler secret put RAPIDAPI_KEY
```

`AIRLABS_API_KEY` is used for the airport database.

`RAPIDAPI_KEY` is used for AeroDataBox flight schedules and nearby airports.

### 3. Test locally

```bash
npm run dev
```

### 4. Deploy

```bash
npm run deploy
```

After deployment, use the generated Worker URL as the OpenFIDS API URL.

## Worker API

```text
GET /airports
GET /schedules?dep_iata=MAD
GET /schedules?arr_iata=MAD
GET /nearby-airports

GET /docs
GET /openapi.json
```

The Worker also supports `dev=true` for endpoints that have mock data, allowing the application to be developed without consuming external API quotas.

Example:

```text
/schedules?dep_iata=MAD&dev=true
```

## Kiosk mode

OpenFIDS includes launchers for Windows and Linux that start the selected airport in a dedicated Chromium/Chrome kiosk window.

The launcher can automatically install Chromium when necessary and configure the browser for fullscreen FIDS operation.

> The launcher closes existing Chrome/Chromium processes before starting the FIDS.

## Deployment

OpenFIDS can be deployed as a normal Angular application or as a Docker container.

For a production installation, the recommended architecture is:

```text
OpenFIDS
    │
    ▼
Cloudflare Worker
    ├── AirLabs
    └── AeroDataBox / RapidAPI
```

This keeps API credentials on the backend and allows each deployment to use its own provider accounts.

## License

OpenFIDS is released under the **MIT License**.

See [`LICENSE.txt`](LICENSE.txt) for the full license.
