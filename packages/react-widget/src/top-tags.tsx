import { memo, useEffect, useRef, useState, type Ref } from 'react';
import type { TagCount } from './news-stats';

const VISIBLE_TAGS = 8;

interface TagButtonProps {
  tag: string;
  count: number;
  active: boolean;
  onToggle: (tag: string) => void;
  ref?: Ref<HTMLButtonElement> | undefined;
}

const TagButton = memo(function TagButton({ tag, count, active, onToggle, ref }: TagButtonProps) {
  return (
    <button
      ref={ref}
      type="button"
      className="tags__button"
      aria-pressed={active}
      onClick={() => onToggle(tag)}
    >
      #{tag}
      <span className="visually-hidden">, wiadomości:</span>{' '}
      <span className="tags__count">{count}</span>
    </button>
  );
});

interface TopTagsProps {
  tags: TagCount[];
  activeTags: string[];
  onToggle: (tag: string) => void;
}

export const TopTags = memo(function TopTags({ tags, activeTags, onToggle }: TopTagsProps) {
  const [expanded, setExpanded] = useState(false);
  const firstRevealed = useRef<HTMLButtonElement>(null);

  // new tags appear before the "show all" button, so move focus to the first of them
  useEffect(() => {
    if (expanded) {
      firstRevealed.current?.focus();
    }
  }, [expanded]);

  const visible = expanded
    ? tags
    : tags.filter((item, index) => index < VISIBLE_TAGS || activeTags.includes(item.tag));
  const missing = activeTags
    .filter((tag) => !tags.some((item) => item.tag === tag))
    .map((tag) => ({ tag, count: 0 }));

  return (
    <section className="insights__block" aria-labelledby="insights-tags">
      <h3 id="insights-tags" className="insights__heading">
        Najpopularniejsze tagi
      </h3>
      {tags.length === 0 && missing.length === 0 ? (
        <p className="insights__muted">Brak tagów.</p>
      ) : (
        <ul id="insights-tag-list" className="tags">
          {[...visible, ...missing].map(({ tag, count }, index) => (
            <li key={tag}>
              <TagButton
                tag={tag}
                count={count}
                active={activeTags.includes(tag)}
                onToggle={onToggle}
                ref={expanded && index === VISIBLE_TAGS ? firstRevealed : undefined}
              />
            </li>
          ))}
        </ul>
      )}
      {tags.length > VISIBLE_TAGS && (
        <button
          type="button"
          className="insights__more"
          aria-expanded={expanded}
          aria-controls="insights-tag-list"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? 'Pokaż mniej' : `Pokaż wszystkie (${tags.length})`}
        </button>
      )}
    </section>
  );
});
