import { Service } from '@angular/core';
import { environment } from '../../environments/environment';
import { apiRequestUrl } from '../config/openfids.config';
import { SearchAirport } from '../interfaces/search-airport';
import { Airport } from '../interfaces/airport';
import { NearbyAirport } from '../interfaces/nearby-airport';

@Service()
export class AirportService {
  private readonly apiUrl = apiRequestUrl('airports');
  private readonly nearbyUrl = apiRequestUrl('nearby-airports');
  private readonly fallbackUrl = 'data/airports-fallback.json';

  async getAirports(): Promise<SearchAirport[]> {
    if (!environment.production) return this.getFallback();
    try {
      const res = await fetch(this.apiUrl);
      if (!res.ok) return this.getFallback();
      const data: Airport[] = await res.json();
      if (!Array.isArray(data) || data.length === 0) return this.getFallback();
      return this.mapAirports(data);
    } catch {
      return this.getFallback();
    }
  }

  async getNearby(): Promise<Airport[]> {
    try {
      const res = await fetch(this.nearbyUrl);
      if (!res.ok) return [];
      const data: NearbyAirport[] = await res.json();
      if (!Array.isArray(data)) return [];
      return data.filter(a => a.iata_code).map(a => ({ iata_code: a.iata_code, name: a.name, city: a.city }));
    } catch {
      return [];
    }
  }

  private async getFallback(): Promise<SearchAirport[]> {
    try {
      const res = await fetch(this.fallbackUrl);
      if (!res.ok) return [];
      const data: Airport[] = await res.json();
      return Array.isArray(data) ? this.mapAirports(data) : [];
    } catch {
      return [];
    }
  }

  private mapAirports(airports: Airport[]): SearchAirport[] {
    return airports.filter(a => a.iata_code).map(
      a => ({...a, searchName: a.name.toLowerCase(), searchCity: '', searchIata: a.iata_code.toLowerCase()}));
  }
}
