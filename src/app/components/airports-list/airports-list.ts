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
    const url = `https://carlostcdev.github.io/flight-information-display-system/?airport=${encodeURIComponent(airport.iata_code)}`;
    try {
      const response = await fetch('/scripts/fids-launcher.bat');
      if (!response.ok) return;
      const script = (await response.text()).replace('__FIDS_URL__', url);
      const blob = new Blob([script], {type: 'application/bat'});
      const download = document.createElement('a');
      download.href = URL.createObjectURL(blob);
      download.download = `FIDS-${airport.iata_code}.bat`;
      download.click();
      URL.revokeObjectURL(download.href);
    } catch {
      return;
    }
  }
}
