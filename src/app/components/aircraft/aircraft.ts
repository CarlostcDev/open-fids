import { Component, signal } from '@angular/core';
import { AircraftData } from '../../interfaces/aircraft-data';

@Component({
  selector: 'app-aircraft',
  imports: [],
  templateUrl: './aircraft.html',
  styleUrl: './aircraft.scss',
})

export class Aircraft {
  readonly aircraft: AircraftData[] = [
    {name: 'Airbus A320-200', standard: 'airbus-a320-200'},
    {name: 'Airbus A350-900', standard: 'airbus-a350-900'},
    {name: 'Airbus A380-800', standard: 'airbus-a380-800'},
    {name: 'Boeing 787-10 Dreamliner', standard: 'boeing-787-10-dreamliner'},
  ];

  readonly currentAircraft = signal(0);

  nextAircraft(): void {
    this.currentAircraft.update(index => (index + 1) % this.aircraft.length);
  }
}
