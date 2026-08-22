import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { SearchBar } from './components/search-bar/search-bar';
import { Fids } from './components/fids/fids';
import { Aircraft } from './components/aircraft/aircraft';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [SearchBar, Fids, Aircraft, RouterOutlet],
  styleUrl: './app.scss'
})
export class App {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly iata = toSignal(
    this.route.queryParamMap.pipe(
      map(params => params.get('airport'))
    )
  );

  readonly isRootRoute = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.urlAfterRedirects === '/' || event.urlAfterRedirects.startsWith('/?'))
    ),
    { initialValue: this.router.url === '/' || this.router.url.startsWith('/?') }
  );
}
