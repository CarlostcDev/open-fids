import { Component, DestroyRef, afterNextRender, computed, inject, input, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { ScheduleResponse } from '../../interfaces/schedule-response';
import { FlightViewModel } from '../../interfaces/flight-view-model';
import { apiRequestUrl, app } from '../../config/openfids.config';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-fids',
  templateUrl: './fids.html',
  styleUrl: './fids.scss'
})
export class Fids {
  private readonly storage = inject(StorageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly iata = input.required<string>();

  readonly mode = signal<'departures' | 'arrivals'>(this.storage.get('fids_mode', 'departures') as 'departures' | 'arrivals');
  readonly customIcon = signal<string | null>(this.storage.get('fids_icon', null));
  readonly hoverIcon = signal(false);
  readonly format12h = signal<boolean>(this.storage.get('fids_time_format', 'false') === 'true');
  readonly time = signal('');
  readonly themeColor = signal<string>(this.storage.get('fids_theme_color', '#fdd511') as string);

  private readonly listHeight = signal(0);
  private readonly rowHeight = 60;

  private readonly scheduleRequest = computed(() => {
    const param = this.mode() === 'departures' ? 'dep_iata' : 'arr_iata';
    return { url: apiRequestUrl('schedules', { [param]: this.iata() }) };
  });

  readonly scheduleData = httpResource<ScheduleResponse>(this.scheduleRequest);

  readonly flights = computed<FlightViewModel[]>(() => {
    const response = this.scheduleData.value();
    if (!response) return [];

    const isDep = this.mode() === 'departures';
    const rawData = isDep ? (response.departures ?? []) : (response.arrivals ?? []);
    const count = Math.max(0, Math.floor(this.listHeight() / this.rowHeight));

    return rawData.slice(0, count).map(flight => {
      const node = isDep ? flight.departure : flight.arrival;
      const rawTime = node?.revisedTime?.local ?? node?.scheduledTime?.local;
      const status = flight.status ?? 'Scheduled';
      const statusLower = status.toLowerCase();

      return {
        number: flight.number ?? '--',
        rawTime,
        formattedTime: rawTime ? rawTime.slice(11, 16) : '--:--',
        airlineLogo: `${app.urlAirlineLogo}/${flight.airline?.iata ?? ''}.svg`,
        airlineAlt: `Airline logo ${flight.airline?.iata ?? ''}`,
        airportCode: isDep ? (flight.arrival?.airport?.iata ?? '---') : (flight.departure?.airport?.iata ?? '---'),
        airportName: isDep ? (flight.arrival?.airport?.name ?? '---') : (flight.departure?.airport?.name ?? '---'),
        status,
        isDelayed: statusLower === 'delayed',
        isScheduled: statusLower === 'expected' || statusLower === 'scheduled',
        isBoarding: statusLower === 'boarding',
        terminal: isDep ? (flight.departure?.terminal ?? '-') : (flight.arrival?.terminal ?? '-'),
        gate: flight.departure?.gate ?? '-'
      };
    });
  });

  constructor() {
    afterNextRender(() => {
      this.updateHeight();
      this.updateTime();
      this.applyColor(this.themeColor());

      const resizeFn = () => this.updateHeight();
      const timer = setInterval(() => this.updateTime(), 60000);

      window.addEventListener('resize', resizeFn);

      this.destroyRef.onDestroy(() => {
        window.removeEventListener('resize', resizeFn);
        clearInterval(timer);
      });
    });
  }

  toggleMode(): void {
    const next = this.mode() === 'departures' ? 'arrivals' : 'departures';
    this.mode.set(next);
    this.storage.set('fids_mode', next);
  }

  toggleTime(): void {
    const next = !this.format12h();
    this.format12h.set(next);
    this.storage.set('fids_time_format', String(next));
    this.updateTime();
  }

  clickIcon(inputEl: HTMLInputElement): void {
    if (this.customIcon()) {
      this.customIcon.set(null);
      this.storage.remove('fids_icon');
    } else {
      inputEl.click();
    }
  }

  selectFile(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const res = e.target?.result as string;
      this.customIcon.set(res);
      this.storage.set('fids_icon', res);
    };
    reader.readAsDataURL(file);
    target.value = '';
  }

  clickTitle(inputEl: HTMLInputElement, event: Event): void {
    if (event.target !== event.currentTarget) inputEl.click();
  }

  changeColor(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.themeColor.set(val);
    this.storage.set('fids_theme_color', val);
    this.applyColor(val);
  }

  private applyColor(color: string): void {
    const id = 'fids-color';
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('style');
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = `
      :not(svg).color-selection { color: ${color} !important; fill: ${color} !important; }
      svg.color-selection { background: ${color} !important; }
    `;
  }

  private updateTime(): void {
    this.time.set(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: this.format12h() }));
  }

  private updateHeight(): void {
    const el = document.querySelector<HTMLElement>('#flight-list');
    if (el && el.clientHeight !== this.listHeight()) {
      this.listHeight.set(el.clientHeight);
    }
  }
}
