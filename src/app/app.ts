import { Component, signal } from '@angular/core';
import {SearchBar} from './components/search-bar/search-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [
    SearchBar
  ],
  styleUrl: './app.scss'
})

export class App {
  protected readonly title = signal('flight-information-display-system');
}
