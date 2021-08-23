const { convertTheme } = require('monaco-vscode-textmate-theme-converter')

const makeMonaco = themeSource => {
  const { type } = themeSource
  const outputTheme = convertTheme(themeSource)
  outputTheme.inherit = type !== 'light'
  return outputTheme
}

module.exports = themeSource => makeMonaco(themeSource)
