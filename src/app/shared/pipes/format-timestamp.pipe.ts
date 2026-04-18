import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatTimestamp',
  standalone: true,
})
export class FormatTimestampPipe implements PipeTransform {
  transform(value?: string | null): string {
    if (!value) {
      return '—';
    }

    return new Intl.DateTimeFormat('bg-BG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(value));
  }
}
