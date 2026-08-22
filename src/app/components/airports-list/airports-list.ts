import { Component, inject, input } from '@angular/core';
import { Airport } from '../../interfaces/airport';
import { AirportLocation } from '../../pipes/airport-location';
import { Sprite } from '../../pipes/sprite';
import { LauncherService } from '../../services/launcher.service';

@Component({
  selector: 'app-airports-list',
  templateUrl: './airports-list.html',
  styleUrl: './airports-list.scss',
  imports: [Sprite, AirportLocation]
})

export class AirportsList {
  readonly airports = input<Airport[]>([]);
  private readonly launcher = inject(LauncherService);

  download(airport: Airport): void {
    void this.launcher.download(airport);
  }
}
