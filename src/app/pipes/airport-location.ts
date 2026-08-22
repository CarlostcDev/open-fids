import { Pipe, PipeTransform } from '@angular/core';
import { Airport } from '../interfaces/airport';

@Pipe({
  name: 'airportLocation'
})

export class AirportLocation implements PipeTransform {
  transform(airport: Airport): string {
    if (!airport) return '';
    return airport.city ? `${airport.name}, ${airport.city}` : airport.name;
  }
}
