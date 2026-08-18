import {Component, input} from '@angular/core';

@Component({
  selector: 'app-fids',
  imports: [],
  templateUrl: './fids.html',
  styleUrl: './fids.scss',
})

export class Fids {
  iata = input.required<string>();
}
