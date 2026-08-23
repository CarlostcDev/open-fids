import { Component, DestroyRef, afterNextRender, computed, inject, input, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { ScheduleResponse } from '../../interfaces/schedule-response';
import { FlightViewModel, CodeshareViewModel } from '../../interfaces/flight-view-model';
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
    const queryParam = this.mode() === 'departures' ? 'dep_iata' : 'arr_iata';
    return { url: apiRequestUrl('schedules', { [queryParam]: this.iata() }) };
  });

  readonly scheduleData = httpResource<ScheduleResponse>(this.scheduleRequest);

  readonly flights = computed<FlightViewModel[]>(() => {
    const response = this.scheduleData.value();
    if (!response) return [];

    const isDeparture = this.mode() === 'departures';
    const rawData = isDeparture ? (response.departures ?? []) : (response.arrivals ?? []);
    const renderCount = Math.max(0, Math.floor(this.listHeight() / this.rowHeight));

    return rawData.slice(0, renderCount).map(flight => {
      const node = isDeparture ? flight.departure : flight.arrival;
      const rawTime = node?.revisedTime?.local ?? node?.scheduledTime?.local;
      const status = flight.status ?? 'Scheduled';
      const statusLower = status.toLowerCase();

      const codeshares: CodeshareViewModel[] = (flight.codeshares ?? []).map(cs => ({
        airlineLogo: `${app.urlAirlineLogo}/${cs.iata ?? ''}.svg`,
        airlineAlt: `Codeshare ${cs.iata ?? ''}`,
        number: cs.number ?? '--'
      }));

      return {
        number: flight.number ?? '--',
        rawTime,
        formattedTime: rawTime ? rawTime.slice(11, 16) : '--:--',
        airlineLogo: `${app.urlAirlineLogo}/${flight.airline?.iata ?? ''}.svg`,
        airlineAlt: `Airline logo ${flight.airline?.iata ?? ''}`,
        airportCode: isDeparture ? (flight.arrival?.airport?.iata ?? '---') : (flight.departure?.airport?.iata ?? '---'),
        airportName: isDeparture ? (flight.arrival?.airport?.name ?? '---') : (flight.departure?.airport?.name ?? '---'),
        status,
        isDelayed: statusLower === 'delayed',
        isScheduled: statusLower === 'expected' || statusLower === 'scheduled',
        isBoarding: statusLower === 'boarding',
        terminal: isDeparture ? (flight.departure?.terminal ?? '-') : (flight.arrival?.terminal ?? '-'),
        gate: flight.departure?.gate ?? '-',
        codeshares
      };
    });
  });

  constructor() {
    afterNextRender(() => {
      this.updateHeight();
      this.updateTime();
      this.applyColor(this.themeColor());

      const handleResize = () => this.updateHeight();
      const clockTimer = setInterval(() => this.updateTime(), 60000);

      window.addEventListener('resize', handleResize);

      this.destroyRef.onDestroy(() => {
        window.removeEventListener('resize', handleResize);
        clearInterval(clockTimer);
      });
    });
  }

  toggleMode(): void {
    const nextMode = this.mode() === 'departures' ? 'arrivals' : 'departures';
    this.mode.set(nextMode);
    this.storage.set('fids_mode', nextMode);
  }

  toggleTime(): void {
    const nextFormat = !this.format12h();
    this.format12h.set(nextFormat);
    this.storage.set('fids_time_format', String(nextFormat));
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
      const result = e.target?.result as string;
      this.customIcon.set(result);
      this.storage.set('fids_icon', result);
    };
    reader.readAsDataURL(file);
    target.value = '';
  }

  clickTitle(inputEl: HTMLInputElement, event: Event): void {
    if (event.target !== event.currentTarget) inputEl.click();
  }

  changeColor(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.themeColor.set(value);
    this.storage.set('fids_theme_color', value);
    this.applyColor(value);
  }

  private applyColor(color: string): void {
    const styleId = 'fids-color';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `
      :not(svg).color-selection { color: ${color} !important; fill: ${color} !important; }
      svg.color-selection { background: ${color} !important; }
    `;
  }

  private updateTime(): void {
    this.time.set(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: this.format12h() }));
  }

  private updateHeight(): void {
    const container = document.querySelector<HTMLElement>('#flight-list');
    if (container && container.clientHeight !== this.listHeight()) {
      this.listHeight.set(container.clientHeight);
    }
  }
}
