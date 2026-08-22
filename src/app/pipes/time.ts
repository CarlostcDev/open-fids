import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'time'
})

export class Time implements PipeTransform {
  transform(rawTime: string | undefined | null, use12HourFormat: boolean = false): string {
    if (!rawTime) return '--:--';
    const match = rawTime.match(/(\d{2}):(\d{2})/);
    if (!match) return '--:--';
    const hours = Number(match[1]);
    const minutes = match[2];
    if (hours < 0 || hours > 23) return '--:--';
    if (!use12HourFormat) return `${match[1]}:${minutes}`;
    const hour = hours % 12 || 12;
    const period = hours >= 12 ? 'PM' : 'AM';
    return `${hour}:${minutes} ${period}`;
  }
}
