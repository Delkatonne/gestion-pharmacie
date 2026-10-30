import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'fcfa', standalone: true })
export class FcfaPipe implements PipeTransform {
  transform(v: number | null | undefined): string {
    return new Intl.NumberFormat('fr-FR').format(Math.round(v || 0)) + ' FCFA';
  }
}
