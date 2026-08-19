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

  async downloadFids(airport: Airport): Promise<void> {
    const url = `https://carlostcdev.github.io/open-fids/?airport=${encodeURIComponent(airport.iata_code)}`;
    const local = `http://localhost:4200/?airport=${encodeURIComponent(airport.iata_code)}`;
    const platform = navigator.platform;
    let scriptPath: string;
    let fileName: string;
    let mimeType: string;

    if (/Win/i.test(platform)) {
      scriptPath = 'scripts/fids-launcher.bat';
      fileName = `FIDS-${airport.iata_code}.bat`;
      mimeType = 'application/bat';
    } else if (/Linux/i.test(platform)) {
      scriptPath = 'scripts/fids-launcher.sh';
      fileName = `FIDS-${airport.iata_code}.sh`;
      mimeType = 'application/x-sh';
    } else {
      return;
    }

    try {
      const response = await fetch(scriptPath);
      if (!response.ok) return;
      const script = (await response.text()).replace('__FIDS_URL__', url);
      const blob = new Blob([script], {type: mimeType});
      const download = document.createElement('a');
      download.href = URL.createObjectURL(blob);
      download.download = fileName;
      download.click();
      URL.revokeObjectURL(download.href);
    } catch {
      return;
    }
  }
}
