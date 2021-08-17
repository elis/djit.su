const kebabCase = require('lodash/fp/kebabCase')

const extractVars = themeSource => {
  const { colors } = themeSource
  const vars = [':root {']
  Object.entries(colors).forEach(item => {
    let varName = ''
    const varNames = item[0].split('.')
    varNames.forEach(item => {
      varName += `-${kebabCase(item)}`
    })
    const fullVar = `  -${varName}: ${item[1]};`
    vars.push(fullVar)
  })

  vars.push('}')
  return vars.join('\n')
}

module.exports = extractVars
