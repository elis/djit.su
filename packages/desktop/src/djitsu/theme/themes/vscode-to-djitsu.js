const objectPath = require('object-path')

const theme = process.argv[2] || 'djitsu-dark-theme'
const themeJson = require('./' + theme + '/theme.json')
// console.log('cool. s', theme)

// https://github.com/ant-design/ant-design/blob/master/components/style/themes/default.less

const vars = {

// // -------- Colors -----------
// @primary-color: @blue-6;
// @info-color: @primary-color;
// @success-color: @green-6;
// @processing-color: @blue-6;
// @error-color: @red-5;
// @highlight-color: @red-5;
// @warning-color: @gold-6;
// @normal-color: #d9d9d9;
// @white: #fff;
// @black: #000;
// // Background color for `<body>`
// @body-background: #fff;
// // Base background color for most components
// @component-background: #fff;
}
const addVar = (varName, jsonPath) => {
  // console.log('objectPath(themeJson, jsonPath):', jsonPath, objectPath.get(themeJson, jsonPath))
  const value = objectPath.get(themeJson, jsonPath)
  value && Object.assign(vars, { [varName]: value })
}

// addVar('primary-color', ['colors', 'terminal.ansiBrightGreen'])
addVar('component-background', ['colors', 'editorGroup.background'])
addVar('body-background', ['colors', 'editor.background'])
addVar('layout-header-background', ['colors', 'editorGroup.background'])
addVar('layout-sider-background', ['colors', 'sideBar.background'])
addVar('normal-text', ['colors', 'editor.forground'])
addVar('layout-header-color', ['colors', 'editorGroup.forground'])
addVar('layout-sider-color', ['colors', 'sideBar.forground'])
// console.log('vars:', vars)
process.stdout.write(Object.entries(vars).map(([n, v]) => `--modify-var="${n}=${v}"`).join(' '))
