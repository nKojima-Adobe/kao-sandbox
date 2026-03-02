import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { getHeaderFooterBasePath } from '../../scripts/scripts.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

function closeDropdown(nav) {
  const overlay = nav.querySelector('.nav-dropdown-overlay');
  if (overlay) overlay.setAttribute('aria-hidden', 'true');

  nav.querySelectorAll('.nav-green-bar .nav-drop').forEach((item) => {
    item.classList.remove('active');
    item.setAttribute('aria-expanded', 'false');
  });
}

function buildLink(anchor) {
  const a = document.createElement('a');
  a.href = anchor.href;
  a.textContent = anchor.textContent;
  return a;
}

function buildDropdownSection(l2Item, container) {
  const topLink = document.createElement('div');
  topLink.className = 'nav-dropdown-top-link';
  const l2Anchor = l2Item.querySelector(':scope > a');
  if (l2Anchor) {
    topLink.append(buildLink(l2Anchor));
  } else {
    topLink.textContent = l2Item.firstChild?.textContent?.trim() || '';
  }
  container.append(topLink);

  const divider = document.createElement('hr');
  divider.className = 'nav-dropdown-divider';
  container.append(divider);

  const l3List = l2Item.querySelector(':scope > ul');
  if (!l3List) return;

  const body = document.createElement('div');
  body.className = 'nav-dropdown-body';

  [...l3List.children].forEach((l3Item) => {
    const group = document.createElement('div');
    group.className = 'nav-dropdown-group';

    const heading = document.createElement('div');
    heading.className = 'nav-dropdown-group-heading';
    const l3Anchor = l3Item.querySelector(':scope > a');
    if (l3Anchor) {
      heading.append(buildLink(l3Anchor));
    } else {
      heading.textContent = l3Item.firstChild?.textContent?.trim() || '';
    }
    group.append(heading);

    const l4List = l3Item.querySelector(':scope > ul');
    if (l4List) {
      const ul = document.createElement('ul');
      [...l4List.children].forEach((l4Item) => {
        const newLi = document.createElement('li');
        const anchor = l4Item.querySelector('a');
        if (anchor) {
          newLi.append(buildLink(anchor));
        } else {
          newLi.textContent = l4Item.textContent;
        }
        ul.append(newLi);
      });
      group.append(ul);
    }

    body.append(group);
  });

  container.append(body);
}

function openDropdown(nav, navItem) {
  const overlay = nav.querySelector('.nav-dropdown-overlay');
  const content = overlay.querySelector('.nav-dropdown-content');

  closeDropdown(nav);

  const l2List = navItem.querySelector(':scope > ul');
  if (!l2List) return;

  const l2Items = [...l2List.children];
  if (l2Items.length === 0) return;

  content.innerHTML = '';

  l2Items.forEach((l2Item) => {
    buildDropdownSection(l2Item, content);
  });

  navItem.classList.add('active');
  navItem.setAttribute('aria-expanded', 'true');
  overlay.setAttribute('aria-hidden', 'false');
}

function toggleMobileMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null
    ? !forceExpanded
    : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');

  document.body.style.overflowY = expanded ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  let navPath;
  if (navMeta) {
    navPath = new URL(navMeta, window.location).pathname;
  } else {
    const basePath = await getHeaderFooterBasePath();
    navPath = `${basePath}nav`;
  }
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const navSections = nav.querySelector('.nav-sections');
  const navTools = nav.querySelector('.nav-tools');

  if (navBrand) {
    const brandLink = navBrand.querySelector('.button') || navBrand.querySelector('a[href]');
    if (brandLink) {
      brandLink.className = '';
      const container = brandLink.closest('.button-container');
      if (container) container.className = '';
    }
  }

  const topBar = document.createElement('div');
  topBar.className = 'nav-top-bar';
  if (navBrand) topBar.append(navBrand);
  if (navTools) topBar.append(navTools);

  const greenBar = document.createElement('div');
  greenBar.className = 'nav-green-bar';

  if (navSections) {
    const navList = navSections.querySelector('.default-content-wrapper > ul')
      || navSections.querySelector('ul');
    if (navList) {
      const clonedList = navList.cloneNode(true);

      clonedList.querySelectorAll(':scope > li').forEach((li) => {
        if (li.querySelector('ul')) {
          li.classList.add('nav-drop');
          li.setAttribute('aria-expanded', 'false');
          li.addEventListener('click', (e) => {
            if (!isDesktop.matches) return;
            e.preventDefault();
            e.stopPropagation();
            const isOpen = li.classList.contains('active');
            if (isOpen) {
              closeDropdown(nav);
            } else {
              openDropdown(nav, li);
            }
          });
        }
      });

      greenBar.append(clonedList);
    }
  }

  const overlay = document.createElement('div');
  overlay.className = 'nav-dropdown-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  const closeBtn = document.createElement('button');
  closeBtn.className = 'nav-dropdown-close';
  closeBtn.setAttribute('aria-label', 'Close menu');
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', () => closeDropdown(nav));

  const dropdownContent = document.createElement('div');
  dropdownContent.className = 'nav-dropdown-content';

  overlay.append(closeBtn, dropdownContent);

  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMobileMenu(nav));

  nav.textContent = '';
  nav.append(topBar, greenBar, overlay, hamburger);
  nav.setAttribute('aria-expanded', 'false');

  if (navSections) {
    const mobileNav = document.createElement('div');
    mobileNav.className = 'nav-mobile-menu';

    const mobileNavList = navSections.querySelector('.default-content-wrapper > ul')
      || navSections.querySelector('ul');
    if (mobileNavList) {
      const mobileClone = mobileNavList.cloneNode(true);
      mobileClone.querySelectorAll(':scope > li').forEach((li) => {
        if (li.querySelector('ul')) {
          li.classList.add('nav-drop');
          li.setAttribute('aria-expanded', 'false');
          li.addEventListener('click', () => {
            const wasExpanded = li.getAttribute('aria-expanded') === 'true';
            li.setAttribute('aria-expanded', wasExpanded ? 'false' : 'true');
          });
        }
      });
      mobileNav.append(mobileClone);
    }

    if (navTools) {
      const toolsClone = navTools.cloneNode(true);
      toolsClone.className = 'nav-mobile-tools';
      mobileNav.append(toolsClone);
    }

    nav.append(mobileNav);
  }

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') closeDropdown(nav);
  });

  toggleMobileMenu(nav, isDesktop.matches);
  isDesktop.addEventListener('change', () => {
    toggleMobileMenu(nav, isDesktop.matches);
    closeDropdown(nav);
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
