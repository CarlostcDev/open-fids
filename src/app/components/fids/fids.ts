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
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
  results: Schedule[];
}

@Component({
  selector: 'app-fids',
  templateUrl: './fids.html',
  styleUrl: './fids.scss'
})
export class Fids {
  readonly iata = input.required<string>();

  private readonly apiUrl = 'https://fids.carlostcdev.workers.dev/schedules';
  private readonly rowHeight = 30;
  private readonly listHeight = signal(0);
  private readonly page = signal(1);
  private readonly loading = signal(false);
  private readonly data = signal<ScheduleResponse>({
    page: 1,
    limit: 1,
    total: 0,
    has_more: false,
    results: []
  });

  readonly schedules = this.data.asReadonly();
  readonly isLoading = this.loading.asReadonly();
  readonly currentPage = this.page.asReadonly();

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    const resizeHandler = () => this.updateListHeight();
    const refreshInterval = setInterval(() => {
      void this.loadSchedules(this.iata(), this.page());
    }, 60000);

    window.addEventListener('resize', resizeHandler);

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('resize', resizeHandler);
      clearInterval(refreshInterval);
    });

    afterNextRender(() => this.updateListHeight());

    effect(() => {
      const iata = this.iata();
      this.page.set(1);

      if (this.listHeight() > 0) {
        void this.loadSchedules(iata, 1);
      }
    });
  }

  private updateListHeight(): void {
    const element = document.querySelector<HTMLElement>('#flight-list');

    if (!element) return;

    const height = element.clientHeight;

    if (height === this.listHeight()) return;

    this.listHeight.set(height);

    void this.loadSchedules(this.iata(), this.page());
  }

  nextPage(): void {
    if (!this.data().has_more || this.loading()) return;

    const page = this.page() + 1;

    this.page.set(page);
    void this.loadSchedules(this.iata(), page);
  }

  previousPage(): void {
    if (this.page() <= 1 || this.loading()) return;

    const page = this.page() - 1;

    this.page.set(page);
    void this.loadSchedules(this.iata(), page);
  }

  private getPageSize(): number {
    return Math.max(1, Math.floor(this.listHeight() / this.rowHeight));
  }

  private async loadSchedules(iata: string, page: number): Promise<void> {
    const limit = this.getPageSize();

    this.loading.set(true);

    try {
      const url = `${this.apiUrl}?dep_iata=${encodeURIComponent(iata)}&page=${page}&limit=${limit}`;
      const response = await fetch(url);

      if (!response.ok) {
        this.data.set({
          page,
          limit,
          total: 0,
          has_more: false,
          results: []
        });
        return;
      }

      const data = await response.json() as ScheduleResponse;

      data.results.sort((a, b) => {
        const aTime = a.dep_estimated ?? a.dep_time ?? '';
        const bTime = b.dep_estimated ?? b.dep_time ?? '';

        return aTime.localeCompare(bTime);
      });

      this.data.set(data);
    } catch {
      this.data.set({
        page,
        limit,
        total: 0,
        has_more: false,
        results: []
      });
    } finally {
      this.loading.set(false);
    }
  }

  formatTime(schedule: Schedule): string {
    const time = schedule.dep_estimated ?? schedule.dep_time;
    return time ? time.slice(11, 16) : '--:--';
  }

  formatDelay(minutes: number | null): string {
    if (!minutes || minutes <= 0) return '';

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) return `${remainingMinutes}m`;
    if (remainingMinutes === 0) return `${hours}h`;

    return `${hours}h ${remainingMinutes}m`;
  }

  formatStatus(schedule: Schedule): string {
    if ((schedule.dep_delayed ?? 0) > 0) {
      return `Delayed`;
    }

    if (schedule.status === 'active') return 'Boarding';

    return 'Scheduled';
  }
}
