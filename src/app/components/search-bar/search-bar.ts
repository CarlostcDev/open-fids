import { Component } from '@angular/core';
import {AirportsList} from '../airports-list/airports-list';

@Component({
  selector: 'app-search-bar',
  imports: [
    AirportsList
  ],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
})
export class SearchBar {}
