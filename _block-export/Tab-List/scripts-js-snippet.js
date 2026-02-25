// ============================================================================
// Tab-List auto-insertion — from scripts/scripts.js → buildTabs()
// ============================================================================
// This function auto-creates a {BLOCK_NAME} block when consecutive tab-panel
// sections are found without a preceding {BLOCK_NAME} block.
// Add this to your project's main scripts.js (or equivalent) if you want
// automatic tab-list creation from section metadata.
// ============================================================================

/**
 * Auto-creates {BLOCK_NAME} blocks for consecutive {BLOCK_PANEL} sections.
 * Called during page decoration (decorateMain).
 *
 * How it works:
 * 1. Iterates through all sections in main
 * 2. Reads 'tab-label' from section-metadata
 * 3. When the first tab-panel in a consecutive group is found,
 *    checks if a {BLOCK_NAME} block already exists before it
 * 4. If not, creates a new {BLOCK_NAME} block and inserts it before the first tab-panel
 */
function buildTabs(main) {
  function getTabLabel(section) {
    const metadataBlock = section.querySelector('.section-metadata');
    const metadata = metadataBlock ? readBlockConfig(metadataBlock) : {};
    return metadata['tab-label'];
  }

  for (let i = 0; i < main.children.length; i += 1) {
    const section = main.children[i];
    const tabLabel = getTabLabel(section);
    const previousSection = i > 0 ? main.children[i - 1] : null;
    const previousTabLabel = previousSection ? getTabLabel(previousSection) : null;

    if (tabLabel && !previousTabLabel) {
      // found first tab panel of a list of consecutive tab panels
      // create a tab list block if non exists as last child
      let previousBlock = previousSection?.lastElementChild;
      if (previousBlock?.matches('.section-metadata')) previousBlock = previousBlock.previousElementSibling;
      if (!previousBlock?.matches('.{BLOCK_NAME}')) {
        const tabListBlock = document.createElement('div');
        tabListBlock.className = '{BLOCK_NAME} block';
        const newSection = document.createElement('div');
        newSection.className = 'section';
        newSection.appendChild(tabListBlock);
        section.before(newSection);
      }
    }
  }
}

// Call buildTabs(main) inside your decorateMain() function:
// export async function decorateMain(main) {
//   ...
//   buildTabs(main);
//   ...
// }
