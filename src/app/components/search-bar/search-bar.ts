import {Component, computed, signal, viewChild} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {AirportsList} from '../airports-list/airports-list';

interface Airport {
  name: string;
  iata_code: string;
}

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
  imports: [ReactiveFormsModule, AirportsList]
})

export class SearchBar {
  private readonly apiUrl = 'https://fids.carlostcdev.workers.dev/airports';
  private readonly allAirports = signal<Airport[]>([]);
  readonly searchControl = new FormControl('', {nonNullable: true});
  readonly query = signal('');

  readonly airports = computed(() => {
    const query = this.query().trim().toLowerCase();

    if (query.length < 3) {
      return [];
    }

    const airports = this.allAirports().filter(airport =>
      airport.iata_code.toLowerCase().includes(query) ||
      airport.name.toLowerCase().includes(query)
    );

    return airports.sort((a, b) => {
      const aExact = a.iata_code.toLowerCase() === query;
      const bExact = b.iata_code.toLowerCase() === query;

      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      return 0;
    });
  });

  constructor() {
    this.searchControl.valueChanges.subscribe(value => this.query.set(value));
    void this.loadAirports();
  }

  private async loadAirports(): Promise<void> {
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) return;
      this.allAirports.set(await response.json());
    } catch {
      this.allAirports.set([]);
    }
  }
}
