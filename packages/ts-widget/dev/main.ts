import { BaseElement } from '../src';

interface CounterProps {
  label: string;
  count: number;
}

const logElement = document.querySelector<HTMLPreElement>('#log');

function log(message: string): void {
  if (logElement) {
    logElement.textContent += `${message}\n`;
  }
}

class DemoCounter extends BaseElement<CounterProps> {
  static observedAttributes = ['label'];

  private readonly button = document.createElement('button');
  private renders = 0;

  constructor() {
    super({ label: 'Licznik', count: 0 });
    this.button.type = 'button';
    this.button.addEventListener('click', () => {
      this.count += 1;
    });
    this.root.append(this.button);
  }

  get count(): number {
    return this.props.count;
  }

  set count(value: number) {
    this.setProps({ count: value });
  }

  protected override onConnect(): void {
    this.upgradeProperty('count');
    log('connected');
  }

  protected override onDisconnect(): void {
    log('disconnected');
  }

  protected attributeToProps(name: string, value: string | null): Partial<CounterProps> {
    return name === 'label' ? { label: value ?? '' } : {};
  }

  protected render(): void {
    this.renders += 1;
    this.button.textContent = `${this.props.label}: ${this.props.count}`;
    log(`render #${this.renders} (label="${this.props.label}", count=${this.props.count})`);
  }
}

// set before define, upgradeProperty should pick it up
const early = document.querySelector('#early');
if (early) {
  Object.assign(early, { count: 5 });
}

customElements.define('fa-demo-counter', DemoCounter);

const first = document.querySelector('#first');

document.querySelector('#batch')?.addEventListener('click', () => {
  if (first instanceof DemoCounter) {
    log('-- 3 changes in one task --');
    first.count += 1;
    first.count += 1;
    first.setAttribute('label', `Kliknięcia ${first.count}`);
  }
});

document.querySelector('#toggle')?.addEventListener('click', () => {
  if (!first) {
    return;
  }
  if (first.isConnected) {
    first.remove();
  } else {
    document.querySelector('#slot')?.append(first);
  }
});
