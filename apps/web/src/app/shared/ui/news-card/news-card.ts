import { Component, OnInit, input } from '@angular/core';
import { DatePipe, I18nPluralPipe, NgOptimizedImage, SlicePipe } from '@angular/common';
import type { FeedItem } from '../../../features/feed/feed.models';
import { RelativeTimePipe } from '../../pipes/relative-time.pipe';
import { SourceLabelPipe } from '../../pipes/source-label.pipe';

@Component({
  selector: 'app-news-card',
  imports: [
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
export class NewsCard implements OnInit {
  readonly item = input.required<FeedItem>();
  readonly priority = input(false);

  protected imagePriority = false;

  protected readonly pointsPlural = {
    '=1': '1 punkt',
    few: '# punkty',
    other: '# punktów',
  };
  protected readonly commentsPlural = {
    '=0': 'brak komentarzy',
    '=1': '1 komentarz',
    few: '# komentarze',
    other: '# komentarzy',
  };

  // NgOptimizedImage throws when priority changes after init, so read it only once
  ngOnInit(): void {
    this.imagePriority = this.priority();
  }
}
