import {Component, computed, signal} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {toSignal} from '@angular/core/rxjs-interop';
import {AirportsList} from '../airports-list/airports-list';

interface Airport {
  name: string;
  city: string;
  iata_code: string;
}

interface SearchAirport extends Airport {
  searchName: string;
  searchIata: string;
}

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
  imports: [ReactiveFormsModule, AirportsList]
})

export class SearchBar {
  private readonly apiUrl = 'https://fids.carlostcdev.workers.dev/airports';
  private readonly fallbackUrl = 'data/airports-fallback.json';
  private readonly allAirports = signal<SearchAirport[]>([]);
  readonly searchControl = new FormControl('', {nonNullable: true});
  readonly query = toSignal(this.searchControl.valueChanges, {initialValue: ''});

  readonly airports = computed(() => {
    const query = this.query().trim().toLowerCase();
    if (query.length < 3) return [];
    const airports = this.allAirports();
    const results: Airport[] = [];
    let exactMatch: Airport | null = null;
    for (const airport of airports) {
      if (airport.searchIata === query) {exactMatch = airport;continue;}
      if (airport.searchIata.includes(query) || airport.searchName.includes(query)) results.push(airport);
    }
    if (exactMatch) results.unshift(exactMatch);
    return results;
  });

  constructor() {
    void this.loadAirports();
  }

  private async loadAirports(): Promise<void> {
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) {await this.loadFallbackAirports();return;}
      const airports: Airport[] = await response.json();
      if (!Array.isArray(airports) || airports.length === 0) {await this.loadFallbackAirports();return;}
      this.setAirports(airports);
    } catch {
      await this.loadFallbackAirports();
    }
  }

  private async loadFallbackAirports(): Promise<void> {
    try {
      const response = await fetch(this.fallbackUrl);
      if (!response.ok) {this.allAirports.set([]);return;}
      const airports: Airport[] = await response.json();
      this.setAirports(Array.isArray(airports) ? airports : []);
    } catch {
      this.allAirports.set([]);
    }
  }

  private setAirports(airports: Airport[]): void {
    this.allAirports.set(airports.map(airport => ({...airport, searchName: airport.name.toLowerCase(), searchIata: airport.iata_code.toLowerCase()})));
  }
}
