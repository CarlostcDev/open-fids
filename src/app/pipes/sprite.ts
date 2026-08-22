import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sprite'
})

export class Sprite implements PipeTransform {
  transform(iconName: string): string {
    return `svgs/sprite.svg#${iconName}`;
  }
}
