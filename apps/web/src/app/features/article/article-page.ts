import { Component, effect, inject } from '@angular/core';
import { DatePipe, I18nPluralPipe, NgOptimizedImage } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, catchError, combineLatest, map, of, startWith, switchMap } from 'rxjs';
import { isNewsSource } from '../../core/api/news-sources';
import { pageTitle } from '../../core/layout/page-title.strategy';
import { COMMENTS_PLURAL, POINTS_PLURAL } from '../../shared/pipes/plurals';
import { SourceLabelPipe } from '../../shared/pipes/source-label.pipe';
import { ArticleApi, type ArticleItem } from './article-api';

type ArticleState =
  | { status: 'loading' }
  | { status: 'loaded'; item: ArticleItem }
  | { status: 'notFound' }
  | { status: 'error' };

@Component({
  selector: 'app-article-page',
  imports: [RouterLink, NgOptimizedImage, DatePipe, I18nPluralPipe, SourceLabelPipe],
  templateUrl: './article-page.html',
  styleUrl: './article-page.scss',
})
export class ArticlePage {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ArticleApi);
  private readonly title = inject(Title);
  private readonly retry$ = new Subject<void>();

  protected readonly state = toSignal(
    combineLatest([this.route.paramMap, this.retry$.pipe(startWith(undefined))]).pipe(
      switchMap(([params]) => {
        const source = params.get('source');
        const id = params.get('id');
        if (!isNewsSource(source) || !id) {
          return of<ArticleState>({ status: 'notFound' });
        }
        return this.api.loadItem(`${source}:${id}`).pipe(
          map((item): ArticleState => (item ? { status: 'loaded', item } : { status: 'notFound' })),
          catchError(() => of<ArticleState>({ status: 'error' })),
          startWith<ArticleState>({ status: 'loading' }),
        );
      }),
    ),
    { initialValue: { status: 'loading' } },
  );

  protected readonly pointsPlural = POINTS_PLURAL;
  protected readonly commentsPlural = COMMENTS_PLURAL;

  constructor() {
    effect(() => {
      const state = this.state();
      if (state.status === 'loaded') {
        this.title.setTitle(pageTitle(state.item.title));
      } else if (state.status === 'notFound') {
        this.title.setTitle(pageTitle('Nie znaleziono artykułu'));
      }
    });
  }

  protected discussionUrl(item: ArticleItem): string | null {
    return item.source === 'HACKER_NEWS'
      ? `https://news.ycombinator.com/item?id=${item.id.slice(item.id.indexOf(':') + 1)}`
      : null;
  }

  protected retry(): void {
    this.retry$.next();
  }
}
