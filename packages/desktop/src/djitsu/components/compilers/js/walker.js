import { walk } from 'estree-walker'
import { Parser } from 'acorn'

export const walkCode = (sourceCode, options = {}) => {
  const MyParser = Parser.extend(
    require("acorn-jsx")()
  )
  const ast = MyParser.parse(sourceCode, options); // https://github.com/acornjs/acorn
  console.log('=-=-= generated AST:', ast)

  // walk(ast, {
  //   enter(node, parent, prop, index) {
  //     console.log('>> entering node:', {node, parent, prop, index})
  //     // some code happens
  //   },
  //   leave(node, parent, prop, index) {
  //     console.log('<< exiting node:', {node, parent, prop, index})
  //     // some code happens
  //   }
  // });
  return ast
}
