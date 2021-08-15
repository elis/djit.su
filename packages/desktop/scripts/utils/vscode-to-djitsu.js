const objectPath = require('object-path')

const makeLessVars = themeSource => {
  const vars = {}
  const addVar = (varName, jsonPath) => {
    const value = objectPath.get(themeSource, jsonPath)
    if (value) Object.assign(vars, { [varName]: value })
  }

  addVar('component-background', ['colors', 'editorGroup.background'])
  addVar('body-background', ['colors', 'editor.background'])
  addVar('layout-body-background', ['colors', 'editor.background'])
  addVar('layout-header-background', ['colors', 'editorGroup.background'])
  addVar('layout-sider-background', ['colors', 'sideBar.background'])
  addVar('normal-text', ['colors', 'editor.forground'])
  addVar('layout-header-color', ['colors', 'editorGroup.forground'])
  addVar('layout-sider-color', ['colors', 'sideBar.forground'])

  return vars
}

module.exports = makeLessVars
