import { DestroyRef, Directive, ElementRef, inject, output } from '@angular/core';

@Directive({ selector: '[appInViewport]' })
export class InViewportDirective {
  readonly appInViewport = output<void>();

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.appInViewport.emit();
        }
      },
      { rootMargin: '0px 0px 600px 0px' },
    );

    observer.observe(element);
    inject(DestroyRef).onDestroy(() => observer.disconnect());
  }
}
