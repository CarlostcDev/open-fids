import {Component, inject} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {SearchBar} from './components/search-bar/search-bar';
import {Fids} from './components/fids/fids';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [SearchBar, Fids],
  styleUrl: './app.scss'
})

export class App {
  private readonly route = inject(ActivatedRoute);
  readonly airport = toSignal(this.route.queryParamMap);
}
