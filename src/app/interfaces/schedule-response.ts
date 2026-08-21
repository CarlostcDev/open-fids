import {Schedule} from './schedule';

export interface ScheduleResponse {
  departures?: Schedule[];
  arrivals?: Schedule[];
}
