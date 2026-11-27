import { Pipe, PipeTransform } from '@angular/core';
import type { NewsSource } from '../../graphql/generated/graphql';

export const SOURCE_LABELS: Record<NewsSource, string> = {
  HACKER_NEWS: 'Hacker News',
  SPACEFLIGHT: 'Spaceflight News',
  DEV_TO: 'Dev.to',
};

@Pipe({ name: 'sourceLabel' })
export class SourceLabelPipe implements PipeTransform {
  transform(source: NewsSource): string {
    return SOURCE_LABELS[source];
  }
}
