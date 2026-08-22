import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'assetPath'
})

export class AssetPath implements PipeTransform {
  transform(fileName: string, folder: string, extension: string = 'webp'): string {
    if (!fileName) return '';
    return `${folder}/${fileName}.${extension}`;
  }
}
