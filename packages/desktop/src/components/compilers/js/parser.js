import { Parser as aParser } from 'acorn'

export default function prase (sourceCode, options = {}) {
  const JSXParser = aParser.extend(
    require("acorn-jsx")()
  )

  return JSXParser.parse(sourceCode, options);
}
