export const tickerStyles = `
  :host {
    display: block;
    color: var(--fa-color-text, #1a1a1a);
  }

  .ticker {
    display: flex;
    align-items: center;
    gap: var(--fa-space-3, 0.75rem);
    padding-inline: var(--fa-space-3, 0.75rem);
    overflow: hidden;
    background: var(--fa-color-surface, #f5f5f5);
    border: 1px solid var(--fa-color-border, #d6d6d6);
    border-radius: var(--fa-radius-md, 8px);
  }

  .ticker__label {
    flex: none;
    padding: var(--fa-space-1, 0.25rem) var(--fa-space-2, 0.5rem);
    font-size: var(--fa-font-size-sm, 0.875rem);
    font-weight: 700;
    color: var(--fa-color-accent-contrast, #ffffff);
    background: var(--fa-color-accent, #3d3d3d);
    border-radius: var(--fa-radius-sm, 4px);
  }

  .ticker__viewport {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .ticker__viewport--static {
    overflow-x: auto;
  }

  .ticker__track {
    display: flex;
    width: max-content;
    will-change: transform;
  }

  .ticker__viewport--static .ticker__track {
    will-change: auto;
  }

  .ticker__list {
    display: flex;
    gap: var(--fa-space-6, 1.5rem);
    min-width: 100%;
    padding: 0 var(--fa-space-6, 1.5rem) 0 0;
    margin: 0;
    list-style: none;
  }

  button {
    min-height: 2.75rem;
    padding: 0 var(--fa-space-2, 0.5rem);
    font: inherit;
    color: inherit;
    white-space: nowrap;
    cursor: pointer;
    background: none;
    border: 0;
    border-radius: var(--fa-radius-sm, 4px);
  }

  button:hover {
    text-decoration: underline;
  }

  button:focus-visible {
    outline: 2px solid transparent;
    box-shadow: var(--fa-focus-ring, 0 0 0 3px #000000);
  }

  .ticker__source {
    margin-inline-end: var(--fa-space-2, 0.5rem);
    font-size: var(--fa-font-size-sm, 0.875rem);
    font-weight: 600;
    color: var(--fa-color-text-muted, #5c5c5c);
  }

  .ticker__pause {
    flex: none;
    font-size: var(--fa-font-size-sm, 0.875rem);
    border: 1px solid var(--fa-color-border, #d6d6d6);
  }

  .ticker__pause[hidden] {
    display: none;
  }
`;
