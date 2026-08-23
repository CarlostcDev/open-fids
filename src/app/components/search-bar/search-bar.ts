import { Component, computed, signal, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AirportsList } from '../airports-list/airports-list';
import { AssetPath } from '../../pipes/asset-path';
import { Sprite } from '../../pipes/sprite';
import { AirportService } from '../../services/airport.service';
import { SearchAirport } from '../../interfaces/search-airport';
import { Airport } from '../../interfaces/airport';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
  imports: [AirportsList, RouterLink, AssetPath, Sprite]
})

export class SearchBar implements OnInit {
  private readonly airportApi = inject(AirportService);
  readonly isFocused = signal(false);
  readonly query = signal('');
  private readonly allAirports = signal<SearchAirport[]>([]);
  private readonly nearbyAirports = signal<Airport[]>([]);

  readonly results = computed(() => {
    if (!this.isFocused()) return [];
    const q = this.query().trim().toLowerCase();
    if (q.length < 3) return this.nearbyAirports();
    const matches: Airport[] = [];
    let exact: Airport | null = null;
    for (const airport of this.allAirports()) {
      if (airport.searchIata === q) {exact = airport;continue;}
      if (airport.searchIata.includes(q) || airport.searchName.includes(q) || airport.searchCity.includes(q)) matches.push(airport);
    }
    if (exact) matches.unshift(exact);
    return matches;
  });

  async ngOnInit() {
    if (new URLSearchParams(window.location.search).has('airport')) return;
    const [airports, nearby] = await Promise.all([
      this.airportApi.getAirports(),
      this.airportApi.getNearby()
    ]);
    this.allAirports.set(airports);
    this.nearbyAirports.set(nearby);
  }

  setFocus(state: boolean): void {
    if (state) this.isFocused.set(true);
    else setTimeout(() => this.isFocused.set(false), 150);
  }
}
