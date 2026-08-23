import { Service } from '@angular/core';
import { apiRequestUrl } from '../config/openfids.config';
import { SearchAirport } from '../interfaces/search-airport';
import { Airport } from '../interfaces/airport';
import { NearbyAirport } from '../interfaces/nearby-airport';

@Service()
export class AirportService {
  private readonly endpoints = {
    airports: apiRequestUrl('airports'),
    nearby: apiRequestUrl('nearby-airports'),
    fallback: 'data/airports-fallback.json'
  };

  async getAirports(): Promise<SearchAirport[]> {
    try {
      const res = await fetch(this.endpoints.airports);
      if (!res.ok) return this.getFallback();
      const data: Airport[] = await res.json();
      return (!Array.isArray(data) || data.length === 0) ? this.getFallback() : this.mapAirports(data);
    } catch {
      return this.getFallback();
    }
  }

  async getNearby(): Promise<Airport[]> {
    try {
      const res = await fetch(this.endpoints.nearby);
      if (!res.ok) return [];
      const data: NearbyAirport[] = await res.json();
      return Array.isArray(data) ? data.filter(a => a.iata_code).map(a => ({ iata_code: a.iata_code, name: a.name, city: a.city })) : [];
    } catch {
      return [];
    }
  }

  private async getFallback(): Promise<SearchAirport[]> {
    try {
      const res = await fetch(this.endpoints.fallback);
      if (!res.ok) return [];
      const data: Airport[] = await res.json();
      return Array.isArray(data) ? this.mapAirports(data) : [];
    } catch {
      return [];
    }
  }

  private mapAirports(airports: Airport[]): SearchAirport[] {
    return airports.filter(a => a.iata_code).map(a => ({
      ...a, searchName: a.name.toLowerCase(), searchCity: a.city?.toLowerCase() ?? '', searchIata: a.iata_code.toLowerCase()
    }));
  }
}
