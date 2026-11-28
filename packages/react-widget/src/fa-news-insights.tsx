import type { FaNewsInsightsElement, NewsItem } from '@fa/contracts';
import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import styles from './fa-news-insights.css?inline';
import { HostProps, type InsightsProps } from './host-props';
import { InsightsApp } from './insights-app';
import { isNewsItem, toTags } from './news-items';

const sheet = new CSSStyleSheet();
sheet.replaceSync(styles);

export class FaNewsInsights extends HTMLElement implements FaNewsInsightsElement {
  static observedAttributes = ['theme'];

  private readonly hostProps = new HostProps<InsightsProps>({
    items: [],
    activeTags: [],
    theme: 'light',
  });
  private readonly container = document.createElement('div');
  private root: Root | null = null;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.adoptedStyleSheets = [sheet];
    shadow.append(this.container);
  }

  get items(): NewsItem[] {
    return this.hostProps.get().items;
  }

  set items(value: unknown) {
    this.hostProps.set({ items: Array.isArray(value) ? value.filter(isNewsItem) : [] });
  }

  get activeTags(): string[] {
    return this.hostProps.get().activeTags;
  }

  set activeTags(value: unknown) {
    this.hostProps.set({ activeTags: toTags(value) });
  }

  get theme(): 'light' | 'dark' {
    return this.hostProps.get().theme;
  }

  set theme(value: 'light' | 'dark') {
    this.setAttribute('theme', value);
  }

  connectedCallback(): void {
    this.upgradeProperty('items');
    this.upgradeProperty('activeTags');
    this.upgradeProperty('theme');

    if (!this.root) {
      this.root = createRoot(this.container);
      this.root.render(
        <StrictMode>
          <InsightsApp host={this.hostProps} element={this} />
        </StrictMode>,
      );
    }
  }

  disconnectedCallback(): void {
    this.root?.unmount();
    this.root = null;
  }

  attributeChangedCallback(name: string, _oldValue: string | null, value: string | null): void {
    if (name === 'theme') {
      this.hostProps.set({ theme: value === 'dark' ? 'dark' : 'light' });
    }
  }

  // a property set before customElements.define() hides the class setter, so set it again
  private upgradeProperty(name: keyof InsightsProps): void {
    if (Object.prototype.hasOwnProperty.call(this, name)) {
      const value: unknown = Reflect.get(this, name);
      Reflect.deleteProperty(this, name);
      Reflect.set(this, name, value);
    }
  }
}

if (!customElements.get('fa-news-insights')) {
  customElements.define('fa-news-insights', FaNewsInsights);
}
