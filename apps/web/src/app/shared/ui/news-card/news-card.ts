import { Component, ElementRef, OnInit, input, output, viewChild } from '@angular/core';
import { CdkMonitorFocus, FocusableOption } from '@angular/cdk/a11y';
import { DatePipe, I18nPluralPipe, NgOptimizedImage, SlicePipe } from '@angular/common';
import type { FeedItem } from '../../../features/feed/feed.models';
import { COMMENTS_PLURAL, POINTS_PLURAL } from '../../pipes/plurals';
import { RelativeTimePipe } from '../../pipes/relative-time.pipe';
import { SourceLabelPipe } from '../../pipes/source-label.pipe';

@Component({
  selector: 'app-news-card',
  imports: [
    CdkMonitorFocus,
    NgOptimizedImage,
    DatePipe,
    SlicePipe,
    I18nPluralPipe,
    RelativeTimePipe,
    SourceLabelPipe,
  ],
  templateUrl: './news-card.html',
  styleUrl: './news-card.scss',
})
export class NewsCard implements OnInit, FocusableOption {
  readonly item = input.required<FeedItem>();
  readonly priority = input(false);
  readonly tabbable = input(false);
  readonly position = input<number>();
  readonly setSize = input<number>();
  readonly preview = output<void>();

  private readonly article = viewChild.required<ElementRef<HTMLElement>>('article');

  protected imagePriority = false;

  protected readonly pointsPlural = POINTS_PLURAL;
  protected readonly commentsPlural = COMMENTS_PLURAL;

  // NgOptimizedImage throws when priority changes after init, so read it only once
  ngOnInit(): void {
    this.imagePriority = this.priority();
  }

  focus(): void {
    this.article().nativeElement.focus();
  }
}
