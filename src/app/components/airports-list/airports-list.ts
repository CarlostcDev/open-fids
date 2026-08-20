import {Component, input} from '@angular/core';

interface Airport {
  name: string;
  iata_code: string;
}

@Component({
  selector: 'app-airports-list',
  templateUrl: './airports-list.html',
  styleUrl: './airports-list.scss'
})

export class AirportsList {
  readonly airports = input<Airport[]>([]);
  private readonly scriptCache = new Map<string, Promise<string>>();

  async downloadFids(airport: Airport): Promise<void> {
    const iata = encodeURIComponent(airport.iata_code);
    const url = `https://carlostcdev.github.io/open-fids/?airport=${iata}`;
    //const local = `http://localhost:4200/?airport=${encodeURIComponent(airport.iata_code)}`;
    const platform = navigator.platform;
    let scriptPath: string;
    let fileName: string;
    let mimeType: string;
    if (/Win/i.test(platform)) {
      scriptPath = 'scripts/fids-launcher.bat';
      fileName = `OpenFIDS-${airport.iata_code}.bat`;
      mimeType = 'application/bat';
    } else if (/Linux/i.test(platform)) {
      scriptPath = 'scripts/fids-launcher.sh';
      fileName = `OpenFIDS-${airport.iata_code}.sh`;
      mimeType = 'application/x-sh';
    } else return;

    try {
      let scriptPromise = this.scriptCache.get(scriptPath);
      if (!scriptPromise) {
        scriptPromise = fetch(scriptPath).then(async response => {if (!response.ok) throw new Error();return response.text();});
        this.scriptCache.set(scriptPath, scriptPromise);
      }
      const script = (await scriptPromise).replace('__FIDS_URL__', url);
      const blob = new Blob([script], {type: mimeType});
      const objectUrl = URL.createObjectURL(blob);
      const download = document.createElement('a');
      download.href = objectUrl;
      download.download = fileName;
      download.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      return;
    }
  }
}
