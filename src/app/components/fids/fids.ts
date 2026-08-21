import { Component, DestroyRef, afterNextRender, computed, inject, input, signal } from '@angular/core';
import { Schedule } from '../../interfaces/schedule';
import { ScheduleResponse } from '../../interfaces/schedule-response';
import { FlightViewModel } from '../../interfaces/flight-view-model';
import {app} from '../../config/openfids.config';

@Component({
  selector: 'app-fids',
  templateUrl: './fids.html',
  imports: [],
  styleUrl: './fids.scss'
})

export class Fids {
  readonly iata = input.required<string>();
  private readonly apiUrl = `${app.apiUrl}/schedules`;
  private readonly rowHeight = 60;
  readonly mode = signal<'departures' | 'arrivals'>(this.getStorageItem('fids_mode', 'departures') as 'departures' | 'arrivals');
  readonly uploadedImage = signal<string | null>(this.getStorageItem('fids_icon', null));
  readonly isHoveringIcon = signal(false);
  private readonly use12HourFormat = signal<boolean>(this.getStorageItem('fids_time_format', 'false') === 'true');
  private readonly currentTime = signal('');
  readonly time = this.currentTime.asReadonly();
  readonly themeColor = signal<string>(this.getStorageItem('fids_theme_color', '#fdd511') as string);
  private readonly listHeight = signal(0);
  private readonly loading = signal(false);
  private readonly data = signal<Schedule[]>([]);

  readonly schedules = computed<FlightViewModel[]>(() => {
    const count = Math.floor(this.listHeight() / this.rowHeight);
    const currentMode = this.mode();
    const isDep = currentMode === 'departures';

    return this.data().slice(0, count).map(flight => {
      const node = isDep ? flight.departure : flight.arrival;
      const rawTime = node?.revisedTime?.local ?? node?.scheduledTime?.local;
      const formattedTime = rawTime ? rawTime.slice(11, 16) : '--:--';
      const status = flight.status ?? 'Scheduled';
      const statusLower = status.toLowerCase();

      return {
        number: flight.number ?? '--',
        rawTime,
        formattedTime,
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

  private readonly destroyRef = inject(DestroyRef);
  private abortController: AbortController | null = null;
  private loadedIata: string | null = null;

  constructor() {
    const resizeHandler = () => this.updateListHeight();
    const timeInterval = setInterval(() => this.updateTime(), 60000);
    window.addEventListener('resize', resizeHandler);

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('resize', resizeHandler);
      clearInterval(timeInterval);
      this.abortController?.abort();
    });

    afterNextRender(() => {
      this.updateListHeight();
      this.updateTime();
      this.loadSchedulesIfNeeded(this.iata());
      this.applyDynamicColor(this.themeColor());
    });
  }

  toggleMode(): void {
    const newMode = this.mode() === 'departures' ? 'arrivals' : 'departures';
    this.mode.set(newMode);
    this.setStorageItem('fids_mode', newMode);
    this.loadedIata = null;
    this.loadSchedulesIfNeeded(this.iata());
  }

  toggleTimeFormat(): void {
    const newFormat = !this.use12HourFormat();
    this.use12HourFormat.set(newFormat);
    this.setStorageItem('fids_time_format', String(newFormat));
    this.updateTime();
  }

  handleIconClick(fileInput: HTMLInputElement): void {
    if (this.uploadedImage()) {this.uploadedImage.set(null); this.removeStorageItem('fids_icon');}
    else fileInput.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.uploadedImage.set(result);
        this.setStorageItem('fids_icon', result);
      };
      reader.readAsDataURL(file);
    }

    input.value = '';
  }

  handleTitleBarClick(colorInput: HTMLInputElement, event: Event): void {
    if (event.target !== event.currentTarget) colorInput.click();
  }

  onColorChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.themeColor.set(input.value);
    this.setStorageItem('fids_theme_color', input.value);
    this.applyDynamicColor(input.value);
  }

  private applyDynamicColor(color: string): void {
    const styleId = 'fids-dynamic-color';
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
    this.currentTime.set(new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', hour12: this.use12HourFormat()}));
  }

  private updateListHeight(): void {
    const element = document.querySelector<HTMLElement>('#flight-list');
    if (!element) return;
    const height = element.clientHeight;
    if (height !== this.listHeight()) this.listHeight.set(height);
  }

  private loadSchedulesIfNeeded(iata: string): void {
    if (iata !== this.loadedIata) {
      this.loadedIata = iata;
      void this.loadSchedules(iata);
    }
  }

  private async loadSchedules(iata: string): Promise<void> {
    this.abortController?.abort();
    const controller = new AbortController();
    this.abortController = controller;
    this.loading.set(true);

    try {
      const isDep = this.mode() === 'departures';
      const param = isDep ? 'dep_iata' : 'arr_iata';
      const url = `${this.apiUrl}?${param}=${encodeURIComponent(iata)}`;
      const response = await fetch(url, {signal: controller.signal});
      if (!response.ok) {this.data.set([]);return;}
      const result = await response.json() as ScheduleResponse;
      if (!controller.signal.aborted) this.data.set(isDep ? (result.departures ?? []) : (result.arrivals ?? []));
    } catch {
      if (!controller.signal.aborted) this.data.set([]);
    } finally {
      if (this.abortController === controller) this.loading.set(false);
    }
  }

  private getStorageItem(key: string, defaultValue: string | null): string | null {
    try {
      return localStorage.getItem(key) ?? defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setStorageItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {}
  }

  private removeStorageItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
}
