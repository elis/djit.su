import { Parser as aParser } from 'acorn'

export default function prase (sourceCode, _options = {}) {
  const JSXParser = aParser.extend(
    require("acorn-jsx")()
  )

  const defaultOptions = {
    ecamaVersion: '2020'
  }

  const options = Object.assign({}, defaultOptions, _options)

  return JSXParser.parse(sourceCode, options);
}
