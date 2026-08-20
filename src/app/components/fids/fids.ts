import {Component, DestroyRef, afterNextRender, computed, inject, input, signal} from '@angular/core';

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

interface ScheduleResponse {
  departures: Schedule[];
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
  private readonly rowHeight = 60;
  private readonly listHeight = signal(0);
  private readonly loading = signal(false);
  private readonly data = signal<Schedule[]>([]);
  readonly schedules = computed(() => {
    const count = Math.max(0, Math.floor((this.listHeight() - 60) / this.rowHeight));
    return this.data().slice(0, count);
  });
  private readonly destroyRef = inject(DestroyRef);
  private abortController: AbortController | null = null;
  private loadedIata: string | null = null;

  constructor() {
    const resizeHandler = () => this.updateListHeight();

    window.addEventListener('resize', resizeHandler);
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('resize', resizeHandler);
      this.abortController?.abort();
    });

    afterNextRender(() => {
      this.updateListHeight();
      this.loadSchedulesIfNeeded(this.iata());
    });
  }

  private updateListHeight(): void {
    const element = document.querySelector<HTMLElement>('#flight-list');
    if (!element) return;
    const height = element.clientHeight;
    if (height === this.listHeight()) return;
    this.listHeight.set(height);
  }

  private loadSchedulesIfNeeded(iata: string): void {
    if (iata === this.loadedIata) return;
    this.loadedIata = iata;
    void this.loadSchedules(iata);
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
      const result = await response.json() as ScheduleResponse;
      if (!controller.signal.aborted) this.data.set(result.departures);
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
