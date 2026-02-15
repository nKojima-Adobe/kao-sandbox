/**
 * Carousel Block
 * Modular carousel implementation with well-separated functions
 * Supports carousel-item as child components
 */

import { decorateIcons, readBlockConfig } from '../../scripts/aem.js';
import loadBrightcoveEmbed from '../video/video-loader.js';
import { generateScriptUrl, configureVideoElement } from '../video/video-brightcove-utils.js';
import { extractVideoJsElement, normalizeText } from '../video/video-utils.js';
import { fetchPageMetadata } from '../cards/card-utils.js';
import fetchPlaceholdersForLocale from '../../scripts/placeholders.js';
import { trackElementInteraction, sanitizeUrlForAnalytics } from '../../scripts/analytics/data-layer.js';
import {
  CAROUSEL_LINKED_PAGE_ARIA_LABEL,
  CAROUSEL_GO_TO_ARIA_LABEL,
  CAROUSEL_SLIDE_ARIA_LABEL,
  CAROUSEL_SLIDE_ROLE,
  CAROUSEL_PREVIOUS_SLIDE_ARIA_LABEL,
  CAROUSEL_NEXT_SLIDE_ARIA_LABEL,
  CAROUSEL_GO_TO_SLIDE_ARIA_LABEL,
  CAROUSEL_ARIA_LABEL,
  CAROUSEL_ROLE,
} from '../../constants/placeholders-constants.js';
import {
  decodeCmsText,
  processContentWithIconsAndLink,
  sanitizeText,
  normalizeAltText,
} from '../../utils/generic-utils.js';
import {
  initCarouselVideoControls,
  isValidCarouselUrl,
  decodeHtmlEntities,
  createElement,
  createLiveRegion,
  announceSlideChange,
} from './carousel-utils.js';
import {
  AUTOPLAY_INTERVAL,
  MEDIA_EXTENSIONS_REGEX,
  LAYOUT_VARIATIONS,
  CONFIG_KEYS,
  MEDIA_PRIORITY_SELECTORS,
  META_KEY_MAX_LENGTH,
  SWIPE_THRESHOLD,
  MOBILE_BREAKPOINT,
  CTA_ANIMATION_DURATION,
  VIEWPORT_TRIGGER_RATIO,
  generateCarouselUID,
} from './carousel-constants.js';

// Collapse threshold: only collapse when very close to top (stricter than expand trigger)
const COLLAPSE_THRESHOLD = 50;

/* ============================================================================
 * GLOBAL INITIALIZATION QUEUE
 * Prevents race conditions when multiple carousels initialize simultaneously
 * ========================================================================== */

// Track carousels that are currently initializing videos
const carouselInitQueue = {
  pending: [],
  processing: false,

  add(fn) {
    return new Promise((resolve) => {
      this.pending.push({ fn, resolve });
      this.process();
    });
  },

  process() {
    if (this.processing || this.pending.length === 0) return;

    this.processing = true;
    const item = this.pending.shift();
    if (!item) {
      this.processing = false;
      return;
    }

    const { fn, resolve } = item;

    // Execute function and handle promise if it returns one
    const result = fn();
    const promiseResult = result && typeof result.then === 'function' ? result : Promise.resolve();

    promiseResult.then(() => {
      resolve();
      // Use requestAnimationFrame for delay between initializations
      let frameCount = 0;
      const maxFrames = 5;
      const waitForNext = () => {
        requestAnimationFrame(() => {
          frameCount += 1;
          if (frameCount < maxFrames) {
            waitForNext();
          } else {
            this.processing = false;
            this.process();
          }
        });
      };
      waitForNext();
    }).catch(() => {
      resolve();
      let frameCount = 0;
      const maxFrames = 5;
      const waitForNext = () => {
        requestAnimationFrame(() => {
          frameCount += 1;
          if (frameCount < maxFrames) {
            waitForNext();
          } else {
            this.processing = false;
            this.process();
          }
        });
      };
      waitForNext();
    });
  },
};

/* ============================================================================
 * CONFIGURATION FUNCTIONS
 * ========================================================================== */

/**
 * Parse carousel configuration from block
 * @param {HTMLElement} block - The carousel block element
 * @returns {Object} Parsed configuration object with layout and content rows
 */
async function parseCarouselConfig(block) {
  const allRows = [...block.children];
  const config = readBlockConfig(block);

  // Check first row for single-cell layout specification
  if (allRows.length > 0 && allRows[0].children.length === 1) {
    const firstCellText = (allRows[0].textContent || '').trim().toLowerCase();
    if (LAYOUT_VARIATIONS.includes(firstCellText)) {
      config.layout = firstCellText;
    }
  }

  // Filter out config and empty rows
  const rows = allRows.filter((row, index) => {
    if (!row || !row.children) return false;

    // Filter out config row
    if (index === 0 && row.children.length <= 2) {
      const text = (row.textContent || '').trim().toLowerCase();
      const isConfigRow = CONFIG_KEYS.some((key) => text.includes(key));
      if (isConfigRow) return false;
    }

    // Check for meaningful content
    const hasAnyContent = [...row.children].some((cell) => {
      const text = (cell.textContent || '').trim();
      const hasMedia = cell.querySelector('picture, img, video, video-js, iframe');
      const hasLink = cell.querySelector('a');
      return text !== '' || hasMedia || hasLink;
    });

    return hasAnyContent;
  });

  return { config, rows };
}

/**
 * Apply layout classes to block based on configuration
 * @param {HTMLElement} block - The carousel block element
 * @param {Object} config - Configuration object
 */
function applyLayoutClasses(block, config) {
  let layoutClass = null;

  if (config.layout) {
    layoutClass = `carousel-layout-${config.layout}`;
    block.classList.add(layoutClass);
  } else {
    let foundVariation = false;
    LAYOUT_VARIATIONS.forEach((variant) => {
      const camelVariant = variant.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      if (config[camelVariant] || config[variant]) {
        layoutClass = `carousel-layout-${variant}`;
        block.classList.add(layoutClass);
        foundVariation = true;
      }
    });

    if (!foundVariation) {
      layoutClass = 'carousel-layout-full-grid';
      block.classList.add(layoutClass);
    }
  }

  return layoutClass;
}

/* ============================================================================
 * SLIDE BUILDING FUNCTIONS
 * ========================================================================== */

/**
 * Parse field value from a row
 * @param {HTMLElement} fieldRow - The row element
 * @returns {string} Parsed field value
 */
function parseFieldValue(fieldRow) {
  if (!fieldRow || !fieldRow.children || fieldRow.children.length === 0) return '';
  const firstChild = fieldRow.children[0];
  const link = firstChild.querySelector('a');
  if (link) return link.href;
  return (firstChild.textContent || '').trim();
}

/**
 * Parse text field value from a row (extracts text content, not href).
 * Used for altText; preserves icon tokens from plain text or decorated DOM.
 * @param {HTMLElement} fieldRow - The row element
 * @returns {string} Parsed text value with CMS decoding and icon tokens preserved
 */
function parseTextFieldValue(fieldRow) {
  if (!fieldRow || !fieldRow.children || fieldRow.children.length === 0) return '';
  const firstChild = fieldRow.children[0];
  return normalizeAltText(firstChild);
}

/**
 * Parse text field with icon support (same as accordion, article-header, hero)
 * Returns processed content with :icon-name: tokenized and URL decoding applied
 * @param {HTMLElement} valueCell - The value cell element (e.g. row.children[1])
 * @returns {string} Processed content for innerHTML
 */
function parseProcessedTextField(valueCell) {
  if (!valueCell) return '';
  const html = (valueCell.innerHTML || valueCell.textContent || '').trim();
  if (!html) return '';
  return processContentWithIconsAndLink(html).content;
}

/**
 * Parse item metadata from row content
 * @param {HTMLElement} temp - Temporary container with row content
 * @returns {Object} Parsed metadata object
 */
function parseItemMetadata(temp) {
  let itemMeta = {};
  const childRows = [...temp.children];

  // Try two-column metadata format
  const metaRows = [];
  for (let i = 0; i < childRows.length; i += 1) {
    const r = childRows[i];
    if (!(r && r.children && r.children.length === 2)) break;
    const keyCandidate = (r.children[0].textContent || '').trim();
    if (!keyCandidate || keyCandidate.length > META_KEY_MAX_LENGTH) break;
    metaRows.push(r);
  }

  if (metaRows.length > 0) {
    const metaContainer = document.createElement('div');
    metaRows.forEach((m) => metaContainer.appendChild(m));
    try {
      itemMeta = readBlockConfig(metaContainer) || {};

      // For text fields: title, description, cta-text
      const iconTextFields = ['title', 'description', 'cta-text', 'cta-button-text'];
      iconTextFields.forEach((fieldName) => {
        const row = metaRows.find((r) => {
          const key = (r.children[0]?.textContent || '').trim().toLowerCase();
          return key === fieldName.toLowerCase() || key === fieldName.replace(/-/g, '').toLowerCase();
        });
        if (row && row.children[1]) {
          itemMeta[fieldName] = parseProcessedTextField(row.children[1]);
        }
      });
      // altText: preserve icon tokens (e.g. "/alt text :add:") from cell text or decorated DOM
      const plainTextFields = ['altText', 'alt-text'];
      plainTextFields.forEach((fieldName) => {
        const value = itemMeta[fieldName];
        const row = metaRows.find((r) => {
          const key = (r.children[0]?.textContent || '').trim().toLowerCase();
          return key === fieldName.toLowerCase() || key === fieldName.replace(/-/g, '').toLowerCase();
        });
        if (row && row.children[1]) {
          const cell = row.children[1];
          itemMeta[fieldName] = normalizeAltText(cell);
          return;
        }
        if (value && typeof value === 'string') {
          itemMeta[fieldName] = decodeCmsText(value);
        }
      });
    } catch (e) {
      itemMeta = {};
    }
  }

  // Try single-column format
  if (Object.keys(itemMeta).length === 0 && childRows.length >= 9) {
    const getValueCell = (row) => (row?.children?.[0] ?? row?.children?.[1]);
    itemMeta = {
      mediaType: parseFieldValue(childRows[0]),
      mediaImage: parseFieldValue(childRows[1]),
      mediaVideo: parseFieldValue(childRows[2]),
      altText: parseTextFieldValue(childRows[3]),
      link: parseFieldValue(childRows[4]),
      title: parseProcessedTextField(getValueCell(childRows[5])),
      description: parseProcessedTextField(getValueCell(childRows[6])),
      'cta-link': parseFieldValue(childRows[7]),
      'cta-text': parseProcessedTextField(getValueCell(childRows[8])),
    };

    Object.keys(itemMeta).forEach((key) => {
      if (!itemMeta[key]) delete itemMeta[key];
    });
  }

  return itemMeta;
}

/**
 * Extract link from row for metadata fetching
 * @param {HTMLElement} row - Content row element
 * @returns {string|null} Link URL or null
 */
function extractLinkFromRow(row) {
  if (!row || !row.children || row.children.length === 0) return null;

  const temp = document.createElement('div');
  [...row.children].forEach((child) => temp.appendChild(child.cloneNode(true)));

  const itemMeta = parseItemMetadata(temp);
  return (itemMeta.link || '').toString().trim() || null;
}

/**
 * Fetch metadata for a single link
 * @param {string} link - Link URL
 * @returns {Promise<Object|null>} Fetched metadata or null
 */
async function fetchMetadataForLink(link) {
  if (!link) return null;

  const isMediaUrl = MEDIA_EXTENSIONS_REGEX.test(link);
  if (isMediaUrl) return null;

  try {
    const metadata = await fetchPageMetadata(link);
    if (metadata && typeof metadata === 'object') {
      const title = (metadata.title || '').toString().trim();
      const description = (metadata.description || '').toString().trim();
      return {
        title: title ? decodeCmsText(title) : null,
        description: description ? decodeCmsText(description) : null,
      };
    }
  } catch (error) {
    // Continue - metadata fetching is non-critical
  }

  return null;
}

/**
 * Merge fetched metadata with item metadata
 * @param {Object} itemMeta - Existing item metadata
 * @param {Object|null} fetchedMetadata - Fetched metadata from page
 * @returns {Object} Enhanced metadata object
 */
function mergeMetadata(itemMeta, fetchedMetadata) {
  if (!fetchedMetadata) return itemMeta;

  // Only use fetched data if not explicitly authored
  // Also skip fallback values (e.g., "Article", "Article Content", "Content from: ...")
  if (!itemMeta.title && fetchedMetadata.title) {
    const fetchedTitle = fetchedMetadata.title.trim();
    // Skip common fallback values
    if (
      fetchedTitle
      && fetchedTitle !== 'Article'
      && !fetchedTitle.toLowerCase().includes('article content')
      && !fetchedTitle.startsWith('Content from:')
    ) {
      itemMeta.title = fetchedMetadata.title;
    }
  }
  if (!itemMeta.description && fetchedMetadata.description) {
    const fetchedDesc = fetchedMetadata.description.trim();
    // Skip fallback descriptions (empty or "Content from: ...")
    if (fetchedDesc && !fetchedDesc.startsWith('Content from:')) {
      itemMeta.description = fetchedMetadata.description;
    }
  }

  return itemMeta;
}

/**
 * Build media element for slide
 * @param {HTMLElement} temp - Temporary container with content
 * @param {Object} itemMeta - Item metadata
 * @param {HTMLElement} item - Carousel item element
 * @returns {HTMLElement|null} Media element or null
 */
function buildMediaElement(temp, itemMeta, item) {
  let media = null;

  // 1) Prefer authored media elements
  for (let i = 0; i < MEDIA_PRIORITY_SELECTORS.length; i += 1) {
    const found = temp.querySelector(MEDIA_PRIORITY_SELECTORS[i]);
    if (found) {
      media = found;
      // Remove from temp to prevent duplication in overlay
      found.remove();
      // Also remove associated script tags (Brightcove player loader)
      const allScripts = temp.querySelectorAll('script');
      allScripts.forEach((script) => {
        const src = script.getAttribute('src') || '';
        if (src.includes('brightcove') || src.includes('players.brightcove')) {
          script.remove();
        }
      });
      break;
    }
  }

  // 2) Check for rich embed code pasted as text
  if (!media) {
    const bc = extractVideoJsElement(temp);
    if (bc) media = bc;
  }

  if (!media) {
    const candidates = [...temp.querySelectorAll('div, p, pre, code, a')];
    const codeEl = candidates.find((el) => {
      const t = el.textContent || '';
      return /<\s*(video|video-js|iframe|script)[\s>]/i.test(t);
    });
    if (codeEl) {
      const decoder = document.createElement('textarea');
      decoder.innerHTML = codeEl.innerHTML || codeEl.textContent || '';
      const html = decoder.value || '';
      const mediaWrapper = document.createElement('div');
      mediaWrapper.innerHTML = html;
      codeEl.remove();
      // Also remove any script tags that might be siblings or nearby
      const allScripts = temp.querySelectorAll('script');
      allScripts.forEach((script) => {
        const src = script.getAttribute('src') || '';
        if (src.includes('brightcove') || src.includes('players.brightcove')) {
          script.remove();
        }
      });
      media = mediaWrapper.querySelector('video-js, video, iframe');
      if (media) {
        const bg = createElement('div', {
          className: 'carousel-media carousel-media-bg',
          parent: item,
        });
        bg.appendChild(media);
      }
    }
  }

  // 3) Check metadata for video embed
  if (!media && itemMeta.mediavideo) {
    const normalized = normalizeText(String(itemMeta.mediavideo));
    const parser = new DOMParser();
    const doc = parser.parseFromString(normalized, 'text/html');
    media = doc.querySelector('video-js, video, iframe');
    if (media) {
      const bg = createElement('div', {
        className: 'carousel-media carousel-media-bg',
        parent: item,
      });
      bg.appendChild(media);
    }
  }

  return media;
}

/**
 * Apply alt text to video iframes and elements for screen reader accessibility
 * @param {HTMLElement} media - Media element
 * @param {HTMLElement} wrapper - Media wrapper element
 * @returns {Object} Object with observer and cleanup function
 */
function applyVideoAltText(media, wrapper) {
  // Get alt text for video accessibility
  let altText = (media.getAttribute('data-alt-text')
    || (wrapper && wrapper.getAttribute('data-alt-text'))
    || '').toString().trim();
  altText = decodeCmsText(altText);

  // Apply alt text to iframes for screen reader accessibility
  const applyAltTextToIframe = () => {
    if (!altText) return;
    const iframe = media.querySelector('iframe');
    if (iframe) {
      // For iframes, title is the primary attribute screen readers use
      iframe.setAttribute('title', altText);
      iframe.setAttribute('aria-label', altText);
    }
    // Ensure video-js element has aria-label
    if (media && !media.getAttribute('aria-label')) {
      media.setAttribute('aria-label', altText);
    }
    // Ensure wrapper has proper accessibility attributes
    if (wrapper) {
      wrapper.setAttribute('aria-label', altText);
      wrapper.setAttribute('role', 'img');
      wrapper.setAttribute('tabindex', '0');
    }
  };

  // Apply immediately if iframe exists, then observe for iframe creation
  applyAltTextToIframe();
  const observer = new MutationObserver(() => {
    applyAltTextToIframe();
  });
  observer.observe(media, { childList: true, subtree: true });

  return {
    applyAltTextToIframe,
    observer,
  };
}

/**
 * Load Brightcove player for a slide
 * Extracted to support lazy loading
 * @param {HTMLElement} wrapper - Media wrapper element
 * @param {HTMLElement} media - Media element
 * @param {Object} placeholders - Placeholders for i18n
 */
function loadBrightcovePlayerForSlide(wrapper, media, placeholders) {
  try {
    if (!media || !(media instanceof HTMLElement)) {
      return;
    }
    // Ensure video has an ID before loading (required for Brightcove player access)
    if (media.tagName && media.tagName.toLowerCase() === 'video-js' && !media.getAttribute('id')) {
      const uniqueId = `carousel-video-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
      media.setAttribute('id', uniqueId);
    }

    // Check if Brightcove script is already loaded
    const account = media.getAttribute('data-account') || '';
    const playerId = media.getAttribute('data-player') || '';
    const embed = media.getAttribute('data-embed') || 'default';

    let scriptSrc = null;
    try {
      if (account && playerId) {
        scriptSrc = generateScriptUrl(account, playerId, embed);
      }
    } catch (e) {
      // Invalid script URL, will be handled by loadBrightcoveEmbed
      scriptSrc = null;
    }

    const escapeCSSSelector = (str) => str.replace(/["\\]/g, '\\$&');
    const existingScript = scriptSrc
      ? document.querySelector(`script[src="${escapeCSSSelector(scriptSrc)}"]`)
      : null;

    const isScriptAlreadyLoaded = existingScript
      ? existingScript.dataset.bcLoaded === 'true'
      : Boolean(window.videojs && typeof window.videojs === 'function');

    // Use queue system to serialize initialization when script is already loaded
    if (isScriptAlreadyLoaded) {
      carouselInitQueue.add(() => {
        const waitForBrightcoveReady = () => new Promise((resolve) => {
          const maxWait = 3000;
          const startTime = Date.now();
          let rafId = null;
          let isResolved = false;

          const cleanup = () => {
            if (rafId !== null) {
              cancelAnimationFrame(rafId);
              rafId = null;
            }
          };

          const checkBrightcove = () => {
            if (isResolved) {
              cleanup();
              return;
            }

            rafId = requestAnimationFrame(() => {
              rafId = null;

              if (Date.now() - startTime > maxWait) {
                isResolved = true;
                cleanup();
                resolve();
                return;
              }

              if (window.bc && window.videojs && typeof window.videojs === 'function') {
                // Check if other videos are still initializing
                const currentVideoId = media?.getAttribute('id');
                const allVideoJs = currentVideoId
                  ? document.querySelectorAll(`video-js:not([id="${currentVideoId.replace(/"/g, '\\"')}"])`)
                  : document.querySelectorAll('video-js');
                let allInitialized = true;

                Array.from(allVideoJs).some((vjs) => {
                  const hasIframe = vjs.querySelector('iframe');
                  const hasVjsTech = vjs.querySelector('.vjs-tech');
                  const hasBcPlayer = vjs.classList.contains('bc-player');

                  if (!hasIframe && !hasVjsTech && !hasBcPlayer) {
                    let inDomTime = 0;
                    if (vjs.dataset.domTime) {
                      inDomTime = Date.now() - parseInt(vjs.dataset.domTime, 10);
                    } else if (vjs.parentElement) {
                      inDomTime = 2000;
                    }

                    if (inDomTime < 1500) {
                      allInitialized = false;
                      return true;
                    }
                  }
                  return false;
                });

                if (allInitialized) {
                  // Wait a few more frames before proceeding
                  let waitFrames = 0;
                  const maxWaitFrames = 7;
                  const waitForCompletion = () => {
                    if (isResolved) {
                      cleanup();
                      return;
                    }
                    requestAnimationFrame(() => {
                      waitFrames += 1;
                      if (waitFrames < maxWaitFrames) {
                        waitForCompletion();
                      } else {
                        isResolved = true;
                        cleanup();
                        resolve();
                      }
                    });
                  };
                  waitForCompletion();
                } else {
                  checkBrightcove();
                }
              } else {
                checkBrightcove();
              }
            });
          };

          checkBrightcove();
        });

        const initializeSlide = () => new Promise((resolve) => {
          // Ensure element is in DOM
          if (!media.parentElement && wrapper) {
            wrapper.appendChild(media);
          }

          // Load Brightcove embed
          loadBrightcoveEmbed(wrapper, media);

          // Manually trigger Brightcove initialization
          const videoId = media?.getAttribute('id');
          if (videoId && window.bc && window.videojs && media) {
            const attemptInit = (retryCount = 0) => {
              const maxRetries = 5;
              let frameCount = 0;
              const framesToWait = retryCount === 0 ? 3 : 5;
              let rafId = null;

              const cleanup = () => {
                if (rafId !== null) {
                  cancelAnimationFrame(rafId);
                  rafId = null;
                }
              };

              const waitAndInit = () => {
                if (!media || !media.parentElement) {
                  cleanup();
                  return;
                }

                rafId = requestAnimationFrame(() => {
                  rafId = null;
                  frameCount += 1;
                  if (frameCount < framesToWait) {
                    waitAndInit();
                    return;
                  }

                  try {
                    let videoPlayer = null;
                    try {
                      if (window.videojs && typeof window.videojs.getPlayer === 'function') {
                        videoPlayer = window.videojs.getPlayer(videoId);
                      }
                    } catch (e) {
                      // Player not found
                    }

                    const hasIframe = media.querySelector('iframe');
                    const hasVjsTech = media.querySelector('.vjs-tech');
                    const hasBcPlayer = media.classList.contains('bc-player');
                    const isInitialized = videoPlayer || hasIframe || hasVjsTech || hasBcPlayer;

                    if (!isInitialized && retryCount < maxRetries) {
                      if (window.bc && typeof window.bc === 'function') {
                        try {
                          window.bc(media);
                        } catch (e) {
                          if (window.videojs && typeof window.videojs === 'function') {
                            try {
                              window.videojs(videoId);
                            } catch (e2) {
                              // Silent fail
                            }
                          }
                        }
                      } else if (window.videojs && typeof window.videojs === 'function') {
                        try {
                          window.videojs(videoId);
                        } catch (e) {
                          // Silent fail
                        }
                      }

                      if (retryCount < maxRetries - 1) {
                        attemptInit(retryCount + 1);
                      } else {
                        cleanup();
                      }
                    } else {
                      cleanup();
                    }
                  } catch (e) {
                    if (retryCount < maxRetries - 1) {
                      attemptInit(retryCount + 1);
                    } else {
                      cleanup();
                    }
                  }
                });
              };

              waitAndInit();
            };

            attemptInit();
          }

          // Apply alt text for video accessibility
          const { applyAltTextToIframe, observer } = applyVideoAltText(media, wrapper);

          // Initialize video controls and resolve once complete
          const finishInitialization = () => {
            // Final check for alt text after all initialization
            let checkCount = 0;
            const maxChecks = 10;
            const finalCheck = () => {
              applyAltTextToIframe();
              checkCount += 1;
              if (checkCount < maxChecks) {
                requestAnimationFrame(finalCheck);
              } else {
                observer.disconnect();
              }
            };
            requestAnimationFrame(finalCheck);
            resolve();
          };

          initCarouselVideoControls(wrapper, media, placeholders)
            .then((videoControlsCleanup) => {
              if (videoControlsCleanup && typeof videoControlsCleanup === 'function' && wrapper) {
                wrapper.videoControlsCleanup = videoControlsCleanup;
              }
              finishInitialization();
            })
            .catch(() => {
              // Silent failure - video controls are optional enhancement
              finishInitialization();
            });
        });

        return waitForBrightcoveReady()
          .catch(() => {})
          .then(() => initializeSlide());
      });
    } else {
      // Script not loaded yet, load immediately (first carousel)
      if (!media.parentElement && wrapper) {
        wrapper.appendChild(media);
      }

      // Apply alt text for video accessibility
      const { applyAltTextToIframe, observer } = applyVideoAltText(media, wrapper);

      loadBrightcoveEmbed(wrapper, media);
      initCarouselVideoControls(wrapper, media, placeholders)
        .then((videoControlsCleanup) => {
          if (videoControlsCleanup && typeof videoControlsCleanup === 'function' && wrapper) {
            wrapper.videoControlsCleanup = videoControlsCleanup;
          }
          // Final check for alt text after initialization
          let checkCount = 0;
          const maxChecks = 10;
          const finalCheck = () => {
            applyAltTextToIframe();
            checkCount += 1;
            if (checkCount < maxChecks) {
              requestAnimationFrame(finalCheck);
            } else {
              observer.disconnect();
            }
          };
          requestAnimationFrame(finalCheck);
        })
        .catch(() => {
          // Silent failure - video controls are optional enhancement
          observer.disconnect();
        });
    }
  } catch (e) {
    // Continue - the raw embed may still render
  }
}

/**
 * Configure media accessibility and behavior
 * @param {HTMLElement} media - Media element
 * @param {Object} itemMeta - Item metadata
 * @param {HTMLElement} item - Carousel item element
 * @param {Object} placeholders - Placeholders for i18n
 * @param {boolean} shouldLoadMedia - Whether to load media immediately (lazy loading optimization)
 */
function configureMedia(media, itemMeta, item, placeholders, shouldLoadMedia = false) {
  if (!media) return;

  let altText = (itemMeta.altText || itemMeta['alt-text'] || '').toString().trim();
  altText = decodeCmsText(altText);
  const mediaTag = media.tagName ? media.tagName.toLowerCase() : '';

  // Persist media description (video or image) on the slide so ARIA labels can always access it,
  // even if media attributes are applied asynchronously.
  if (altText) {
    if (mediaTag === 'video' || mediaTag === 'video-js' || mediaTag === 'iframe') {
      item.dataset.videoAriaLabel = altText;
    } else if (mediaTag === 'img' || mediaTag === 'picture') {
      item.dataset.imageAriaLabel = altText;
    }
  }

  // Set alt text
  if (altText) {
    if (mediaTag === 'img' || mediaTag === 'picture') {
      const imgElement = mediaTag === 'picture' ? media.querySelector('img') : media;
      if (imgElement) {
        imgElement.setAttribute('alt', altText);
        // Also set aria-label for consistency
        imgElement.setAttribute('aria-label', altText);
      }
    }
    if (mediaTag === 'video' || mediaTag === 'video-js' || mediaTag === 'iframe') {
      media.setAttribute('aria-label', altText);
      media.setAttribute('title', altText);
    }
  }

  // Move media into wrapper if needed
  if (!item.querySelector('.carousel-media')) {
    const mediaWrapper = createElement('div', {
      className: 'carousel-media',
      parent: item,
    });
    mediaWrapper.appendChild(media);
  }

  // Configure video behavior
  if (mediaTag === 'video') {
    const wrapper = media.closest('.carousel-media');
    if (wrapper && !wrapper.classList.contains('carousel-media-bg')) {
      wrapper.classList.add('carousel-media-bg');
    }
    const isAuthoringMode = document.documentElement.classList.contains('adobe-ue-edit');
    media.muted = true;
    media.autoplay = !isAuthoringMode;
    media.loop = true;
    media.playsInline = true;
    media.controls = false;
    // Make video wrapper accessible like an image
    if (altText && wrapper) {
      wrapper.setAttribute('aria-label', altText);
      wrapper.setAttribute('role', 'img');
      wrapper.setAttribute('tabindex', '0'); // Make focusable for screen readers
    }
  } else if (mediaTag === 'video-js') {
    const wrapper = media.closest('.carousel-media');
    if (wrapper && !wrapper.classList.contains('carousel-media-bg')) {
      wrapper.classList.add('carousel-media-bg');
    }
    const isAuthoringMode = document.documentElement.classList.contains('adobe-ue-edit');
    const videoConfig = {
      autoplay: !isAuthoringMode,
      mutable: true,
      caption: altText || undefined,
    };
    configureVideoElement(media, videoConfig);

    const dataSetup = media.getAttribute('data-setup');
    let parsedSetup = {};
    try {
      const parsed = dataSetup ? JSON.parse(dataSetup) : {};
      parsedSetup = (parsed && typeof parsed === 'object') ? parsed : {};
    } catch (e) {
      parsedSetup = {};
    }
    const desiredSetup = {
      autoplay: !isAuthoringMode,
      muted: true,
      playsinline: true,
      loop: true,
      controls: false,
    };
    const needsSetupUpdate = Object.entries(desiredSetup)
      .some(([key, value]) => parsedSetup[key] !== value);
    if (needsSetupUpdate) {
      const mergedSetup = { ...parsedSetup, ...desiredSetup };
      media.setAttribute('data-setup', JSON.stringify(mergedSetup));
    }

    if (!isAuthoringMode) {
      media.setAttribute('autoplay', 'autoplay');
    } else {
      media.removeAttribute('autoplay');
    }
    media.setAttribute('muted', 'muted');
    media.setAttribute('playsinline', 'playsinline');
    media.setAttribute('loop', 'loop');
    media.removeAttribute('controls');

    if (!media.getAttribute('id')) {
      const uniqueId = `carousel-video-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      media.setAttribute('id', uniqueId);
    }

    // Store alt text for video accessibility (screen readers)
    if (altText && wrapper) {
      wrapper.setAttribute('data-alt-text', altText);
      wrapper.setAttribute('aria-label', altText);
      wrapper.setAttribute('role', 'img');
      wrapper.setAttribute('tabindex', '0'); // Make focusable for screen readers
    }

    // Lazy loading optimization: Only load Brightcove player when needed
    if (shouldLoadMedia) {
      loadBrightcovePlayerForSlide(wrapper || item, media, placeholders);
    } else {
      // Mark as pending lazy load
      item.dataset.mediaLazyLoad = 'true';
      if (altText) {
        item.dataset.altText = altText;
      }
    }
  }
}

/**
 * Lazy load media for a carousel slide (if not already loaded)
 * Preloads Brightcove videos and other heavy media on demand
 * @param {HTMLElement} item - Carousel item element
 * @param {Object} placeholders - Placeholders for i18n
 */
function loadSlideMedia(item, placeholders) {
  if (!item || item.dataset.mediaLoaded === 'true') return;

  // Check if this slide has lazy-loadable media
  if (item.dataset.mediaLazyLoad === 'true') {
    const media = item.querySelector('video-js');
    if (media) {
      const wrapper = media.closest('.carousel-media, .carousel-media-bg');
      // Restore alt text if it was stored
      const { altText } = item.dataset;
      if (altText && wrapper) {
        media.setAttribute('data-alt-text', altText);
        wrapper.setAttribute('data-alt-text', altText);
        wrapper.setAttribute('aria-label', altText);
        wrapper.setAttribute('role', 'img');
        wrapper.setAttribute('tabindex', '0');
      }
      loadBrightcovePlayerForSlide(wrapper || item, media, placeholders);
      item.dataset.mediaLoaded = 'true';
      delete item.dataset.mediaLazyLoad;
      delete item.dataset.altText;
    }
  }
}

/**
 * Build overlay with title, description, and CTA
 * @param {HTMLElement} temp - Temporary container with content
 * @param {Object} itemMeta - Item metadata
 * @returns {HTMLElement} Overlay element
 */
function buildOverlay(temp, itemMeta) {
  const overlay = createElement('div', { className: 'carousel-overlay' });

  // Remove any remaining media elements
  temp.querySelectorAll('video-js, video, iframe').forEach((el) => {
    el.remove();
  });

  // Remove Brightcove script tags
  const allScripts = temp.querySelectorAll('script');
  allScripts.forEach((script) => {
    const src = script.getAttribute('src') || '';
    if (src.includes('brightcove') || src.includes('players.brightcove')) {
      script.remove();
    }
  });

  // Remove embed code elements (text that looks like code)
  const looksLikeCode = (txt) => (
    /<\s*(video|video-js|iframe|script)[\s>]/i.test(txt) || txt.includes('&lt;video-js')
  );
  [...temp.querySelectorAll('div, p, pre, code, span')].forEach((el) => {
    const t = (el.textContent || '').trim();
    if (t && looksLikeCode(t)) el.remove();
  });

  // Render title – supports icons (same as accordion, article-header), sanitized for XSS
  // Use richHTML so icon spans render
  const titleValue = (itemMeta.title || '').toString().trim();
  if (titleValue) {
    createElement('h3', {
      className: 'carousel-title',
      innerHTML: sanitizeText(titleValue, { richHTML: true }),
      parent: overlay,
    });
  }

  // Render description – supports icons, sanitized for XSS
  const descriptionValue = (itemMeta.description || '').toString().trim();
  if (descriptionValue) {
    createElement('p', {
      className: 'carousel-description',
      innerHTML: sanitizeText(descriptionValue, { richHTML: true }),
      parent: overlay,
    });
  }

  // CTA Button – supports icons, sanitized for XSS
  const ctaTextRaw = (itemMeta['cta-text'] || itemMeta['cta-button-text'] || '').toString().trim();
  const ctaLink = (itemMeta['cta-link'] || itemMeta['cta-button-link'] || '').toString().trim();

  if (ctaTextRaw && ctaLink && isValidCarouselUrl(ctaLink)) {
    const cta = createElement('a', {
      className: 'button carousel-cta',
      innerHTML: sanitizeText(ctaTextRaw, { richHTML: true }),
      attributes: {
        href: ctaLink,
        role: 'button',
        tabindex: '0',
      },
    });

    cta.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        cta.click();
      }
    });

    overlay.appendChild(cta);
  }

  return overlay;
}

/**
 * Add clickable overlay to slide if link exists
 * @param {HTMLElement} item - Carousel item element
 * @param {string} slideLink - Link URL
 * @param {Object} itemMeta - Item metadata
 * @param {Object} placeholders - Placeholders for i18n
 * @param {Object} [options] - Additional options for focus behavior
 * @param {boolean} [options.allowTabFocus=false] - Keep link in natural tab order when true
 */
function addClickableOverlay(item, slideLink, itemMeta, placeholders, options = {}) {
  if (!slideLink || !isValidCarouselUrl(slideLink)) return;

  const titleForLabel = itemMeta.title
    ? (itemMeta.title || '').toString().replace(/<[^>]*>/g, '').trim()
    : (placeholders[CAROUSEL_LINKED_PAGE_ARIA_LABEL] || 'linked page');
  const goToTemplate = placeholders[CAROUSEL_GO_TO_ARIA_LABEL] || 'Go to {0}';

  const { allowTabFocus = false } = options;

  const clickableOverlay = createElement('a', {
    className: 'carousel-slide-link',
    attributes: {
      href: slideLink,
      'aria-label': goToTemplate.replace('{0}', titleForLabel),
      tabindex: allowTabFocus ? '0' : '-1',
    },
  });

  item.appendChild(clickableOverlay);
}

/**
 * Check if a row contains video content
 * @param {HTMLElement} row - Content row element
 * @returns {boolean} True if row contains video content
 */
function rowHasVideoContent(row) {
  if (!row || !row.children) return false;

  // Check for video elements in the row
  const hasVideoElement = row.querySelector('video, video-js, iframe');
  if (hasVideoElement) return true;

  // Check for video embed code in text content
  const hasVideoCode = [...row.children].some((cell) => {
    const text = (cell.textContent || '').trim();
    return /<\s*(video|video-js|iframe|script)[\s>]/i.test(text) || text.includes('&lt;video-js');
  });

  if (hasVideoCode) return true;

  // Check metadata for video content
  const temp = document.createElement('div');
  [...row.children].forEach((child) => temp.appendChild(child.cloneNode(true)));
  const itemMeta = parseItemMetadata(temp);

  // Check if mediaType is explicitly set to video
  const mediaType = (itemMeta.mediaType || itemMeta.mediatype || '').toString().toLowerCase().trim();
  if (mediaType === 'video') return true;

  // Check if mediavideo field has content
  const mediaVideo = (itemMeta.mediavideo || itemMeta.mediaVideo || '').toString().trim();
  if (mediaVideo && mediaVideo.length > 0) return true;

  return false;
}

/**
 * Build a single carousel slide from a row with pre-fetched metadata
 * @param {HTMLElement} row - Content row element
 * @param {number} slideIndex - Index of this slide
 * @param {number} totalSlides - Total number of slides
 * @param {Object|null} fetchedMetadata - Pre-fetched page metadata
 * @param {Object} placeholders - Placeholders for i18n
 * @param {boolean} shouldLoadMedia - Whether to load media immediately (lazy loading optimization)
 * @param {string|null} layoutClass - Layout class for filtering
 * @returns {HTMLElement|null} Carousel item element or null
 */

/**
 * Get the accessible label for any media content (video or image) inside a slide
 * Prefers the media element's aria-label/alt, then the wrapper's aria-label/data-alt-text.
 * @param {HTMLElement} item - Carousel item element
 * @returns {string} Media label or empty string if none
 */
function getMediaLabelForSlide(item) {
  if (!item || !(item instanceof HTMLElement)) return '';

  // 0) Prefer explicit media label stored on the slide (video or image)
  const dataVideoLabel = (item.dataset.videoAriaLabel || '').trim();
  const dataImageLabel = (item.dataset.imageAriaLabel || '').trim();
  if (dataVideoLabel) {
    // Decode HTML entities in case they were stored encoded
    return decodeHtmlEntities(dataVideoLabel);
  }
  if (dataImageLabel) {
    // Decode HTML entities in case they were stored encoded
    return decodeHtmlEntities(dataImageLabel);
  }

  // Check for video content first
  const videoMedia = item.querySelector('video-js, video, iframe');
  if (videoMedia) {
    // 1) Prefer explicit aria-label on the video media element
    const videoAria = (videoMedia.getAttribute('aria-label') || '').trim();
    if (videoAria) {
      return videoAria;
    }

    // 2) Check wrapper for aria-label
    const videoWrapper = videoMedia.closest('.carousel-media, .carousel-media-bg') || item;
    const videoWrapperAria = (videoWrapper.getAttribute('aria-label') || '').trim();
    if (videoWrapperAria) {
      return videoWrapperAria;
    }

    // 3) Check wrapper for data-alt-text
    let videoAltData = (videoWrapper.getAttribute('data-alt-text') || '').trim();
    if (videoAltData) {
      videoAltData = decodeHtmlEntities(videoAltData);
    }
    if (videoAltData) {
      return videoAltData;
    }
  }

  // Check for image content
  const imageMedia = item.querySelector('img, picture img');
  if (imageMedia) {
    // 1) Prefer explicit alt text on the image element
    let imageAlt = (imageMedia.getAttribute('alt') || '').trim();
    if (imageAlt) {
      imageAlt = decodeHtmlEntities(imageAlt);
    }
    if (imageAlt) {
      return imageAlt;
    }

    // 2) Prefer explicit aria-label on the image element
    const imageAria = (imageMedia.getAttribute('aria-label') || '').trim();
    if (imageAria) {
      return imageAria;
    }

    // 3) Check wrapper for aria-label
    const imageWrapper = imageMedia.closest('.carousel-media, .carousel-media-bg') || item;
    const imageWrapperAria = (imageWrapper.getAttribute('aria-label') || '').trim();
    if (imageWrapperAria) {
      return imageWrapperAria;
    }
  }

  return '';
}

/**
 * Build the aria-label for a slide, optionally appending media information.
 * Example:
 * - "Slide 1 of 2"
 * - "Slide 1 of 2, Company introduction video"
 * - "Slide 1 of 2, Product showcase image"
 * @param {HTMLElement} item - Carousel item element
 * @param {number} slideIndex - Zero-based slide index
 * @param {number} totalSlides - Total number of slides
 * @param {Object} placeholders - Placeholders for i18n
 * @returns {string} Computed aria-label for the slide
 */
function buildSlideAriaLabel(item, slideIndex, totalSlides, placeholders) {
  const slideTemplate = placeholders[CAROUSEL_SLIDE_ARIA_LABEL] || 'Slide {0} of {1}';
  const baseLabel = slideTemplate
    .replace('{0}', slideIndex + 1)
    .replace('{1}', totalSlides);

  const mediaLabel = getMediaLabelForSlide(item);
  if (mediaLabel) {
    // Append media description (video or image) for richer SR output
    return `${baseLabel}, ${mediaLabel}`;
  }

  return baseLabel;
}

function buildSlideFromRow(
  row,
  slideIndex,
  totalSlides,
  fetchedMetadata,
  placeholders,
  shouldLoadMedia = false,
  layoutClass = null,
) {
  if (!row || !row.children || row.children.length === 0) return null;

  const rowHasContent = [...row.children].some((cell) => {
    const text = (cell.textContent || '').trim();
    const hasMedia = cell.querySelector('picture, img, video, video-js, iframe');
    const hasLink = cell.querySelector('a');
    return text !== '' || hasMedia || hasLink;
  });

  if (!rowHasContent) return null;

  // Filter out video content for image-only layouts
  const isImageOnlyLayout = layoutClass && (
    layoutClass.includes('image-only-medium')
    || layoutClass.includes('image-only-large')
  );

  if (isImageOnlyLayout && rowHasVideoContent(row)) {
    // Hide the row visually in authoring mode
    // Don't remove content - it may be needed if layout changes
    // The CSS will also handle hiding, but this ensures it's hidden immediately
    if (document.documentElement.classList.contains('adobe-ue-edit')) {
      row.style.display = 'none';
      // Add a data attribute to mark this row as filtered for image-only layouts
      row.setAttribute('data-carousel-filtered', 'video-content');
    }

    return null; // Skip this slide - it contains video content
  }

  const item = document.createElement('div');
  item.className = 'carousel-item';

  // In authoring mode, clone content to preserve original row structure for UE editing
  // This ensures images remain as children of their carousel-item rows in the UE
  // In publish mode, move content for better performance
  const isAuthoringMode = document.documentElement.classList.contains('adobe-ue-edit');
  const temp = document.createElement('div');
  if (isAuthoringMode) {
    // Clone all child nodes (including text nodes) for consistent behavior with publish mode
    [...row.childNodes].forEach((child) => {
      const clonedChild = child.cloneNode(true);
      // Remove data-aue-* attributes from cloned elements to prevent duplicate nodes in UE tree
      // Only the original elements should be tracked by Universal Editor
      if (clonedChild.nodeType === Node.ELEMENT_NODE) {
        // Select all elements with any data-aue-* attribute
        const aueSelector = '[data-aue-type], [data-aue-prop], [data-aue-label], [data-aue-model], [data-aue-resource], [data-aue-behavior], [data-aue-filter]';
        clonedChild.querySelectorAll(aueSelector).forEach((el) => {
          el.removeAttribute('data-aue-type');
          el.removeAttribute('data-aue-prop');
          el.removeAttribute('data-aue-label');
          el.removeAttribute('data-aue-model');
          el.removeAttribute('data-aue-resource');
          el.removeAttribute('data-aue-behavior');
          el.removeAttribute('data-aue-filter');
        });
        // Also remove from the cloned child itself if it has these attributes
        ['data-aue-type', 'data-aue-prop', 'data-aue-label', 'data-aue-model', 'data-aue-resource', 'data-aue-behavior', 'data-aue-filter'].forEach((attr) => {
          if (clonedChild.hasAttribute(attr)) clonedChild.removeAttribute(attr);
        });
      }
      temp.appendChild(clonedChild);
    });
  } else {
    // Move children for publish mode (more efficient)
    while (row.firstChild) temp.appendChild(row.firstChild);
  }

  let itemMeta = parseItemMetadata(temp);
  const linkForMetadata = (itemMeta.link || '').toString().trim();
  const slideLink = linkForMetadata || null;

  // Merge pre-fetched metadata
  itemMeta = mergeMetadata(itemMeta, fetchedMetadata);

  const media = buildMediaElement(temp, itemMeta, item);
  configureMedia(media, itemMeta, item, placeholders, shouldLoadMedia);

  const overlay = buildOverlay(temp, itemMeta);
  item.appendChild(overlay);

  const allowTabFocus = !!(layoutClass && (
    layoutClass.includes('image-only-medium') || layoutClass.includes('image-only-large')
  ));
  addClickableOverlay(item, slideLink, itemMeta, placeholders, { allowTabFocus });

  item.setAttribute('role', 'group');
  item.setAttribute('aria-roledescription', placeholders[CAROUSEL_SLIDE_ROLE] || 'slide');
  const ariaLabel = buildSlideAriaLabel(item, slideIndex, totalSlides, placeholders);
  item.setAttribute('aria-label', ariaLabel);

  // Store slide index for tracking
  item.dataset.slideIndex = slideIndex;
  item.dataset.totalSlides = totalSlides;

  return item;
}

/**
 * Build all carousel slides from rows with parallel metadata fetching
 * @param {Array} rows - Array of content row elements
 * @param {HTMLElement} track - Track element to append slides to
 * @param {Object} placeholders - Placeholders for i18n
 * @param {string|null} layoutClass - Layout class for filtering
 * @returns {Promise<Array>} Array of carousel item elements
 */
async function buildCarouselSlides(rows, track, placeholders, layoutClass = null) {
  // Step 1: Extract all links for metadata fetching (fast, synchronous)
  const links = rows.map((row) => extractLinkFromRow(row));

  // Step 2: Fetch all metadata in parallel (major performance improvement)
  const metadataPromises = links.map((link) => fetchMetadataForLink(link));
  const metadataResults = await Promise.allSettled(metadataPromises);

  // Step 3: Build slides with pre-fetched metadata (fast, synchronous)
  // Lazy loading optimization: Only load first slide media immediately
  // Exception: In Universal Editor, load all media immediately for better authoring UX
  const isAuthoringMode = document.documentElement.classList.contains('adobe-ue-edit');
  const items = [];
  let validSlideIndex = 0; // Track index of valid (non-filtered) slides

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    const metadataResult = metadataResults[rowIndex];
    const fetchedMetadata = metadataResult?.status === 'fulfilled' ? metadataResult.value : null;

    // Load media immediately for first slide OR all slides in UE mode
    const shouldLoadMedia = validSlideIndex === 0 || isAuthoringMode;
    const item = buildSlideFromRow(
      row,
      validSlideIndex,
      rows.length, // Will be updated later with actual count
      fetchedMetadata,
      placeholders,
      shouldLoadMedia,
      layoutClass,
    );

    if (item) {
      // Mark slide as loaded to skip lazy loading check
      // In UE mode, all slides are loaded; in published mode, only first slide
      if (shouldLoadMedia) {
        item.dataset.mediaLoaded = 'true';
      }
      track.appendChild(item);
      items.push(item);
      validSlideIndex += 1;
    }
  }

  // Update aria-labels with correct total count after filtering
  const totalValidSlides = items.length;
  items.forEach((item, index) => {
    const ariaLabel = buildSlideAriaLabel(item, index, totalValidSlides, placeholders);
    item.setAttribute('aria-label', ariaLabel);
  });

  return items;
}

/* ============================================================================
 * UI CREATION FUNCTIONS
 * ========================================================================== */

/**
 * Create the base carousel UI structure
 * @returns {Object} Object containing container, viewport, and track elements
 */
function createCarouselUI() {
  const container = createElement('div', { className: 'carousel-container' });
  const viewport = createElement('div', { className: 'carousel-viewport', parent: container });
  const track = createElement('div', { className: 'carousel-track', parent: viewport });

  return { container, viewport, track };
}

/**
 * Create navigation arrows
 * @param {HTMLElement} container - Container element
 * @param {Object} placeholders - Placeholders for i18n
 * @returns {Object} Object containing prev and next buttons
 */
function createNavigationArrows(container, placeholders) {
  const prev = createElement('button', {
    className: 'carousel-nav carousel-prev',
    innerHTML: '<span class="icon icon-arrow-backward"></span>',
    attributes: {
      'aria-label': placeholders[CAROUSEL_PREVIOUS_SLIDE_ARIA_LABEL] || 'Previous slide',
    },
    parent: container,
  });

  const next = createElement('button', {
    className: 'carousel-nav carousel-next',
    innerHTML: '<span class="icon icon-arrow-forward"></span>',
    attributes: {
      'aria-label': placeholders[CAROUSEL_NEXT_SLIDE_ARIA_LABEL] || 'Next slide',
    },
    parent: container,
  });

  try {
    decorateIcons(prev);
    decorateIcons(next);
  } catch (e) { /* no-op */ }

  return { prev, next };
}

/**
 * Create pagination dots
 * @param {Array} items - Array of carousel items
 * @param {HTMLElement} container - Container element
 * @param {Object} placeholders - Placeholders for i18n
 * @returns {Object} Object containing dots container and dot buttons
 */
function createPaginationDots(items, container, placeholders) {
  const dots = createElement('div', { className: 'carousel-dots' });

  const dotButtons = items.map((_, i) => {
    const goToSlideTemplate = placeholders[CAROUSEL_GO_TO_SLIDE_ARIA_LABEL] || 'Go to slide {0}';
    return createElement('button', {
      className: 'carousel-dot',
      attributes: {
        'aria-label': goToSlideTemplate.replace('{0}', i + 1),
        'data-index': String(i),
      },
      parent: dots,
    });
  });

  const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
  if (isMobile && items[0]) {
    const firstMedia = items[0].querySelector('.carousel-media, .carousel-media-bg');
    if (firstMedia) {
      firstMedia.appendChild(dots);
    } else {
      container.appendChild(dots);
    }
  } else {
    container.appendChild(dots);
  }

  return { dots, dotButtons, isMobile };
}

/* ============================================================================
 * NAVIGATION CONTROLLER FUNCTIONS
 * ========================================================================== */

/**
 * Create navigation controller
 * @param {Array} items - Array of carousel items
 * @param {HTMLElement} container - Container element
 * @param {Object} navigationElements - Object with prev, next, dots, dotButtons
 * @param {Object} placeholders - Placeholders for i18n
 * @returns {Object} Navigation state and functions
 */
function createNavigationController(items, container, navigationElements, placeholders) {
  const {
    prev, next, dots, dotButtons, isMobile,
  } = navigationElements;

  let activeIndex = 0;
  const liveRegion = createLiveRegion(container);

  // Track whether the carousel is focused or being interacted with
  // This prevents multiple carousels from announcing slide changes simultaneously
  let isUserInteracting = false;
  let pendingAnnouncementFrame = null;
  let pointerLeaveFrameId = null;
  let lastAnnouncedIndex = -1; // Track last announced slide to avoid duplicate announcements

  // Helper to announce a specific slide by index
  // Uses double requestAnimationFrame to ensure DOM is painted and stable
  // Only announces if the slide has changed since last announcement
  const scheduleAnnouncementForSlide = (slideIndex, forceAnnounce = false) => {
    // Cancel any pending announcement to avoid duplicates
    if (pendingAnnouncementFrame) {
      cancelAnimationFrame(pendingAnnouncementFrame);
      pendingAnnouncementFrame = null;
    }
    // Double rAF ensures the browser has completed layout and paint
    pendingAnnouncementFrame = requestAnimationFrame(() => {
      pendingAnnouncementFrame = requestAnimationFrame(() => {
        pendingAnnouncementFrame = null;
        // Only announce if user is interacting AND slide has changed (or forced)
        if (isUserInteracting && (forceAnnounce || slideIndex !== lastAnnouncedIndex)) {
          lastAnnouncedIndex = slideIndex;
          const currentItem = items[slideIndex];
          const mediaLabel = currentItem ? getMediaLabelForSlide(currentItem) : '';
          announceSlideChange(liveRegion, slideIndex, items.length, placeholders, mediaLabel);
        }
      });
    });
  };

  // Helper to announce the active slide (shorthand)
  const scheduleAnnouncement = (forceAnnounce = false) => {
    scheduleAnnouncementForSlide(activeIndex, forceAnnounce);
  };

  // Set up focus tracking to only announce slides when this carousel is active
  const handleFocus = () => {
    isUserInteracting = true;
    // Announce current slide when focusing (if not already announced)
    scheduleAnnouncement();
  };
  const handleBlur = (e) => {
    // Only set to false if focus is leaving the container entirely
    if (!container.contains(e.relatedTarget)) {
      isUserInteracting = false;
      lastAnnouncedIndex = -1; // Reset so it announces again when re-entering
      // Cancel any pending announcement
      if (pendingAnnouncementFrame) {
        cancelAnimationFrame(pendingAnnouncementFrame);
        pendingAnnouncementFrame = null;
      }
      // Cancel any pending pointer-leave frame
      if (pointerLeaveFrameId) {
        cancelAnimationFrame(pointerLeaveFrameId);
        pointerLeaveFrameId = null;
      }
      // Clear the live region to prevent stale announcements
      liveRegion.textContent = '';
    }
  };
  container.addEventListener('focusin', handleFocus);
  container.addEventListener('focusout', handleBlur);

  // Track pointer/touch interactions on container
  const handlePointerEnter = () => {
    isUserInteracting = true;
    // Announce active slide when first entering carousel
    scheduleAnnouncement();
  };
  const handlePointerLeave = () => {
    // Use rAF to check focus state after current event cycle completes
    if (pointerLeaveFrameId) {
      cancelAnimationFrame(pointerLeaveFrameId);
      pointerLeaveFrameId = null;
    }
    pointerLeaveFrameId = requestAnimationFrame(() => {
      pointerLeaveFrameId = null;
      if (!container.contains(document.activeElement)) {
        isUserInteracting = false;
        lastAnnouncedIndex = -1; // Reset so it announces again when re-entering
      }
    });
  };
  container.addEventListener('pointerenter', handlePointerEnter);
  container.addEventListener('pointerleave', handlePointerLeave);

  // Delegate per-slide hover handling at the container level
  const handleContainerPointerOver = (event) => {
    if (!isUserInteracting) return;
    // Guard: event.target may not be an Element in all environments
    const eventTarget = event.target;
    if (!(eventTarget instanceof Element)) return;

    const targetSlide = eventTarget.closest('.carousel-item');
    if (!targetSlide || !container.contains(targetSlide)) return;

    const slideIndex = items.indexOf(targetSlide);
    if (slideIndex === -1) return;

    scheduleAnnouncementForSlide(slideIndex);
  };
  container.addEventListener('pointerover', handleContainerPointerOver);

  const announceSlide = (index, forceAnnounce = false) => {
    // Only announce if user is interacting with THIS carousel or force is set
    if (!forceAnnounce && !isUserInteracting) {
      return;
    }
    // Track the announced index to avoid duplicate announcements
    lastAnnouncedIndex = index;
    const currentItem = items[index];
    const mediaLabel = currentItem ? getMediaLabelForSlide(currentItem) : '';
    announceSlideChange(liveRegion, index, items.length, placeholders, mediaLabel);
  };

  // Initialize aria-labels for all slides once (only happens on creation)
  const initializeAriaLabels = () => {
    items.forEach((el, i) => {
      if (el) {
        const ariaLabel = buildSlideAriaLabel(el, i, items.length, placeholders);
        el.setAttribute('aria-label', ariaLabel);
        el.setAttribute('aria-hidden', i !== activeIndex ? 'true' : 'false');
      }
    });
  };

  const updateUI = (userInitiated = false) => {
    if (activeIndex < 0 || activeIndex >= items.length) {
      activeIndex = 0;
    }

    // Move dots on mobile
    if (isMobile && dots && dots.parentElement) {
      const currentActiveSlide = items[activeIndex];
      if (currentActiveSlide) {
        const currentActiveMedia = currentActiveSlide.querySelector('.carousel-media, .carousel-media-bg');
        if (currentActiveMedia && dots.parentElement !== currentActiveMedia) {
          currentActiveMedia.appendChild(dots);
        }
      }
    }

    // Update dots
    if (dotButtons && Array.isArray(dotButtons)) {
      dotButtons.forEach((b, i) => {
        if (b) b.classList.toggle('is-active', i === activeIndex);
      });
    }

    // Enable navigation buttons
    if (prev) prev.disabled = false;
    if (next) next.disabled = false;

    // Only announce slide changes when user-initiated or when interacting with this carousel
    announceSlide(activeIndex, userInitiated);
  };

  const goTo = (index, placeholdersForLazyLoad, userInitiated = false, navigationAction = 'dot') => {
    if (!items || items.length === 0) return;

    const desiredIndex = (((index % items.length) + items.length) % items.length);
    const target = items[desiredIndex];
    if (!target) return;

    // Lazy loading optimization: Preload current and adjacent slides' media
    // Load current, previous, and next slides to ensure smooth transitions
    const prevSlideIndex = ((((desiredIndex - 1) % items.length) + items.length) % items.length);
    const nextSlideIndex = (desiredIndex + 1) % items.length;

    [items[desiredIndex], items[prevSlideIndex], items[nextSlideIndex]].forEach((slide) => {
      if (slide && placeholdersForLazyLoad) {
        loadSlideMedia(slide, placeholdersForLazyLoad);
      }
    });

    // Performance optimization: Only update previous and current slide
    // Instead of looping through all items
    const prevIndex = activeIndex;

    // Remove active state from previous slide
    if (items[prevIndex]) {
      items[prevIndex].classList.remove('is-active');
      items[prevIndex].setAttribute('aria-hidden', 'true');
    }

    // Add active state to current slide
    if (items[desiredIndex]) {
      items[desiredIndex].classList.add('is-active');
      items[desiredIndex].setAttribute('aria-hidden', 'false');
    }

    activeIndex = desiredIndex;
    updateUI(userInitiated);

    // Track slide change for all navigation actions (including autoplay)
    if (container && typeof container.dataset.carouselId !== 'undefined') {
      try {
        // Check if swipe action was set temporarily (set by swipe wrapper functions)
        const actualNavigationAction = container.dataset.lastNavigationAction || navigationAction;

        // Clean up temporary navigation action flag after reading it
        if (container.dataset.lastNavigationAction) {
          delete container.dataset.lastNavigationAction;
        }

        const currentSlide = activeIndex;
        const totalSlides = items.length;

        // Extract slide title from the current slide
        const currentSlideElement = items[activeIndex];
        let slideTitle = '';
        if (currentSlideElement) {
          const titleElement = currentSlideElement.querySelector('.carousel-title');
          if (titleElement) {
            slideTitle = (titleElement.textContent || '').trim();
          }
          // Fallback to aria-label if no title element
          if (!slideTitle) {
            slideTitle = (currentSlideElement.getAttribute('aria-label') || '').trim();
          }
        }

        trackElementInteraction('carousel-slide', {
          elementType: 'carousel',
          elementId: container.dataset.carouselId,
          additionalData: {
            navigationAction: actualNavigationAction,
            currentSlide,
            slideTitle,
            totalSlides,
          },
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error tracking carousel slide change:', error);
      }
    }
  };

  // Initialize aria-labels once on creation
  initializeAriaLabels();

  // User-initiated navigation (announces to screen readers)
  const goToNext = () => goTo(activeIndex + 1, placeholders, true, 'next');
  const goToPrev = () => goTo(activeIndex - 1, placeholders, true, 'prev');

  // Autoplay navigation (does not announce unless user is interacting)
  const goToNextAutoplay = () => goTo(activeIndex + 1, placeholders, false, 'auto');

  // Cleanup function for event listeners and pending frames
  const cleanup = () => {
    if (pendingAnnouncementFrame) {
      cancelAnimationFrame(pendingAnnouncementFrame);
      pendingAnnouncementFrame = null;
    }
    if (pointerLeaveFrameId) {
      cancelAnimationFrame(pointerLeaveFrameId);
      pointerLeaveFrameId = null;
    }
    container.removeEventListener('focusin', handleFocus);
    container.removeEventListener('focusout', handleBlur);
    container.removeEventListener('pointerenter', handlePointerEnter);
    container.removeEventListener('pointerleave', handlePointerLeave);
    container.removeEventListener('pointerover', handleContainerPointerOver);
  };

  return {
    get activeIndex() { return activeIndex; },
    goTo: (index) => goTo(index, placeholders, true, 'dot'),
    goToNext,
    goToPrev,
    goToNextAutoplay,
    updateUI,
    cleanup,
  };
}

/* ============================================================================
 * AUTOPLAY & CONTROLS FUNCTIONS
 * ========================================================================== */

/**
 * Create autoplay controller
 * @param {Array} items - Array of carousel items
 * @param {Function} goToNext - Function to navigate to next slide
 * @returns {Object} Autoplay control functions
 */
function createAutoplayController(items, goToNext) {
  let autoplayStartTime = null;
  let autoplayFrameId = null;

  const resetAutoplay = () => {
    if (autoplayFrameId) {
      cancelAnimationFrame(autoplayFrameId);
      autoplayFrameId = null;
    }

    if (!items || items.length <= 1) return;

    autoplayStartTime = Date.now();

    const autoplayFrame = () => {
      const elapsed = Date.now() - autoplayStartTime;
      if (elapsed >= AUTOPLAY_INTERVAL) {
        goToNext();
        resetAutoplay();
      } else {
        autoplayFrameId = requestAnimationFrame(autoplayFrame);
      }
    };

    autoplayFrameId = requestAnimationFrame(autoplayFrame);
  };

  const stopAutoplay = () => {
    if (autoplayFrameId) {
      cancelAnimationFrame(autoplayFrameId);
      autoplayFrameId = null;
    }
  };

  return {
    resetAutoplay,
    stopAutoplay,
    getAutoplayFrameId: () => autoplayFrameId,
  };
}

/**
 * Wire up interaction handlers using event delegation
 * More efficient than attaching listeners to individual elements
 * @param {HTMLElement} container - Container element for event delegation
 * @param {Function} resetAutoplay - Function to reset autoplay
 * @returns {Object} Object containing handler function and event types for cleanup
 */
function wireInteractionHandlers(container, resetAutoplay) {
  // Event delegation: Single set of listeners on container instead of 20+ on children
  // Reduces from 4 elements × 5 events = 20 listeners to just 5 listeners

  // Use passive option for performance on scroll/touch events
  const passiveOptions = { passive: true };

  container.addEventListener('pointerdown', resetAutoplay, passiveOptions);
  container.addEventListener('touchstart', resetAutoplay, passiveOptions);
  container.addEventListener('mousedown', resetAutoplay, passiveOptions);
  container.addEventListener('wheel', resetAutoplay, passiveOptions);
  container.addEventListener('keydown', resetAutoplay); // No passive for keyboard

  return {
    handler: resetAutoplay,
    events: ['pointerdown', 'touchstart', 'mousedown', 'wheel', 'keydown'],
    passiveOptions,
  };
}

/* ============================================================================
 * BEHAVIOR FUNCTIONS (Touch, Keyboard, Resize, Scroll)
 * ========================================================================== */

/**
 * Initialize touch swipe behavior
 * @param {HTMLElement} viewport - Viewport element
 * @param {Function} goToNext - Function to go to next slide
 * @param {Function} goToPrev - Function to go to previous slide
 * @returns {Object} Object with handlers and cleanup function
 */
function initTouchSwipe(viewport, goToNext, goToPrev) {
  if (!viewport || window.innerWidth >= MOBILE_BREAKPOINT) {
    return { handleTouchStart: null, handleTouchEnd: null, cleanup: () => {} };
  }

  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;

  const handleTouchStart = (e) => {
    if (e && e.changedTouches && e.changedTouches[0]) {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }
  };

  const handleTouchEnd = (e) => {
    if (!e || !e.changedTouches || !e.changedTouches[0]) return;

    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;

    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    const absDiffX = Math.abs(diffX);
    const absDiffY = Math.abs(diffY);

    if (absDiffX > absDiffY && absDiffX > SWIPE_THRESHOLD) {
      if (diffX > 0) {
        // Call goToNext, which will be tracked with 'swipe' action
        goToNext();
      } else {
        // Call goToPrev, which will be tracked with 'swipe' action
        goToPrev();
      }
    }
  };

  viewport.addEventListener('touchstart', handleTouchStart, { passive: true });
  viewport.addEventListener('touchend', handleTouchEnd, { passive: true });

  return {
    handleTouchStart,
    handleTouchEnd,
    cleanup: () => {
      if (viewport) {
        viewport.removeEventListener('touchstart', handleTouchStart);
        viewport.removeEventListener('touchend', handleTouchEnd);
      }
    },
  };
}

/**
 * Initialize keyboard navigation
 * @param {HTMLElement} container - Container element
 * @param {Array} items - Array of carousel items
 * @param {Function} goToNext - Function to go to next slide
 * @param {Function} goToPrev - Function to go to previous slide
 * @param {Function} goTo - Function to go to specific slide
 * @returns {Object} Object with handler and cleanup function
 */
function initKeyboardNavigation(container, items, goToNext, goToPrev, goTo) {
  if (!container) {
    return { handleKeyDown: null, cleanup: () => {} };
  }

  const handleKeyDown = (e) => {
    if (!e) return;

    if (e.key === 'ArrowLeft' || e.key === 'Left') {
      e.preventDefault();
      goToPrev();
    } else if (e.key === 'ArrowRight' || e.key === 'Right') {
      e.preventDefault();
      goToNext();
    } else if (e.key === 'Home') {
      e.preventDefault();
      goTo(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      if (items && items.length > 0) {
        goTo(items.length - 1);
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  return {
    handleKeyDown,
    cleanup: () => {
      if (container) {
        container.removeEventListener('keydown', handleKeyDown);
      }
    },
  };
}

/**
 * Ensure the carousel resets to the first slide on resize
 * @param {Function} goTo - Function to navigate to specific slide
 * @returns {Object} Object with cleanup function
 */
/**
 * Wire up navigation button click handlers
 * @param {HTMLButtonElement} prev - Previous button
 * @param {HTMLButtonElement} next - Next button
 * @param {Function} goToNext - Function to go to next slide
 * @param {Function} goToPrev - Function to go to previous slide
 */
function wireNavigationButtons(prev, next, goToNext, goToPrev) {
  if (prev) {
    prev.addEventListener('click', (e) => {
      goToPrev();
      e.currentTarget.blur();
    });
    prev.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        goToPrev();
      }
    });
  }

  if (next) {
    next.addEventListener('click', (e) => {
      goToNext();
      e.currentTarget.blur();
    });
    next.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        goToNext();
      }
    });
  }
}

/**
 * Wire up pagination dot click handlers
 * @param {Array} dotButtons - Array of dot button elements
 * @param {Function} goTo - Function to go to specific slide
 */
function wirePaginationDots(dotButtons, goTo) {
  if (!dotButtons || !Array.isArray(dotButtons)) return;

  dotButtons.forEach((b) => {
    if (!b) return;

    b.addEventListener('click', (e) => {
      if (!e || !e.currentTarget) return;
      const idx = Number(e.currentTarget.dataset.index || 0);
      goTo(idx);
      e.currentTarget.blur();
    });

    b.addEventListener('keydown', (e) => {
      if (!e || !e.currentTarget) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const idx = Number(e.currentTarget.dataset.index || 0);
        goTo(idx);
      }
    });
  });
}

/**
 * Initialize resize handler for responsive dot positioning
 * @param {Array} items - Array of carousel items
 * @param {HTMLElement} dots - Dots container
 * @param {HTMLElement} container - Container element
 * @param {Function} getActiveIndex - Function to get current active index
 * @param {boolean} initialIsMobile - Initial mobile state
 * @returns {Object} Object with cleanup function
 */
function initResizeHandler(items, dots, container, getActiveIndex, initialIsMobile) {
  let resizeFrameId = null;

  const handleResize = () => {
    if (resizeFrameId) {
      cancelAnimationFrame(resizeFrameId);
      resizeFrameId = null;
    }

    resizeFrameId = requestAnimationFrame(() => {
      const activeIndex = getActiveIndex();
      if (!items || !items[activeIndex] || !dots) return;

      const newIsMobile = window.innerWidth < MOBILE_BREAKPOINT;
      if (newIsMobile !== initialIsMobile) {
        if (newIsMobile) {
          const activeSlide = items[activeIndex];
          if (activeSlide) {
            const activeMedia = activeSlide.querySelector('.carousel-media, .carousel-media-bg');
            if (activeMedia) {
              activeMedia.appendChild(dots);
            }
          }
        } else if (container) {
          container.appendChild(dots);
        }
      }
      resizeFrameId = null;
    });
  };

  window.addEventListener('resize', handleResize);

  return {
    cleanup: () => {
      if (resizeFrameId) {
        cancelAnimationFrame(resizeFrameId);
        resizeFrameId = null;
      }
      window.removeEventListener('resize', handleResize);
    },
  };
}

/**
 * Initialize scroll-triggered animations
 * @param {HTMLElement} block - Carousel block element
 * @param {Array} items - Array of carousel items
 * @param {Function} resetAutoplay - Function to reset autoplay
 * @param {Function} getActiveIndex - Function to get current active index
 * @returns {Object} Object with cleanup function
 */
function initScrollAnimations(block, items, resetAutoplay, getActiveIndex) {
  let animationsStarted = false;
  let scrollFrameId = null;
  let userHasScrolled = false;
  let lastCollapseTime = 0;
  let isCollapsing = false;
  const COLLAPSE_DEBOUNCE_MS = 800; // Longer debounce for collapse to ensure smooth transition

  const startCarouselAnimations = (resetAutoplayFn) => {
    if (animationsStarted) return;
    if (!block || !items || items.length === 0) return;
    if (isCollapsing) return; // Don't expand while collapsing

    animationsStarted = true;

    const hasFullGrid = block.classList.contains('carousel-layout-full-grid');
    const isInsideGridColumns = block.closest('.grid-columns') !== null;
    if (hasFullGrid && !isInsideGridColumns) {
      block.classList.add('carousel-expanded');
    }

    // Get the current active index (which may have changed via navigation)
    const currentActiveIndex = getActiveIndex ? getActiveIndex() : 0;
    const currentActiveSlide = items[currentActiveIndex] || items[0];

    if (currentActiveSlide) {
      // First, ensure all slides are properly deactivated
      items.forEach((item) => {
        if (item && item !== currentActiveSlide) {
          item.classList.remove('is-active');
          item.setAttribute('aria-hidden', 'true');
        }
      });

      // Check if the current slide is already active and visible
      const isAlreadyActive = currentActiveSlide.classList.contains('is-active');

      if (!isAlreadyActive) {
        // Only re-trigger animation if slide is not already active (prevents blink)
        currentActiveSlide.classList.remove('is-active');
        requestAnimationFrame(() => {
          if (currentActiveSlide) {
            currentActiveSlide.classList.add('is-active');
            currentActiveSlide.setAttribute('aria-hidden', 'false');

            if (items.length > 1 && resetAutoplayFn) {
              const currentCta = currentActiveSlide.querySelector('.carousel-cta');
              if (currentCta) {
                const handleTransitionEnd = (e) => {
                  if (e.propertyName === 'opacity') {
                    currentCta.removeEventListener('transitionend', handleTransitionEnd);
                    resetAutoplayFn();
                  }
                };
                currentCta.addEventListener('transitionend', handleTransitionEnd);
              } else {
                const startTime = Date.now();
                const waitForAnimations = () => {
                  if (Date.now() - startTime >= CTA_ANIMATION_DURATION) {
                    resetAutoplayFn();
                  } else {
                    requestAnimationFrame(waitForAnimations);
                  }
                };
                requestAnimationFrame(waitForAnimations);
              }
            }
          }
        });
      } else {
        // Slide is already active, just ensure aria-hidden is correct
        currentActiveSlide.setAttribute('aria-hidden', 'false');

        // Since we're not re-triggering animations, reset autoplay immediately if needed
        if (items.length > 1 && resetAutoplayFn) {
          resetAutoplayFn();
        }
      }
    }
  };

  const handleCarouselScroll = () => {
    if (!userHasScrolled) {
      userHasScrolled = true;
    }

    if (scrollFrameId) {
      cancelAnimationFrame(scrollFrameId);
      scrollFrameId = null;
    }

    scrollFrameId = requestAnimationFrame((timestamp) => {
      try {
        if (!block) return;

        const rect = block.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportMiddle = viewportHeight * VIEWPORT_TRIGGER_RATIO;
        const carouselTop = rect.top;

        const isFullGrid = block.classList.contains('carousel-layout-full-grid');
        const isExpanded = block.classList.contains('carousel-expanded');
        // Use stricter threshold for collapse (very close to top) to prevent oscillation
        const isAtTop = window.scrollY < COLLAPSE_THRESHOLD;

        // Expand when scrolled into view
        if (carouselTop <= viewportMiddle
          && !animationsStarted && userHasScrolled && !isCollapsing) {
          const resetAutoplayFn = items.length > 1 && resetAutoplay ? resetAutoplay : null;
          startCarouselAnimations(resetAutoplayFn);
        }

        // Collapse when at top, with debounce to prevent rapid toggling
        if (isAtTop && isFullGrid && isExpanded && !isCollapsing) {
          if (timestamp - lastCollapseTime >= COLLAPSE_DEBOUNCE_MS) {
            isCollapsing = true;
            block.classList.remove('carousel-expanded');
            animationsStarted = false;
            lastCollapseTime = timestamp;

            // Reset collapsing flag after transition completes using transitionend
            const handleTransitionEnd = (e) => {
              // Only handle the carousel's own transition (width or margin)
              const isCarouselTransition = e.target === block
                && (e.propertyName === 'width' || e.propertyName === 'margin');
              if (isCarouselTransition) {
                isCollapsing = false;
                block.removeEventListener('transitionend', handleTransitionEnd);
              }
            };
            block.addEventListener('transitionend', handleTransitionEnd);
          }
        }
      } catch (error) {
        // Silent error handling
      } finally {
        scrollFrameId = null;
      }
    });
  };

  window.addEventListener('scroll', handleCarouselScroll, { passive: true });

  return {
    cleanup: () => {
      if (scrollFrameId) {
        cancelAnimationFrame(scrollFrameId);
        scrollFrameId = null;
      }
      window.removeEventListener('scroll', handleCarouselScroll);
    },
  };
}

/* ============================================================================
 * MAIN DECORATOR - ORCHESTRATES ALL CAROUSEL FUNCTIONALITY
 * ========================================================================== */

/**
 * Decorate carousel block - main orchestrator function
 * @param {HTMLElement} block - Carousel block element
 * @returns {Promise<void>}
 */
export default async function decorate(block) {
  // Prevent double decoration
  if (block.dataset.carouselDecorated) {
    return;
  }
  block.dataset.carouselDecorated = 'true';

  // Generate unique ID for this carousel instance
  const carouselId = generateCarouselUID();

  // Fetch placeholders for i18n support
  let placeholders = {};
  try {
    placeholders = await fetchPlaceholdersForLocale();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to load placeholders, using fallback text:', error);
  }

  // Parse configuration
  const { config, rows } = await parseCarouselConfig(block);

  // Reset any previously hidden rows (in case layout variation changed)
  rows.forEach((row) => {
    if (row.hasAttribute('data-carousel-filtered')) {
      row.style.display = '';
      row.removeAttribute('data-carousel-filtered');
    }
  });

  // Clear block content (not in Universal Editor)
  const isAuthoringMode = document.documentElement.classList.contains('adobe-ue-edit');
  if (!isAuthoringMode) {
    block.innerHTML = '';
  }

  // Setup block
  block.classList.add('carousel');
  const layoutClass = applyLayoutClasses(block, config);

  // Create UI structure
  const { container, viewport, track } = createCarouselUI();

  // Store carousel ID on container for tracking
  container.dataset.carouselId = carouselId;

  // Build slides (pass layoutClass for filtering)
  const items = await buildCarouselSlides(rows, track, placeholders, layoutClass);

  // Append to block
  block.appendChild(container);
  decorateIcons(block);

  // In authoring mode, hide original rows from screen readers to prevent duplicate announcements
  // Original rows are kept in DOM for UE editing but should not be read by assistive technology
  if (isAuthoringMode) {
    rows.forEach((row) => {
      row.setAttribute('aria-hidden', 'true');
      row.setAttribute('inert', '');
    });
  }

  // Check if this is an image-only layout (multi-slide visible)
  const isImageOnlyLayout = layoutClass && (
    layoutClass.includes('image-only-medium')
    || layoutClass.includes('image-only-large')
  );

  // Activate first slide (not needed for image-only layouts where all are visible)
  if (!isImageOnlyLayout && items[0]) {
    items[0].classList.add('is-active');
  }

  // For image-only layouts, show all items
  if (isImageOnlyLayout) {
    items.forEach((item) => {
      item.classList.add('is-active');
    });
  }

  // For image-only layouts, skip fade-based navigation and use scroll-based approach
  if (isImageOnlyLayout) {
    // Create navigation elements for scrolling
    const { prev, next } = createNavigationArrows(container, placeholders);

    // Wrap navigation buttons in a container (like partners-overview)
    const buttonsWrapper = createElement('div', { className: 'carousel-buttons' });
    if (prev && prev.parentNode) {
      container.insertBefore(buttonsWrapper, container.firstChild);
      buttonsWrapper.appendChild(prev);
      buttonsWrapper.appendChild(next);
    }

    // Update button states based on scroll position
    const updateScrollButtons = () => {
      const { scrollLeft, clientWidth, scrollWidth } = track;
      const threshold = 10;
      const isAtStart = scrollLeft <= threshold;
      const isAtEnd = scrollLeft + clientWidth >= scrollWidth - threshold;

      if (prev) {
        prev.disabled = isAtStart;
        prev.style.opacity = isAtStart ? '0.2' : '1';
      }
      if (next) {
        next.disabled = isAtEnd;
        next.style.opacity = isAtEnd ? '0.2' : '1';
      }
    };

    // Add scroll functionality to navigation buttons
    // Calculate scroll amount based on first item width + gap
    const getScrollAmount = () => {
      if (items.length === 0) return 0;
      const firstItem = items[0];
      if (!firstItem) return 0;

      const itemWidth = firstItem.offsetWidth;
      const computedStyle = window.getComputedStyle(track);
      const gap = parseFloat(computedStyle.gap) || 20;

      return itemWidth + gap;
    };

    // Calculate which slide is currently visible based on scroll position
    // Returns the first visible slide from the left
    const getCurrentSlideIndex = () => {
      if (items.length === 0) return 0;
      const firstItem = items[0];
      if (!firstItem) return 0;

      const itemWidth = firstItem.offsetWidth;
      const computedStyle = window.getComputedStyle(track);
      const gap = parseFloat(computedStyle.gap) || 20;
      const { scrollLeft } = track;
      const slideWidth = itemWidth + gap;

      // Calculate the slide index based on scroll position
      // Use floor to get the first visible slide from the left
      const currentIndex = Math.floor(scrollLeft / slideWidth);
      return Math.min(currentIndex, items.length - 1);
    };

    // Track slide change for image-only carousel
    const trackImageCarouselSlide = (navigationAction, targetSlideIndex) => {
      try {
        const currentSlide = targetSlideIndex !== undefined
          ? targetSlideIndex
          : getCurrentSlideIndex();
        const totalSlides = items.length;

        // Image carousels should have blank title
        const slideTitle = '';

        trackElementInteraction('carousel-slide', {
          elementType: 'carousel',
          elementId: container.dataset.carouselId,
          additionalData: {
            navigationAction,
            currentSlide,
            slideTitle,
            totalSlides,
          },
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error tracking image carousel slide change:', error);
      }
    };

    const cleanupCallbacks = [];
    const addCleanup = (fn) => {
      if (typeof fn === 'function') {
        cleanupCallbacks.push(fn);
      }
    };
    const addEventListenerWithCleanup = (target, eventName, handler, options) => {
      if (!target || typeof handler !== 'function') return;
      target.addEventListener(eventName, handler, options);
      addCleanup(() => target.removeEventListener(eventName, handler, options));
    };

    // Track scroll-based navigation (swipe)
    // Declare tracking variables in outer scope for use in button handlers
    let lastTrackedSlide = getCurrentSlideIndex();
    let isProgrammaticScroll = false;

    if (prev) {
      const handlePrevClick = (e) => {
        e.preventDefault();
        const currentSlideIndex = getCurrentSlideIndex();
        const scrollAmount = getScrollAmount();

        // Calculate target slide index (previous slide, wrapping if needed)
        const targetSlideIndex = currentSlideIndex > 0
          ? currentSlideIndex - 1
          : items.length - 1;

        // Mark as programmatic scroll to prevent scrollend handler from tracking
        isProgrammaticScroll = true;
        lastTrackedSlide = targetSlideIndex;

        // Track immediately with calculated target slide
        trackImageCarouselSlide('prev', targetSlideIndex);

        // Perform the scroll
        track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      };
      addEventListenerWithCleanup(prev, 'click', handlePrevClick);
    }
    if (next) {
      const handleNextClick = (e) => {
        e.preventDefault();
        const currentSlideIndex = getCurrentSlideIndex();
        const scrollAmount = getScrollAmount();

        // Calculate target slide index (next slide, wrapping if needed)
        const targetSlideIndex = currentSlideIndex < items.length - 1
          ? currentSlideIndex + 1
          : 0;

        // Mark as programmatic scroll to prevent scrollend handler from tracking
        isProgrammaticScroll = true;
        lastTrackedSlide = targetSlideIndex;

        // Track immediately with calculated target slide
        trackImageCarouselSlide('next', targetSlideIndex);

        // Perform the scroll
        track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      };
      addEventListenerWithCleanup(next, 'click', handleNextClick);
    }

    // Prevent horizontal wheel scrolling while allowing vertical page scroll
    const handleTrackWheel = (event) => {
      if (!event) return;
      const absDeltaX = Math.abs(event.deltaX || 0);
      const absDeltaY = Math.abs(event.deltaY || 0);

      if (absDeltaX > absDeltaY || (event.shiftKey && absDeltaY > 0)) {
        event.preventDefault();
      }
    };
    addEventListenerWithCleanup(track, 'wheel', handleTrackWheel, { passive: false });

    // Update scroll buttons on scroll
    const handleTrackScroll = () => {
      updateScrollButtons();
    };

    addEventListenerWithCleanup(track, 'scroll', handleTrackScroll, { passive: true });

    // Track swipe/scroll when scrolling ends using scrollend event (modern browsers)
    const handleScrollEnd = () => {
      // Skip if this was a programmatic scroll from button click
      if (isProgrammaticScroll) {
        isProgrammaticScroll = false;
        // Update lastTrackedSlide to prevent duplicate tracking
        lastTrackedSlide = getCurrentSlideIndex();
        return;
      }

      const currentSlide = getCurrentSlideIndex();
      // Only track if slide changed
      if (currentSlide !== lastTrackedSlide) {
        lastTrackedSlide = currentSlide;
        trackImageCarouselSlide('swipe', currentSlide);
      }
    };

    // Use scrollend event if supported (Chrome 114+, Safari 16.4+)
    if ('onscrollend' in window) {
      addEventListenerWithCleanup(track, 'scrollend', handleScrollEnd, { passive: true });
    } else {
      // Fallback for browsers that don't support scrollend
      // Use requestAnimationFrame to detect when scroll position stabilizes
      let scrollAnimationFrame = null;
      let lastScrollLeft = track.scrollLeft;
      let scrollStableCount = 0;

      const checkScrollEnd = () => {
        const currentScrollLeft = track.scrollLeft;

        if (currentScrollLeft === lastScrollLeft) {
          // Scroll position hasn't changed, increment stable count
          scrollStableCount += 1;

          // Require 3 consecutive stable frames (typically ~50ms) to confirm scroll has ended
          if (scrollStableCount >= 3) {
            scrollAnimationFrame = null;
            scrollStableCount = 0;

            // Skip if this was a programmatic scroll from button click
            if (isProgrammaticScroll) {
              isProgrammaticScroll = false;
              lastTrackedSlide = getCurrentSlideIndex();
              return;
            }

            const currentSlide = getCurrentSlideIndex();
            // Only track if slide changed
            if (currentSlide !== lastTrackedSlide) {
              lastTrackedSlide = currentSlide;
              trackImageCarouselSlide('swipe', currentSlide);
            }
          } else {
            // Continue checking
            scrollAnimationFrame = requestAnimationFrame(checkScrollEnd);
          }
        } else {
          // Scroll position changed, reset stable count
          scrollStableCount = 0;
          lastScrollLeft = currentScrollLeft;
          scrollAnimationFrame = requestAnimationFrame(checkScrollEnd);
        }
      };

      const handleScrollEndFallback = () => {
        updateScrollButtons();

        // Cancel any existing animation frame
        if (scrollAnimationFrame) {
          cancelAnimationFrame(scrollAnimationFrame);
          scrollAnimationFrame = null;
        }

        // Start checking for scroll end
        scrollStableCount = 0;
        scrollAnimationFrame = requestAnimationFrame(checkScrollEnd);
      };

      // Replace the scroll handler with the fallback version
      track.removeEventListener('scroll', handleTrackScroll);
      addEventListenerWithCleanup(track, 'scroll', handleScrollEndFallback, { passive: true });

      // Store animation frame reference for cleanup
      addCleanup(() => {
        if (scrollAnimationFrame) {
          cancelAnimationFrame(scrollAnimationFrame);
          scrollAnimationFrame = null;
        }
      });
    }

    let resizeFrameId = null;
    let lastMeasuredScrollWidth = null;
    let lastMeasuredClientWidth = null;
    const scheduleScrollButtonUpdate = () => {
      if (resizeFrameId) return;
      resizeFrameId = requestAnimationFrame(() => {
        resizeFrameId = null;

        if (!track) {
          updateScrollButtons();
          return;
        }

        const { scrollWidth, clientWidth } = track;
        const dimensionsChanged = scrollWidth !== lastMeasuredScrollWidth
          || clientWidth !== lastMeasuredClientWidth;

        if (dimensionsChanged) {
          lastMeasuredScrollWidth = scrollWidth;
          lastMeasuredClientWidth = clientWidth;
          updateScrollButtons();
        }
      });
    };
    const handleResize = () => {
      if (resizeFrameId) {
        cancelAnimationFrame(resizeFrameId);
        resizeFrameId = null;
      }
      scheduleScrollButtonUpdate();
    };
    addCleanup(() => {
      if (resizeFrameId) {
        cancelAnimationFrame(resizeFrameId);
        resizeFrameId = null;
      }
    });
    const handleWindowResize = () => handleResize();
    addEventListenerWithCleanup(window, 'resize', handleWindowResize);

    if (typeof window !== 'undefined' && 'ResizeObserver' in window && track) {
      const resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(track);
      addCleanup(() => {
        resizeObserver.disconnect();
      });
    }

    // Initialize button states after a slight delay to ensure DOM is ready
    requestAnimationFrame(() => {
      updateScrollButtons();
    });

    // Configure accessibility
    // For image-only layouts, do NOT make container tabbable so Tab moves into slide links
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', placeholders[CAROUSEL_ARIA_LABEL] || 'Image Gallery');
    // Ensure scroll containers are NOT tabbable
    if (viewport) viewport.setAttribute('tabindex', '-1');
    if (track) track.setAttribute('tabindex', '-1');

    block.carouselCleanup = () => {
      while (cleanupCallbacks.length) {
        const cleanupFn = cleanupCallbacks.pop();
        try {
          cleanupFn();
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn('Carousel cleanup failed:', error);
        }
      }
    };

    // Track carousel initialization for image-only layouts
    try {
      const totalSlides = items.length;
      // Image-only layouts don't use autoplay
      const autoPlay = false;
      trackElementInteraction('carousel-init', {
        elementType: 'carousel',
        elementId: carouselId,
        additionalData: {
          totalSlides,
          autoPlay,
        },
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error tracking carousel initialization:', error);
    }

    return; // Skip all the fade animation logic below
  }

  // === KAO-Home variant: autoplay-only crossfade, no user controls ===
  const isKaoHome = layoutClass && layoutClass.includes('kao-home');
  if (isKaoHome) {
    // Activate first slide
    if (items[0]) {
      items[0].classList.add('is-active');
    }

    // Crossfade autoplay: both slides visible during transition
    let kaoActiveIndex = 0;
    let kaoAutoplayTimer = null;

    const kaoCrossfade = () => {
      if (items.length <= 1) return;

      const currentItem = items[kaoActiveIndex];
      const nextIndex = (kaoActiveIndex + 1) % items.length;
      const nextItem = items[nextIndex];

      // Start crossfade: outgoing fades out, incoming fades in simultaneously
      currentItem.classList.remove('is-active');
      currentItem.classList.add('is-fading-out');

      nextItem.classList.add('is-active');

      // Clean up the outgoing slide after transition completes
      const handleTransitionEnd = () => {
        currentItem.classList.remove('is-fading-out');
        currentItem.removeEventListener('transitionend', handleTransitionEnd);
      };
      currentItem.addEventListener('transitionend', handleTransitionEnd);

      // Fallback cleanup in case transitionend doesn't fire
      setTimeout(() => {
        currentItem.classList.remove('is-fading-out');
      }, 1500);

      kaoActiveIndex = nextIndex;
    };

    const startKaoAutoplay = () => {
      if (kaoAutoplayTimer) clearInterval(kaoAutoplayTimer);
      kaoAutoplayTimer = setInterval(kaoCrossfade, AUTOPLAY_INTERVAL);
    };

    startKaoAutoplay();

    // Accessibility
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', placeholders[CAROUSEL_ARIA_LABEL] || 'Carousel');
    container.setAttribute('aria-roledescription', placeholders[CAROUSEL_ROLE] || 'carousel');

    // Cleanup
    block.carouselCleanup = () => {
      if (kaoAutoplayTimer) {
        clearInterval(kaoAutoplayTimer);
        kaoAutoplayTimer = null;
      }
    };

    // Track initialization
    try {
      trackElementInteraction('carousel-init', {
        elementType: 'carousel',
        elementId: carouselId,
        additionalData: {
          totalSlides: items.length,
          autoPlay: true,
          layout: 'kao-home',
        },
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error tracking carousel initialization:', error);
    }

    return; // Skip standard carousel setup
  }

  // === Standard carousel (full-grid, full-width) ===

  // Single item - no navigation/pagination needed
  const isSingleItem = items.length <= 1;

  // Create navigation elements (skip for single items)
  let prev = null;
  let next = null;
  let dots = null;
  let dotButtons = [];
  let isMobile = false;
  let navController = null;
  let autoplayController = null;
  let interactionCleanup = null;
  let swipeController = null;
  let keyboardController = null;
  let resizeController = null;

  if (!isSingleItem) {
    const navElements = createNavigationArrows(container, placeholders);
    prev = navElements.prev;
    next = navElements.next;
    const pagination = createPaginationDots(items, container, placeholders);
    dots = pagination.dots;
    dotButtons = pagination.dotButtons;
    isMobile = pagination.isMobile;

    // Create navigation controller
    navController = createNavigationController(
      items,
      container,
      {
        prev, next, dots, dotButtons, isMobile,
      },
      placeholders,
    );

    // Create autoplay controller (uses non-announcing navigation to avoid confusing screen readers)
    autoplayController = createAutoplayController(items, navController.goToNextAutoplay);

    // Wire interactions using event delegation on container (5 listeners instead of 20)
    interactionCleanup = wireInteractionHandlers(
      container,
      autoplayController.resetAutoplay,
    );

    wireNavigationButtons(prev, next, navController.goToNext, navController.goToPrev);
    wirePaginationDots(dotButtons, navController.goTo);

    // Store for scroll handler
    block.resetAutoplay = autoplayController.resetAutoplay;

    // Create swipe wrapper functions that track swipe action
    const originalGoToNext = navController.goToNext;
    const originalGoToPrev = navController.goToPrev;

    // Wrapper functions that temporarily set swipe action before calling navigation
    // The action will be cleaned up inside the goTo function after tracking
    const swipeGoToNext = () => {
      container.dataset.lastNavigationAction = 'swipe';
      originalGoToNext();
    };
    const swipeGoToPrev = () => {
      container.dataset.lastNavigationAction = 'swipe';
      originalGoToPrev();
    };

    // Initialize behaviors
    swipeController = initTouchSwipe(viewport, swipeGoToNext, swipeGoToPrev);
    keyboardController = initKeyboardNavigation(
      container,
      items,
      navController.goToNext,
      navController.goToPrev,
      navController.goTo,
    );
    resizeController = initResizeHandler(
      items,
      dots,
      container,
      () => navController.activeIndex,
      isMobile,
    );
    // Update initial UI
    navController.updateUI();
  }

  // Add CTA button click tracking for all carousel types
  items.forEach((item) => {
    const ctaButton = item.querySelector('.carousel-cta');
    if (ctaButton && container.dataset.carouselId) {
      const handleCtaClick = () => {
        try {
          const slideIndex = parseInt(item.dataset.slideIndex, 10) || 0;
          const totalSlides = parseInt(item.dataset.totalSlides, 10) || items.length;
          const ctaText = ctaButton.textContent?.trim() || '';
          const ctaHref = ctaButton.href || '';

          // Sanitize URL to convert relative URLs to full URLs
          const sanitizedHref = sanitizeUrlForAnalytics(ctaHref);

          trackElementInteraction('carousel-cta-click', {
            elementType: 'carousel',
            elementId: container.dataset.carouselId,
            elementText: ctaText,
            elementHref: sanitizedHref,
            additionalData: {
              slideIndex,
              ctaText,
              totalSlides,
            },
          });
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error tracking carousel CTA click:', error);
        }
      };

      ctaButton.addEventListener('click', handleCtaClick);
      // Store cleanup function on the button for later cleanup if needed
      if (!block.carouselCtaCleanup) {
        block.carouselCtaCleanup = [];
      }
      block.carouselCtaCleanup.push(() => {
        ctaButton.removeEventListener('click', handleCtaClick);
      });
    }
  });

  // Configure accessibility
  container.setAttribute('tabindex', '0');
  container.setAttribute('role', 'region');
  container.setAttribute('aria-label', placeholders[CAROUSEL_ARIA_LABEL] || 'Carousel');
  container.setAttribute('aria-roledescription', placeholders[CAROUSEL_ROLE] || 'carousel');

  // Create cleanup function
  block.carouselCleanup = () => {
    // Cleanup CTA button click listeners
    if (block.carouselCtaCleanup && Array.isArray(block.carouselCtaCleanup)) {
      block.carouselCtaCleanup.forEach((cleanupFn) => {
        try {
          cleanupFn();
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn('Error cleaning up CTA click listener:', error);
        }
      });
      block.carouselCtaCleanup = [];
    }

    // Stop autoplay
    if (autoplayController) {
      autoplayController.stopAutoplay();
    }

    // Remove interaction listeners from container (event delegation cleanup)
    if (interactionCleanup && container) {
      const { handler, passiveOptions } = interactionCleanup;
      // Remove passive listeners
      container.removeEventListener('pointerdown', handler, passiveOptions);
      container.removeEventListener('touchstart', handler, passiveOptions);
      container.removeEventListener('mousedown', handler, passiveOptions);
      container.removeEventListener('wheel', handler, passiveOptions);
      // Remove non-passive listener
      container.removeEventListener('keydown', handler);
    }

    // Cleanup navigation controller (focus/pointer tracking listeners)
    if (navController && navController.cleanup) {
      navController.cleanup();
    }

    // Cleanup behaviors
    if (swipeController) swipeController.cleanup();
    if (keyboardController) keyboardController.cleanup();
    if (resizeController) resizeController.cleanup();

    // Clean up video controls
    if (items && Array.isArray(items)) {
      items.forEach((item) => {
        if (item) {
          const mediaWrapper = item.querySelector('.carousel-media-bg');
          if (mediaWrapper && typeof mediaWrapper.videoControlsCleanup === 'function') {
            mediaWrapper.videoControlsCleanup();
          }
        }
      });
    }
  };

  // Initialize scroll animations
  const scrollController = initScrollAnimations(
    block,
    items,
    autoplayController ? autoplayController.resetAutoplay : null,
    navController ? () => navController.activeIndex : () => 0,
  );

  // Enhance cleanup to include scroll
  const originalCleanup = block.carouselCleanup;
  block.carouselCleanup = () => {
    originalCleanup();
    scrollController.cleanup();
  };

  // Track carousel initialization
  try {
    const totalSlides = items.length;
    const autoPlay = Boolean(autoplayController);
    trackElementInteraction('carousel-init', {
      elementType: 'carousel',
      elementId: carouselId,
      additionalData: {
        totalSlides,
        autoPlay,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error tracking carousel initialization:', error);
  }
}
