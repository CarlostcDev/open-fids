import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fallback'
})

export class Fallback implements PipeTransform {
  transform(value: string | number | null | undefined, fallbackValue: string = '---'): string {
    return (value !== null && value !== undefined && value !== '') ? String(value) : fallbackValue;
  }
}
