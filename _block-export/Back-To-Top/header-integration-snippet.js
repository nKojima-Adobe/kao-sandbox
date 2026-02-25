/**
 * Header Integration Snippet for {BLOCK_FUNC}
 *
 * This snippet shows how to integrate the {BLOCK_FUNC} Web Component into a header block.
 * Add this code to your header block's decorate() function.
 *
 * STEP 1: Add import at the top of header.js:
 *
 *   import {BLOCK_FUNC} from '../../components/{BLOCK_NAME}/{BLOCK_NAME}.js';
 *
 * STEP 2: Add CSS import in header.css:
 *
 *   @import url("../../components/{BLOCK_NAME}/{BLOCK_NAME}.css");
 *
 * STEP 3: Add instantiation logic in header's decorate() function:
 */

// Append {BLOCK_NAME} button to document if it doesn't exist
const {BLOCK_VAR}Block = fragment.querySelector('.{BLOCK_CLASS}');
if ({BLOCK_VAR}Block && !document.querySelector('{BLOCK_NAME}')) {
  const {BLOCK_VAR} = new {BLOCK_FUNC}({BLOCK_VAR}Block);
  document.body.appendChild({BLOCK_VAR});
}
