const objectPath = require('object-path')
const { convertTheme } = require('monaco-vscode-textmate-theme-converter')
const theme = process.argv[2] || 'djitsu-dark-theme'
const themeJson = require('./' + theme + '/monaco.json')

const output = JSON.stringify(themeJson)
process.stdout.write(output)
