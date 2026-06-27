import {
  Directive,
  ElementRef,
  inject,
  input,
  OnDestroy,
  Renderer2,
} from '@angular/core';

/**
 * Attribute directive: `<button bcTooltip="Archive">`.
 *
 * Demonstrates idiomatic directive fundamentals — host listeners, `Renderer2`
 * (not direct DOM access, so it stays SSR-safe), and deterministic cleanup in
 * `ngOnDestroy`.
 */
@Directive({
  selector: '[bcTooltip]',
  host: {
    '(mouseenter)': 'show()',
    '(mouseleave)': 'hide()',
    '(focus)': 'show()',
    '(blur)': 'hide()',
  },
})
export class Tooltip implements OnDestroy {
  readonly text = input.required<string>({ alias: 'bcTooltip' });

  private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private tip: HTMLElement | null = null;

  show(): void {
    if (this.tip || !this.text()) {
      return;
    }
    const host = this.hostEl.nativeElement;
    const rect = host.getBoundingClientRect();

    const tip = this.renderer.createElement('div') as HTMLElement;
    this.renderer.appendChild(tip, this.renderer.createText(this.text()));
    this.renderer.setAttribute(tip, 'role', 'tooltip');
    Object.assign(tip.style, {
      position: 'fixed',
      top: `${rect.bottom + 6}px`,
      left: `${rect.left}px`,
      padding: '4px 8px',
      borderRadius: 'var(--bc-radius-sm)',
      background: 'var(--bc-color-text)',
      color: 'var(--bc-color-surface)',
      fontSize: 'var(--bc-font-size-sm)',
      whiteSpace: 'nowrap',
      zIndex: '1000',
      pointerEvents: 'none',
    } satisfies Partial<CSSStyleDeclaration>);

    this.renderer.appendChild(this.hostEl.nativeElement.ownerDocument.body, tip);
    this.tip = tip;
  }

  hide(): void {
    if (this.tip) {
      this.renderer.removeChild(this.tip.parentNode, this.tip);
      this.tip = null;
    }
  }

  ngOnDestroy(): void {
    this.hide();
  }
}
