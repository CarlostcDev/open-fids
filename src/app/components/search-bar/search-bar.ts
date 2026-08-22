import {Component, computed, signal} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {toSignal} from '@angular/core/rxjs-interop';
import {AirportsList} from '../airports-list/airports-list';
import {RouterLink} from '@angular/router';
import {apiRequestUrl} from '../../config/openfids.config';
import {SearchAirport} from '../../interfaces/search-airport';
import {Airport} from '../../interfaces/airport';
import {NearbyAirport} from '../../interfaces/nearby-airport';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
  imports: [ReactiveFormsModule, AirportsList, RouterLink]
})

export class SearchBar {
  private readonly apiUrl = apiRequestUrl('airports');
  private readonly nearbyApiUrl = apiRequestUrl('nearby-airports');
  private readonly fallbackUrl = 'data/airports-fallback.json';
  private readonly allAirports = signal<SearchAirport[]>([]);
  private readonly nearbyAirports = signal<Airport[]>([]);
  private readonly searchFocused = signal(false);
  readonly searchControl = new FormControl('', {nonNullable: true});
  readonly query = toSignal(this.searchControl.valueChanges, {initialValue: ''});
  readonly airports = computed(() => {
    const query = this.query().trim().toLowerCase();
    if (query.length < 3) return this.searchFocused() ? this.nearbyAirports() : [];
    const airports = this.allAirports();
    const results: Airport[] = [];
    let exactMatch: Airport | null = null;
    for (const airport of airports) {
      if (airport.searchIata === query) {exactMatch = airport;continue;}
      if (airport.searchIata.includes(query) || airport.searchName.includes(query) || airport.searchCity.includes(query)) results.push(airport);
    }
    if (exactMatch) results.unshift(exactMatch);
    return results;
  });

  constructor() {
    const airport = new URLSearchParams(window.location.search).get('airport');
    if (!airport) {
      void this.loadAirports();
      void this.loadNearbyAirports();
    }
  }

  onSearchFocus(): void {
    this.searchFocused.set(true);
  }

  onSearchBlur(): void {
    setTimeout(() => this.searchFocused.set(false), 0);
  }

  private async loadAirports(): Promise<void> {
    if (!environment.production) {
      await this.loadFallbackAirports();
      return;
    }

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

  private async loadNearbyAirports(): Promise<void> {
    try {
      const response = await fetch(this.nearbyApiUrl);
      if (!response.ok) return;
      const airports: NearbyAirport[] = await response.json();
      if (!Array.isArray(airports)) return;
      this.nearbyAirports.set(airports.filter(airport => airport.iata_code).map(airport => ({
        iata_code: airport.iata_code, name: airport.name, city: airport.city
      })));
    } catch {
      this.nearbyAirports.set([]);
    }
  }

  private async loadFallbackAirports(): Promise<void> {
    try {
      const response = await fetch(this.fallbackUrl);
      if (!response.ok) {this.allAirports.set([]); return;}
      const airports: Airport[] = await response.json();
      this.setAirports(Array.isArray(airports) ? airports : []);
    } catch {
      this.allAirports.set([]);
    }
  }

  private setAirports(airports: Airport[]): void {
    this.allAirports.set(airports.filter(airport => airport.iata_code).map(airport => ({
      ...airport,
      searchName: airport.name.toLowerCase(),
      searchCity: '',
      searchIata: airport.iata_code.toLowerCase()
    })));
  }
}
