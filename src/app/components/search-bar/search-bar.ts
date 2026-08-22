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
  private readonly airportService = inject(AirportService);
  private readonly dataAirports = signal<SearchAirport[]>([]);
  private readonly dataNearby = signal<Airport[]>([]);
  readonly isFocused = signal(false);
  readonly query = signal('');

  readonly results = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (q.length < 3) return this.isFocused() ? this.dataNearby() : [];
    const list = this.dataAirports();
    const matches: Airport[] = [];
    let exact: Airport | null = null;
    for (const airport of list) {
      if (airport.searchIata === q) {exact = airport;continue;}
      if (airport.searchIata.includes(q) || airport.searchName.includes(q) || airport.searchCity.includes(q)) matches.push(airport);
    }
    if (exact) matches.unshift(exact);
    return matches;
  });

  async ngOnInit() {
    const hasAirportParam = new URLSearchParams(window.location.search).has('airport');
    if (hasAirportParam) return;
    const [airports, nearby] = await Promise.all([this.airportService.getAirports(), this.airportService.getNearby()]);
    this.dataAirports.set(airports);
    this.dataNearby.set(nearby);
  }

  setFocus(state: boolean): void {
    if (state) this.isFocused.set(true);
    else setTimeout(() => this.isFocused.set(false), 150);
  }
}
