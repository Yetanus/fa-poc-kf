import type { FaNewsTickerElement, TickerItem, TickerSelectDetail } from '@fa/contracts';
import { BaseElement } from './base-element';
import { tickerStyles } from './fa-news-ticker.styles';
import { throttle } from './throttle';
import { SOURCE_LABELS, isTickerItem } from './ticker-items';

interface TickerProps {
  items: TickerItem[];
  speed: number;
  paused: boolean;
}

const DEFAULT_SPEED = 40;

const sheet = new CSSStyleSheet();
sheet.replaceSync(tickerStyles);

export class FaNewsTicker extends BaseElement<TickerProps> implements FaNewsTickerElement {
  static observedAttributes = ['speed', 'paused'];

  private readonly motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  private readonly pauseButton = document.createElement('button');
  private readonly viewport = document.createElement('div');
  private readonly track = document.createElement('div');
  private readonly list = document.createElement('ul');
  private readonly clone = document.createElement('ul');

  private renderedItems: TickerItem[] | null = null;
  private animated = false;
  private needsMeasure = false;
  private listWidth = 0;
  private offset = 0;
  private hovered = false;
  private focused = false;

  constructor() {
    super({ items: [], speed: DEFAULT_SPEED, paused: false });
    this.root.adoptedStyleSheets = [sheet];

    const container = document.createElement('section');
    container.className = 'ticker';
    container.part.add('container');
    container.setAttribute('aria-labelledby', 'ticker-label');

    const label = document.createElement('span');
    label.id = 'ticker-label';
    label.className = 'ticker__label';
    label.textContent = 'Najnowsze';

    this.viewport.className = 'ticker__viewport';
    this.track.className = 'ticker__track';
    this.list.className = 'ticker__list';
    this.list.part.add('list');
    this.clone.className = 'ticker__list';
    this.clone.setAttribute('aria-hidden', 'true');
    this.clone.inert = true;
    this.track.append(this.list, this.clone);
    this.viewport.append(this.track);

    this.pauseButton.type = 'button';
    this.pauseButton.className = 'ticker__pause';
    this.pauseButton.addEventListener('click', () => {
      this.paused = !this.paused;
    });

    container.append(label, this.viewport, this.pauseButton);
    this.root.append(container);

    this.root.addEventListener('click', (event) => this.onItemClick(event));
    this.addEventListener('pointerenter', () => (this.hovered = true));
    this.addEventListener('pointerleave', () => (this.hovered = false));
    this.addEventListener('focusin', () => (this.focused = true));
    this.addEventListener('focusout', (event) => this.onFocusOut(event));
  }

  get items(): TickerItem[] {
    return this.props.items;
  }

  set items(value: unknown) {
    this.setProps({ items: Array.isArray(value) ? value.filter(isTickerItem) : [] });
  }

  get speed(): number {
    return this.props.speed;
  }

  set speed(value: number) {
    this.setAttribute('speed', String(value));
  }

  get paused(): boolean {
    return this.props.paused;
  }

  set paused(value: boolean) {
    this.toggleAttribute('paused', value);
  }

  protected override onConnect(): void {
    this.upgradeProperty('items');
    this.upgradeProperty('speed');
    this.upgradeProperty('paused');

    window.addEventListener('resize', this.onResize);
    this.motionQuery.addEventListener('change', this.onMotionChange);
    this.startLoop();
  }

  protected override onDisconnect(): void {
    this.hovered = false;
    this.focused = false;
  }

  protected attributeToProps(name: string, value: string | null): Partial<TickerProps> {
    if (name === 'speed') {
      const speed = Number(value);
      return { speed: Number.isFinite(speed) && speed > 0 ? speed : DEFAULT_SPEED };
    }
    if (name === 'paused') {
      return { paused: value !== null };
    }
    return {};
  }

  protected render(): void {
    const { items, paused } = this.props;
    const animated = items.length > 0 && !this.motionQuery.matches;

    if (items !== this.renderedItems || animated !== this.animated) {
      this.list.replaceChildren(...items.map((item) => this.createItem(item)));
      this.clone.replaceChildren(...(animated ? items.map((item) => this.createItem(item)) : []));
      this.renderedItems = items;
      this.offset = 0;
      this.track.style.transform = '';
      this.needsMeasure = true;
    }

    this.animated = animated;
    this.viewport.classList.toggle('ticker__viewport--static', !animated);
    this.pauseButton.hidden = !animated;
    this.pauseButton.textContent = paused ? 'Wznów' : 'Wstrzymaj';
  }

  private createItem(item: TickerItem): HTMLLIElement {
    const li = document.createElement('li');
    li.part.add('item');

    const button = document.createElement('button');
    button.type = 'button';
    button.dataset['id'] = item.id;

    const source = document.createElement('span');
    source.className = 'ticker__source';
    source.textContent = SOURCE_LABELS[item.source];

    button.append(source, item.title);
    li.append(button);
    return li;
  }

  // only writes transform, width is read once per render / resize, so no layout thrashing
  private startLoop(): void {
    let last: number | null = null;

    const tick = (time: number): void => {
      if (this.needsMeasure) {
        this.listWidth = this.list.getBoundingClientRect().width;
        this.needsMeasure = false;
      }

      const running =
        this.animated && !this.props.paused && !this.hovered && !this.focused && this.listWidth > 0;
      if (running && last !== null) {
        this.offset = (this.offset + (this.props.speed * (time - last)) / 1000) % this.listWidth;
        this.track.style.transform = `translateX(${-this.offset}px)`;
      }

      last = time;
      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  private readonly onResize = throttle(() => {
    this.needsMeasure = true;
  }, 200);

  private readonly onMotionChange = (): void => {
    this.requestRender();
  };

  private onItemClick(event: Event): void {
    const target = event.target instanceof Element ? event.target.closest('button') : null;
    const id = target?.dataset['id'];
    if (id) {
      this.dispatchEvent(
        new CustomEvent<TickerSelectDetail>('fa-ticker-select', {
          detail: { id },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  private onFocusOut(event: FocusEvent): void {
    if (event.relatedTarget instanceof Node && this.contains(event.relatedTarget)) {
      return;
    }
    this.focused = false;
    // focusing an item scrolls the viewport, move that scroll into the transform
    if (this.listWidth > 0) {
      this.offset = (this.offset + this.viewport.scrollLeft) % this.listWidth;
      this.viewport.scrollLeft = 0;
      this.track.style.transform = `translateX(${-this.offset}px)`;
    }
  }
}

if (!customElements.get('fa-news-ticker')) {
  customElements.define('fa-news-ticker', FaNewsTicker);
}
