/**
 * {BLOCK_FUNC} Button Component
 *
 * A sticky button that appears when user scrolls down and smoothly scrolls
 * back to top when clicked. Positioned at bottom right with fade in/out
 * animation based on scroll position.
 */

import { trackNavigationScrollTop } from '../../scripts/analytics/data-layer.js';

export default class {BLOCK_FUNC} extends HTMLElement {
  constructor(authoredElement = null) {
    super();
    this.scrollThreshold = 300; // Show button after scrolling 300px
    this.isVisible = false;
    this.handleScroll = this.handleScroll.bind(this);
    this.scrollToTop = this.scrollToTop.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this); // Bind keydown handler
    this.throttledScroll = null; // Store reference for proper cleanup
    const buttonContent = authoredElement?.querySelector('p');
    if (buttonContent) {
      this.buttonLabel = buttonContent.textContent?.trim();
    }
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
    // Check initial scroll position
    this.handleScroll();
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  render() {
    this.innerHTML = `
      <span class="icon icon-arrow-upward">
        <img src="${window.hlx.codeBasePath}/icons/arrow-upward.svg" alt="arrow-upward" loading="lazy">
      </span>
      ${this.buttonLabel}
    `;
    this.className = '{BLOCK_CLASS}-button';
    this.setAttribute('role', 'button');
    this.setAttribute('tabindex', '0');
    this.setAttribute('aria-label', 'Back to top');
    this.setAttribute('title', 'Back to top');
  }

  setupEventListeners() {
    // Scroll listener with throttling for performance
    let ticking = false;
    this.throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', this.throttledScroll, { passive: true });
    this.addEventListener('click', this.scrollToTop);
    this.addEventListener('keydown', this.handleKeydown); // Use bound reference
  }

  removeEventListeners() {
    // Remove the same throttled function that was added
    if (this.throttledScroll) {
      window.removeEventListener('scroll', this.throttledScroll);
    }
    this.removeEventListener('click', this.scrollToTop);
    this.removeEventListener('keydown', this.handleKeydown); // Remove bound reference
  }

  handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const shouldShow = scrollTop > this.scrollThreshold;

    if (shouldShow && !this.isVisible) {
      this.show();
    } else if (!shouldShow && this.isVisible) {
      this.hide();
    }
  }

  handleKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.scrollToTop();
    }
  }

  show() {
    this.isVisible = true;
    this.classList.add('visible');
  }

  hide() {
    this.isVisible = false;
    this.classList.remove('visible');
  }

  scrollToTop() {
    // Capture current scroll position before hiding
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    // Get button text for tracking
    const buttonText = this.buttonLabel || this.getAttribute('aria-label') || 'Back to top';

    // Track the scroll to top event with current scroll position
    trackNavigationScrollTop(scrollPosition, buttonText);

    // Hide button immediately for better UX
    this.hide();

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
}

// Define the custom element
customElements.define('{BLOCK_NAME}', {BLOCK_FUNC});
