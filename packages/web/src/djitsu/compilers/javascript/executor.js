import { fromPairs } from 'lodash'
import { allowedInstalled } from '.'
import { useImports } from './use-imports'

const LIMIT_INTERNAL_ITERATIONS = 42

/**
 * Execute a given code and return its resulting module output
 *
 * @param {string} code Code to execute
 * @param {{ context: Object, imports: string[] }} options
 * @returns {Promise<Object>} The compiled module
 */
export const execute = async (code, { context = {}, imports = [], loader }) => {
  const layContext = Object.keys(context)
  const layValues = Object.values(context)
  const collectedImports = {}

  const imported = fromPairs(
    await Promise.all(
      imports
        .filter((mod) => mod in allowedInstalled)
        .map(async (mod) => [mod, await allowedInstalled[mod]()])
    )
  )

  const importies = await useImports(imports, loader, allowedInstalled)

  console.groupEnd()
  const fn = new Function(
    ...['require', 'module', 'exports', ...layContext, code]
  )

  const exported = {}

  const result = {
    error: null,
    exports: exported,
    module: {}
  }

  const resolvedImports = {}
  const moduleById = {}

  const newImports = { collection: [] }
  const newFoundImports = new Map()
  const requestedImports = new Set()

  const requirer = (mod) => {
    if (mod in imported) return imported[mod]
    if (mod in resolvedImports) return resolvedImports[mod]
    if (mod in importies) return importies[mod]
    if (mod in context) return context[mod]
    if (mod in collectedImports) return collectedImports[mod]

    if (newFoundImports.has(mod)) return newFoundImports.get(mod)

    const fname = mod.replace(/^\.\//, '')
    if (fname in moduleById) return {}

    if (!mod || !mod?.length) {
      result.error = {
        message: 'No name for import was provided',
        name: 'MissingImport'
      }
      return
    }

    const run = true
    if (run) {
      const remoteName = mod.replace(/^([.][/])/, '')
      if (remoteName in importies) return importies[remoteName]

      const loaderPromise = (async () => {
        requestedImports.add(mod)
        const loaded = await loader(mod)
        if (loaded) newFoundImports.set(mod, loaded)

        return loaded
      })()

      newImports.collection.push(loaderPromise)
      return loaderPromise
    }

    const resulted = import(mod)
    return resulted.catch(async (error) => {
      result.error = error
    })
  }

  let internalCounter = 0

  const invk = async (last) => {
    try {
      const res = await fn(...[requirer, result.module, exported, ...layValues])
      return res
    } catch (error) {
      if (newImports.collection.length) {
        const remainingImports = [...requestedImports].filter(
          (name) => !newFoundImports.has(name)
        )

        if (!remainingImports.length && last) {
          return result
        } else if (!remainingImports.length && !last) {
          return invk(true)
        } else if (remainingImports.length) {
          if (!internalCounter || internalCounter < LIMIT_INTERNAL_ITERATIONS) {
            await Promise.all(newImports.collection)
            internalCounter = (internalCounter || 0) + 1
            return invk()
          } else {
            console.error(
              `Reached the limit of internal iterations — LIMIT_INTERNAL_ITERATIONS=${LIMIT_INTERNAL_ITERATIONS}`
            )
          }
        }
      }
      result.error = error
      result.exports = null
      return result
    }
  }

  try {
    if (!fn) throw new Error('Compilation failed')
    await invk()
    return result
  } catch (error) {
    return { ...result, error, exports: null }
  }
}

/** @type {executeCode} */
export const executeCode = async (code, { context, imports, loader }) => {
  const capture = '__exports__exports'
  const codeNext = `${code}
  ${capture}(exports, module)
  `

  const captured = {}
  const _context = {
    ...(context || {}),
    [capture]: (capt, mod) =>
      Object.assign(captured, capt || mod?.exports || mod)
  }

  const result = await execute(codeNext, {
    loader,
    context: _context,
    imports: imports
  })

  if (result.error) throw result.error

  const eventual = Object.keys(captured).length
    ? captured
    : result.module?.exports || result.module

  return eventual
}

export default execute

/**
 * @callback executeCode
 * @param {string} code The code to be executed
 * @param {Partial<CompileOptions>} options The options
 */
