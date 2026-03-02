import {
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  getMetadata,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from './aem.js';

let headerFooterBasePathPromise;

/**
 * Resolves the closest directory containing both nav and footer fragments.
 * Walks from the page's directory up to root, returning the first directory
 * where both {dir}nav.plain.html and {dir}footer.plain.html respond 200.
 * Metadata overrides (nav/footer) take precedence if set.
 * Result is cached so header and footer share the same resolution.
 * @returns {Promise<string>} directory with trailing slash, e.g. '/newsroom/'
 */
export function getHeaderFooterBasePath() {
  if (headerFooterBasePathPromise) return headerFooterBasePathPromise;

  headerFooterBasePathPromise = (async () => {
    const navMeta = getMetadata('nav');
    const footerMeta = getMetadata('footer');
    if (navMeta || footerMeta) {
      const metaPath = navMeta || footerMeta;
      const dir = metaPath.substring(0, metaPath.lastIndexOf('/') + 1) || '/';
      return dir;
    }

    const pathname = window.location.pathname.replace(/\.(html|htm|md)$/, '');
    const segments = pathname.split('/').filter(Boolean);
    segments.pop();

    const candidates = [];
    for (let i = segments.length; i >= 0; i -= 1) {
      const dir = i === 0 ? '/' : `/${segments.slice(0, i).join('/')}/`;
      candidates.push(dir);
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const dir of candidates) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const [navResp, footerResp] = await Promise.all([
          fetch(`${dir}nav.plain.html`, { method: 'HEAD' }),
          fetch(`${dir}footer.plain.html`, { method: 'HEAD' }),
        ]);
        if (navResp.ok && footerResp.ok) return dir;
      } catch (e) { /* try next candidate */ }
    }

    return '/';
  })();

  return headerFooterBasePathPromise;
}

/**
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to?.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks() {
  try {
    // TODO: add auto block, if needed
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('header'));

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
