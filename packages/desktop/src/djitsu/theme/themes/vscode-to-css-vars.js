const theme = process.argv[2] || 'djitsu-dark-theme'
const { colors } = require(`./${theme}/theme.json`)

const kebabize = str => {
  return str
    .split('')
    .map((letter, idx) => {
      return letter.toUpperCase() === letter
        ? `${idx !== 0 ? '-' : ''}${letter.toLowerCase()}`
        : letter
    })
    .join('')
}

const extractVars = () => {
  let vars = ':root {\n'
  Object.entries(colors).forEach(item => {
    let varName = ''
    const varNames = item[0].split('.')
    varNames.forEach(item => {
      varName += `-${kebabize(item)}`
    })
    const fullVar = `-${varName}: ${item[1]};\n`
    vars += fullVar
  })
  vars += '}'
  return vars
}

process.stdout.write(extractVars())
