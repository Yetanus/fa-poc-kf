import { Component, ElementRef, inject, input, output, viewChild } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
import { debounceTime, filter, merge } from 'rxjs';
import { NEWS_SOURCES } from '../../../core/api/news-sources';
import type { NewsSource } from '../../../graphql/generated/graphql';
import { SourceLabelPipe } from '../../../shared/pipes/source-label.pipe';
import type { FeedFilters } from '../feed.models';
import { normalizeTag, sameFilters } from '../feed-query-params';

function toSourcesValue(sources: readonly NewsSource[]): Record<NewsSource, boolean> {
  return {
    HACKER_NEWS: sources.includes('HACKER_NEWS'),
    SPACEFLIGHT: sources.includes('SPACEFLIGHT'),
    DEV_TO: sources.includes('DEV_TO'),
  };
}

function atLeastOneSource(
  group: AbstractControl<Record<NewsSource, boolean>>,
): ValidationErrors | null {
  return NEWS_SOURCES.some((source) => group.value[source]) ? null : { noSources: true };
}

@Component({
  selector: 'app-feed-filters-form',
  imports: [ReactiveFormsModule, SourceLabelPipe],
  templateUrl: './feed-filters-form.html',
  styleUrl: './feed-filters-form.scss',
})
export class FeedFiltersForm {
  readonly filters = input.required<FeedFilters>();
  readonly filtersChange = output<FeedFilters>();

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly tagInput = viewChild.required<ElementRef<HTMLInputElement>>('tagInput');
  private lastEmitted: FeedFilters | null = null;

  protected readonly sources = NEWS_SOURCES;
  protected readonly form = this.fb.group({
    search: '',
    sources: this.fb.group(toSourcesValue(NEWS_SOURCES), { validators: atLeastOneSource }),
  });
  protected readonly tagControl = this.fb.control('');

  constructor() {
    toObservable(this.filters)
      .pipe(
        filter((filters) => this.lastEmitted === null || !sameFilters(filters, this.lastEmitted)),
        takeUntilDestroyed(),
      )
      .subscribe((filters) => {
        this.form.setValue(
          { search: filters.search, sources: toSourcesValue(filters.sources) },
          { emitEvent: false },
        );
      });

    const { search, sources } = this.form.controls;
    merge(search.valueChanges.pipe(debounceTime(300)), sources.valueChanges)
      .pipe(
        filter(() => sources.valid),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.emit(this.filters().tags));
  }

  protected addTag(event?: Event): void {
    event?.preventDefault();
    const tag = normalizeTag(this.tagControl.value);
    if (!tag || this.form.invalid) {
      return;
    }
    this.tagControl.reset();
    const tags = this.filters().tags;
    if (!tags.includes(tag)) {
      this.emit([...tags, tag]);
    }
  }

  protected removeTag(tag: string): void {
    this.emit(this.filters().tags.filter((t) => t !== tag));
    this.tagInput().nativeElement.focus();
  }

  private emit(tags: readonly string[]): void {
    const { search, sources } = this.form.getRawValue();
    const filters: FeedFilters = {
      search: search.trim(),
      sources: NEWS_SOURCES.filter((source) => sources[source]),
      tags,
    };
    this.lastEmitted = filters;
    this.filtersChange.emit(filters);
  }
}
