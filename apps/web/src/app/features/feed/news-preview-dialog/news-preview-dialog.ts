import { Component, input, output } from '@angular/core';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SourceLabelPipe } from '../../../shared/pipes/source-label.pipe';
import { articleRoute } from '../../article/article-route';
import type { FeedItem } from '../feed.models';

@Component({
  selector: 'app-news-preview-dialog',
  imports: [CdkTrapFocus, RouterLink, DatePipe, SourceLabelPipe],
  templateUrl: './news-preview-dialog.html',
  styleUrl: './news-preview-dialog.scss',
  host: {
    '(document:keydown.escape)': 'closed.emit()',
    '(click)': 'closeOnBackdrop($event)',
  },
})
export class NewsPreviewDialog {
  readonly item = input.required<FeedItem>();
  readonly closed = output<void>();

  protected readonly articleRoute = articleRoute;

  protected closeOnBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closed.emit();
    }
  }
}
