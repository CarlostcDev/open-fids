import {Component, DestroyRef, afterNextRender, effect, inject, input, signal} from '@angular/core';

interface Schedule {
  airline_iata: string | null;
  flight_iata: string | null;
  dep_iata: string | null;
  dep_terminal: string | null;
  dep_gate: string | null;
  dep_time: string | null;
  dep_estimated: string | null;
  arr_iata: string | null;
  status: string | null;
  delayed: number | null;
  dep_delayed: number | null;
}

interface ScheduleResponse {
  limit: number;
  total: number;
  results: Schedule[];
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
  private readonly data = signal<ScheduleResponse>({limit: 1, total: 0, results: []});
  readonly schedules = this.data.asReadonly();
  private readonly destroyRef = inject(DestroyRef);
  private abortController: AbortController | null = null;

  constructor() {
    const resizeHandler = () => this.updateListHeight();
    const refreshInterval = setInterval(() => {
      void this.loadSchedules(this.iata());
    }, 60000);

    window.addEventListener('resize', resizeHandler);
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('resize', resizeHandler);
      clearInterval(refreshInterval);
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

  private getPageSize(): number {
    return Math.max(1, Math.floor(this.listHeight() / this.rowHeight));
  }

  private async loadSchedules(iata: string): Promise<void> {
    const limit = this.getPageSize();
    if (limit < 1) return;
    this.abortController?.abort();
    const controller = new AbortController();
    this.abortController = controller;
    this.loading.set(true);

    try {
      const url = `${this.apiUrl}?dep_iata=${encodeURIComponent(iata)}&limit=${limit}`;
      const response = await fetch(url, {signal: controller.signal});
      if (!response.ok) {this.data.set({limit, total: 0, results: []});return;}
      const records = await response.json() as Schedule[];
      records.sort((a, b) => {
        const aTime = a.dep_estimated ?? a.dep_time ?? '';
        const bTime = b.dep_estimated ?? b.dep_time ?? '';
        return aTime < bTime ? -1 : aTime > bTime ? 1 : 0;
      });
      if (!controller.signal.aborted) this.data.set({limit, total: records.length, results: records.slice(0, limit)});
    } catch {
      if (!controller.signal.aborted) this.data.set({limit, total: 0, results: []});
    } finally {
      if (this.abortController === controller) this.loading.set(false);
    }
  }

  formatTime(schedule: Schedule): string {
    const time = schedule.dep_estimated ?? schedule.dep_time;
    return time ? time.slice(11, 16) : '--:--';
  }

  formatStatus(schedule: Schedule): string {
    if ((schedule.dep_delayed ?? 0) > 0) return `Delayed`;
    if (schedule.status === 'active') return 'Boarding';
    return 'Scheduled';
  }
}
