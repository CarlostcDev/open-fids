import { Component, signal } from '@angular/core';
import { Header } from './components/header/header';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [
    Header
  ],
  styleUrl: './app.scss'
})

export class App {
  protected readonly title = signal('flight-information-display-system');
}
