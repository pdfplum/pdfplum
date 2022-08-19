import remarkPresetLintMarkdownStyleGuide from 'remark-preset-lint-markdown-style-guide'
import remarkToc from 'remark-toc'

const remarkConfig = {
  settings: {
    bullet: '-', // Use `-` for list item bullets (default)
    incrementListMarker: false,
    fences: true,
    listItemIndent: 'mixed',
    // See <https://github.com/remarkjs/remark/tree/main/packages/remark-stringify> for more options.
  },
  plugins: [
    remarkPresetLintMarkdownStyleGuide,
    // Generate a table of contents in `## Contents`
    [remarkToc, {heading: 'contents'}],
  ]
}

export default remarkConfig
