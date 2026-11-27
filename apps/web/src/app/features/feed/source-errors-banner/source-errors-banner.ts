import { Component, input, output } from '@angular/core';
import type { SourceError } from '../../../core/api/graphql-client';
import { SourceLabelPipe } from '../../../shared/pipes/source-label.pipe';

@Component({
  selector: 'app-source-errors-banner',
  imports: [SourceLabelPipe],
  templateUrl: './source-errors-banner.html',
  styleUrl: './source-errors-banner.scss',
})
export class SourceErrorsBanner {
  readonly errors = input.required<SourceError[]>();
  readonly retry = output();
}
