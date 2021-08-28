const objectPath = require('object-path')

const makeLessVars = themeSource => {
  const vars = {}
  const addVar = (varName, jsonPath) => {
    let value
    for (let x = 0; x < jsonPath.length; x++) {
      const path = jsonPath[x]
      value = objectPath.get(themeSource, path)

      if (value) {
        Object.assign(vars, { [varName]: value })
        return
      }
    }
  }

  addVar('component-background', [
    ['colors', 'editorGroup.background'],
    ['colors', 'editor.background']
  ])
  addVar('body-background', [
    ['colors', 'editor.background'],
    ['colors', 'editorGroup.background']
  ])
  addVar('layout-body-background', [
    ['colors', 'editor.background'],
    ['colors', 'editorGroup.background']
  ])
  addVar('layout-header-background', [
    ['colors', 'editorGroup.background'],
    ['colors', 'editor.background']
  ])
  addVar('layout-sider-background', [
    ['colors', 'sideBar.background'],
    ['colors', 'editorGroup.background'],
    ['colors', 'editor.background']
  ])
  addVar('normal-text', [
    ['colors', 'editor.foreground'],
    ['colors', 'editorGroup.foreground']
  ])
  addVar('layout-header-color', [
    ['colors', 'editorGroup.foreground'],
    ['colors', 'editor.foreground']
  ])
  addVar('layout-sider-color', [
    ['colors', 'sideBar.foreground'],
    ['colors', 'editorGroup.foreground'],
    ['colors', 'editor.foreground']
  ])

  return vars
}

module.exports = makeLessVars
