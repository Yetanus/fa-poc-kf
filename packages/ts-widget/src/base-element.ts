export abstract class BaseElement<TProps extends object> extends HTMLElement {
  protected readonly root: ShadowRoot;
  protected props: TProps;
  private renderQueued = false;

  protected constructor(defaults: TProps) {
    super();
    this.root = this.attachShadow({ mode: 'open' });
    this.props = { ...defaults };
  }

  connectedCallback(): void {
    this.requestRender();
    this.onConnect();
  }

  disconnectedCallback(): void {
    this.onDisconnect();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue !== newValue) {
      this.setProps(this.attributeToProps(name, newValue));
    }
  }

  protected setProps(patch: Partial<TProps>): void {
    this.props = { ...this.props, ...patch };
    this.requestRender();
  }

  // many prop changes in one task end up as a single render
  protected requestRender(): void {
    if (this.renderQueued) {
      return;
    }
    this.renderQueued = true;
    queueMicrotask(() => {
      this.renderQueued = false;
      if (this.isConnected) {
        this.render();
      }
    });
  }

  // a property set before customElements.define() hides the class setter, so set it again
  protected upgradeProperty(name: keyof TProps & string): void {
    if (Object.prototype.hasOwnProperty.call(this, name)) {
      const value: unknown = Reflect.get(this, name);
      Reflect.deleteProperty(this, name);
      Reflect.set(this, name, value);
    }
  }

  protected onConnect(): void {}

  protected onDisconnect(): void {}

  protected abstract attributeToProps(name: string, value: string | null): Partial<TProps>;

  protected abstract render(): void;
}
