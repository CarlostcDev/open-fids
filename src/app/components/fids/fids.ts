import {Component, DestroyRef, afterNextRender, effect, inject, input, signal} from '@angular/core';

interface Schedule {
  departure?: {
    scheduledTime?: {
      utc?: string;
      local?: string;
    };
    revisedTime?: {
      utc?: string;
      local?: string;
    };
    runwayTime?: {
      utc?: string;
      local?: string;
    };
    terminal?: string;
    checkInDesk?: string;
    gate?: string;
    runway?: string;
    quality?: string[];
  };
  arrival?: {
    airport?: {
      icao?: string;
      iata?: string;
      name?: string;
      countryCode?: string;
      timeZone?: string;
    };
    scheduledTime?: {
      utc?: string;
      local?: string;
    };
    revisedTime?: {
      utc?: string;
      local?: string;
    };
    terminal?: string;
    baggageBelt?: string;
    quality?: string[];
  };
  number?: string;
  callSign?: string;
  status?: string;
  codeshareStatus?: string;
  isCargo?: boolean;
  aircraft?: {
    reg?: string;
    modeS?: string;
    model?: string;
  };
  airline?: {
    name?: string;
    iata?: string;
    icao?: string;
  };
}

@Component({
  selector: 'app-fids',
  templateUrl: './fids.html',
  imports: [],
  styleUrl: './fids.scss'
})
export class Fids {
  readonly iata = input.required<string>();
  private readonly apiUrl = 'https://fids.carlostcdev.workers.dev/schedules';
  private readonly listHeight = signal(0);
  private readonly loading = signal(false);
  private readonly data = signal<Schedule[]>([]);
  readonly schedules = this.data.asReadonly();
  private readonly destroyRef = inject(DestroyRef);
  private abortController: AbortController | null = null;

  constructor() {
    const resizeHandler = () => this.updateListHeight();

    window.addEventListener('resize', resizeHandler);
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('resize', resizeHandler);
      this.abortController?.abort();
    });

    afterNextRender(() => this.updateListHeight());
    effect(() => {
      const iata = this.iata();
      const height = this.listHeight();
      if (height > 0) void this.loadSchedules(iata);
    });
  }

  private updateListHeight(): void {
    const element = document.querySelector<HTMLElement>('#flight-list');
    if (!element) return;
    const height = element.clientHeight;
    if (height === this.listHeight()) return;
    this.listHeight.set(height);
  }

  private async loadSchedules(iata: string): Promise<void> {
    this.abortController?.abort();
    const controller = new AbortController();
    this.abortController = controller;
    this.loading.set(true);

    try {
      const url = `${this.apiUrl}?dep_iata=${encodeURIComponent(iata)}`;
      const response = await fetch(url, {signal: controller.signal});
      if (!response.ok) {this.data.set([]);return;}
      const records = await response.json() as Schedule[];
      if (!controller.signal.aborted) this.data.set(records);
    } catch {
      if (!controller.signal.aborted) this.data.set([]);
    } finally {
      if (this.abortController === controller) this.loading.set(false);
    }
  }

  formatTime(flight: Schedule): string {
    const time = flight.departure?.revisedTime?.local ?? flight.departure?.scheduledTime?.local;
    return time ? time.slice(11, 16) : '--:--';
  }

  formatStatus(flight: Schedule): string {
    return flight.status ?? 'Scheduled';
  }
}
