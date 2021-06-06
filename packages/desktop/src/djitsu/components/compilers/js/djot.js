import merge from 'lodash/fp/merge'
import parse from './parser'
import execute from './execute'
import compile from './compile'

import { babelConfig } from './settings'

export default
async function
djotCompiler (source, options = {}) {
  const lines = djotLines(source)

  const context = {
    results: []
  }
  const compiled = await compile(lines.compiled, merge({}, babelConfig))
  const result = await execute(compiled.compiled, { context })

  const results = context.results?.length
    ? lines.lines.map(([line, ...rest], lineIndex) => [({
      ...line,
      result: lines.resultMap.has(lineIndex) ? context.results[lines.resultMap.get(lineIndex)] : null
    }), ...rest])
    : lines.lines
  return {
    ...lines,
    output: results
  }
}

export function djotLines (source, options) {
  let ast
  try {
    ast = parse(source, { sourceType: 'module', ...options })
  } catch (error) {
    return {
      parserErrorMessage: `${error}`
    }
  }

  const output = {
    ast,
    parserErrorMessage: ''
  }


  if (!ast && ast.type !== 'Program') {
    return {
      ...output,
      compilerErrorMessage: 'Unknown AST Type'
    }
  } else if (!ast.body.length) {
    return {
      ...output,
      compilerErrorMessage: 'No Program Body'
    }
  } else {
    const lines = []
    const lineMap = new Map()

    let currentPos = 0

    let resultSource = ''
    let line = []


    for (let nodeIndex = 0; nodeIndex < ast.body.length; ++nodeIndex) {
      const node = ast.body[nodeIndex]
      const prev = source.substr(currentPos, node.start - currentPos)

      currentPos = node.end

      const body = source.substr(node.start, node.end - node.start)
      const prevNLs = (prev.match(/\n/g) || []).length
      const bodyNLs = (body.match(/\n/g) || []).length

      if (prevNLs) {
        const hasLine = line.length
        if (hasLine) {
          lines.push(line)
          line = []
        }
        for (let i = 0; i < prevNLs - (hasLine ? 1 : 0); ++i) {
          lines.push([{ newline: true, line: i, total: prevNLs - (hasLine ? 1 : 0) }])
        }
      }

      const lineStart = lines.length
      const resultNode = {}

      const lineNode = {
        sourceNode: node,
        resultNode,
        lineStart,
        lineEnd: lineStart + bodyNLs
      }

      if (!bodyNLs) {
        line.push(lineNode)
      } else {
        lineNode.lines = bodyNLs
        for (let i = 0; i < bodyNLs; ++i) {
          lines.push([{ ...lineNode, line: i, first: !i }])
        }
        if (!body.match(/\n$/)) {
          line.push({ ...lineNode, line: bodyNLs, last: true })
        }
      }

      const resultValues = {}
      if (prev) {
        resultSource += prev
      }

      resultNode.start = resultSource.length
      switch (node.type) {
        case 'ExpressionStatement':
          resultNode.body = `(() => {results[${nodeIndex}] = ${body.replace(/[;]$/, '')};})();\n`
          resultSource += resultNode.body

          lineMap.set(lineStart, nodeIndex)
          break
        default:
          resultSource += body
      }
      resultNode.end = resultSource.length
    }


    if (line.length) {
      lines.push([...line])
      line = []
    }
    if (currentPos < source.length) {
      const bodyNLs = (source.substr(currentPos).match(/\n/g) || []).length
      for (let i = 0; i < bodyNLs; ++i) {
        lines.push([{ newline: true, line: i, lines: bodyNLs }])
      }
    }

    return {
      ...output,
      lines,
      resultMap: lineMap,
      compiled: resultSource
    }
  }
}
