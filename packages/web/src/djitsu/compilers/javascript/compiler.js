import trim from 'lodash/fp/trim'
import flatten from 'lodash/fp/flatten'
import { walk } from 'estree-walker'

import { dirname, resolve } from './path'
import { useImports } from './use-imports'
import { allowedInstalled } from '.'

export const compile = async (files, options) => {
  const {
    getDependencies,
    context: contextOuter,
    loader,
    compilerOptions: userOptions
  } = options

  const context = {
    ...(contextOuter || {})
  }

  const modules = files.map(({ filename, code }) => ({
    name: filename,
    code,
    result: ''
  }))

  const installed = async (name, test) => {
    if (name in allowedInstalled) {
      if (test) return true
      const install = await allowedInstalled[name]()
      return install
    }

    if (await loader?.(name, test)) {
      const loaded = await loader(name)
      return loaded
    }

    if (test) return false
  }

  if (!modules?.length) return

  try {
    const compiled = await bundler(
      modules,
      context,
      installed,
      userOptions || {},
      getDependencies
    )
    const serialized = compiled
    return serialized
  } catch (error) {
    console.log('ERROR WITH COMPILE:', error)
    const compiled = {
      error
    }
    return compiled
  }
}

const bundler = async (
  input,
  context = {},
  installed,
  userOptions = {},
  getDeps
) => {
  const composed = transformInput(input, getDeps)
  const errored = composed.find(({ error }) => error)
  if (errored?.error) {
    const error = errored?.error
    if (errored.filename) {
      const byFilename = input.find(({ name }) => name === errored.filename)
      if (byFilename) {
        return {
          error: input.map((f) => {
            if (f.name === errored.filename) {
              return { ...f, error }
            }
            return f
          })
        }
      }

      const byCode = input.findIndex(({ code }) => errored.code === code)

      if (byCode >= 0) {
        return {
          error: input.map((f, i) => {
            if (i === byCode) {
              return { ...f, error }
            }
            return f
          })
        }
      }
    }
    return { ...errored }
  }

  const modules = composed.map((mod) => ({
    name: mod.filename,
    ...mod
  }))

  const warnings = []

  const options = {
    ast: true,
    sourceType: 'module',
    presets: ['react'],
    retainLines: true,
    ...(userOptions || {})
  }

  const modified = [
    {
      filename: 'actual_main.js',
      name: 'actual_main.js',
      value:
        options?.sourceType === 'module'
          ? modules.find(({ name }) => name === 'index.js')
            ? `export * from './index.js'`
            : modules
                .map((mod) => {
                  return `export * from './${mod.filename}'`
                })
                .join('\n')
          : modules.map((mod) => mod.code).join('\n')
    },
    ...modules
  ]
  const Babel = getDeps?.()?.babel // window.Babel
  if (!Babel) {
    return
  }
  // Tranform ES6/jsx code to something we can evaluate
  const transformed = modified.map((mod) => {
    // Transforms the input code according to options
    if (!mod.ast) {
      const output = Babel.transform(mod.value, {
        filename: mod.filename,
        ...options
      })
      mod.code = output.code
      mod.ast = output.ast
    }

    // Generates code
    const transformed = Babel.transformFromAst(mod.ast.program, mod.code, {
      filename: mod.filename
    })

    return { ...mod, transformed }
  })

  const inputOptions = {
    output: {
      sourcemap: true
    },
    plugins: [customImporter(transformed)],

    onwarn(warning) {
      // console.log('warning?', warning)
      warnings.push(warning)
      console.group(warning.loc ? warning.loc.file : warning.toString())
      console.warn(warning.message)
      if (warning.frame) {
        console.log(warning.frame)
      }
      if (warning.url) {
        console.log(`See ${warning.url} for more information`)
      }
      console.groupEnd()
    }
  }
  const codeSplitting = true
  const rollup = getDeps?.()?.rollup // window.rollup

  if (modules.length === 0) {
    return
  }
  if (codeSplitting) {
    inputOptions.input = transformed
      .filter((module, index) => index === 0 || module.entry)
      .map((module) => module.filename)
  } else {
    inputOptions[supportsInput(rollup.VERSION) ? 'input' : 'entry'] =
      'actual_main.js'
  }

  const bundle = await rollup.rollup(inputOptions)

  const generatorOptions = {
    format: 'cjs',
    name: 'myBundle', // should be document name
    amd: { id: '' },
    globals: {}, // check how globals works here...
    sourcemap: true
  }

  const generated = await bundle.generate(generatorOptions)

  const { code, imports } = generated.output[0]

  const resolvedImports = await useImports(imports, installed, allowedInstalled)

  const layContext = Object.keys(context)
  const layValues = Object.values(context)

  const _____t = new Function(...['require', 'exports', ...layContext, code])

  const exported = {}

  const result = {
    error: null,
    exports: exported,
    warnings,
    imports,
    generated: generated.output[0]
  }

  const moduleById = transformed.reduce((acc, module) => {
    return { ...acc, [module.name]: module }
  }, {})

  const requirer = (mod) => {
    const httpMod = mod.replace(/^\.\//, '')

    if (mod in resolvedImports) return resolvedImports[mod]
    if (httpMod in resolvedImports) return resolvedImports[httpMod]
    if (mod in context) return context[mod]

    const fname = mod.replace(/^\.\//, '')
    if (fname in moduleById) return {}

    if (!mod || !mod?.length) {
      result.error = {
        message: 'No name for import was provided',
        name: 'MissingImport'
      }
      return
    }
    const resulted = import(mod)
    return resulted.catch((error) => {
      result.error = error
    })
  }

  const invk = async () => {
    try {
      const res = await _____t(...[requirer, exported, ...layValues])
      return res
    } catch (error) {
      result.error = error
      result.exports = null
    }
  }

  try {
    if (!_____t) throw new Error('Compilation failed')
    await invk()
    return result
  } catch (err) {
    return { ...result, error: err, exports: null }
  }
}

const customImporter = (modules) => {
  if (!modules[0]) {
    return
  }
  const moduleById = modules.reduce((acc, module) => {
    return { ...acc, [module.name]: module }
  }, {})

  return {
    resolveId(importee, importer) {
      if (!importer) return importee
      if (importee[0] !== '.') return false

      let resolved = resolve(dirname(importer), importee).replace(/^\.\//, '')
      if (resolved in moduleById) return resolved

      resolved += '.js'
      if (resolved in moduleById) return resolved

      throw new Error(`Could not resolve '${importee}' from '${importer}'`)
    },
    load: function (id) {
      return moduleById[id].code
    }
  }
}

/*

blocks = [
  {
    filename: 'main.js',
    value: 'import ... export ...',
    result: '<some code> ... ',
  }
  -->
  {
    filename: 'main.js',
    value: `import Default, { ...named_exports } from '__chunk__main.js'
    import __result from '__result__main.js'

    export default Default
    export { ...named_exports }
    export { __result }
    `
  },
  {
    filename: '__chunk__main.js',
    value: 'import ... export ...'
  },
  {
    filename: '__result__main.js',
    value: `import Default, { ...named_exports } from '__chunk__main.js'
    const result = (<some code> ...)
    export default result
    `
  }
]

*/

const transformInput = (input, getDeps) => {
  if (!Array.isArray(input))
    throw new Error('Input expected to be array of objects')

  const files = input.map(sanitizeInput).map(buildFileMap)
  const modules = flatten(files.map(buildModuleFiles(getDeps)))

  return modules
}

const collectExports = (ast) => {
  const exports = []

  walk(ast, {
    enter: function (node) {
      // some code happens
      if (node.type === 'ExportNamedDeclaration') {
        if (node.declaration?.type === 'VariableDeclaration') {
          if (node.declaration?.declarations?.length) {
            node.declaration.declarations.map((dec) =>
              exports.push(dec?.id?.name)
            )
          }
        } else if (
          ['ClassDeclaration', 'FunctionDeclaration'].indexOf(
            node.declaration?.type
          ) >= 0
        ) {
          exports.push(node.declaration.id.name)
        } else if (node.specifiers?.length) {
          node.specifiers.map((sn) => {
            if (sn.type === 'ExportSpecifier') {
              exports.push(sn.exported.name)
            }
          })
        }
      } else if (node.type === 'ExportDefaultDeclaration') {
        exports.push('default')
      }
    }
  })

  return exports
}

const chunkTransformer = (filename, chunkCode, options = {}, getDeps) => {
  try {
    const Babel = getDeps?.()?.babel // window.Babel
    if (!Babel) {
      return {}
    }
    const output = Babel.transform(chunkCode, {
      filename,
      ...options
    })
    return { output }
  } catch (error) {
    return { error }
  }
}

const buildModuleFiles = (getDeps) => ({ ctype, content = [] }) => {
  const hasWrapper = (ctype & CTYPE.Wrapper) === CTYPE.Wrapper
  const hasChunk = (ctype & CTYPE.Chunk) === CTYPE.Chunk
  // const hasResult = (ctype & CTYPE.Result) === CTYPE.Result

  const wrapper = hasWrapper && content.find((f) => f.ctype === CTYPE.Wrapper)
  const chunk = hasChunk && content.find((f) => f.ctype === CTYPE.Chunk)
  // const result = hasResult && content.find((f) => f.ctype === CTYPE.Result)

  const options = {
    ast: true,
    sourceType: 'module',
    presets: ['react'],
    retainLines: true,
    sourceMaps: 'both'
  }

  const modules = []

  if (hasChunk) {
    const chunkCode = chunk.value

    const { error, output } = chunkTransformer(
      chunk.filename,
      chunkCode,
      options,
      getDeps
    )

    if (error) {
      return [
        {
          code: chunk.value,
          error,
          filename: chunk.filename,
          chunkCode,
          errorName: error.name,
          errorMessage: error.message,
          errorCode: error.code
        }
      ]
    }
    if (output) {
      const exports = collectExports(output.ast)
      modules.push({
        ...chunk,
        ast: output.ast,
        code: output.code,
        exports,
        // convenience object
        _exports: exports?.reduce(
          (acc, c) => ({ ...acc, [c]: chunk.filename }),
          {}
        )
      })
    }
  }
  if (hasWrapper) {
    const chunkModule = modules.find(({ type }) => type === 'chunk')
    const chunkNamed = chunkModule?.exports?.filter((e) => e !== 'default')
    const chunkDefault = chunkModule?._exports?.default

    let wrapperCode = chunkModule
      ? `import ${chunkDefault ? 'Chunk' : ''}${
          chunkDefault && chunkNamed ? ', ' : ''
        }${chunkNamed ? `{ ${chunkNamed.join(', ')} }` : ''} from './${
          chunkModule.filename
        }'`
      : ''

    wrapperCode += `\n${chunkDefault ? 'export default Chunk' : ''}` // +
    // `\n${chunkNamed ? `export { ${chunkNamed.join(', ')} }` : ''}`
    const Babel = getDeps?.()?.babel // window.Babel

    const output = Babel.transform(wrapperCode, {
      filename: wrapper.filename,
      ...options
    })

    modules.push({
      ...wrapper,
      value: wrapperCode,
      ast: output.ast,
      code: output.code,
      exports: [
        ...(chunkModule?.exports || [])
        // ...(hasResult ? ['result'] : [])
      ]
    })
  }

  return modules
}

const CTYPE = {
  None: 0x0,
  Chunk: 0x1,
  Result: 0x2,
  Wrapper: 0x4
}

const buildFileMap = ({ code, filename, result }) => {
  const content = []
  let ctype = CTYPE.None
  if (code) {
    content.push({
      filename, //: !result ? filename : `__chunk__${filename}`,
      type: 'chunk',
      value: code,
      ctype: CTYPE.Chunk
    })
    ctype |= CTYPE.Chunk
  }
  if (result) {
    content.push({
      filename: `__result__${filename}`,
      type: 'result',
      value: result,
      ctype: CTYPE.Result
    })

    ctype |= CTYPE.Result
  }
  return { ctype, content }
}

const supportedExtensions = ['mdx', 'js', 'jsx', 'ts', 'tsx']

const namer = () => Math.floor(Math.random() * 10e10).toString(32) + '.js'
const sanitizeInput = ({ code = '', name = '', result = '' }) => ({
  code: trim(code),
  filename:
    trim(
      supportedExtensions.indexOf(name.split('.').pop()) > -1
        ? name
        : name
        ? name + '.js'
        : ''
    ) || namer(),
  result: trim(result)
})

export const supportsInput = (version) => isRollupVersionAtLeast(version, 0, 48)

export const supportsCodeSplitting = (version) =>
  isRollupVersionAtLeast(version, 1, 0)

const isRollupVersionAtLeast = (version, major, minor) => {
  if (!version) return true
  const [currentMajor, currentMinor] = version.split('.').map(Number)
  return (
    currentMajor > major || (currentMajor === major && currentMinor >= minor)
  )
}

export default compile
