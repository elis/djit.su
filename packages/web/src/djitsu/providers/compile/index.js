import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import { executeCode as _executeCode } from 'djitsu/compilers/javascript/executor'
import { BlockType } from 'djitsu/schema/block'
import useCompilers from './use-compilers'
import hash from 'object-hash'
import { loaderMaker } from 'djitsu/compilers/javascript'

const CompileProviderContext = createContext([{}, {}])

export const CompileProvider = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const loader = loaderMaker(props.loader || (() => {}))
  const [compile] = useCompilers(props.compilers, loader)

  const lastError = useRef()
  const errorListeners = useRef([])
  const lastCompiled = useRef()
  const compilerListeners = useRef([])

  const [lastCompiledHash, setLastCompiledHash] = useState()
  const lastCompiledHashRef = useRef()
  const getLastCompiledHash = () => lastCompiledHashRef.current
  useEffect(() => {
    lastCompiledHashRef.current = lastCompiledHash
  }, [lastCompiledHash])

  const runModules = async (modules, options) => {
    // if (loader) throw new Error('runModules is not supporting loader yet')
    const result = await compile({ js: modules }, options)
    return result?.js
  }

  const executeCode = useCallback(async (code, options) => {
    const executed = await _executeCode(code, {
      ...options,
      loader:
        typeof options.loader === 'function'
          ? async (...args) => {
              const result = await options.loader(...args)
              if (!result) return props.loader?.(...args)
              return result
            }
          : typeof props.loader === 'function'
          ? props.loader
          : () => false
    })
    return executed
  }, [])

  const onEditorChange = useCallback(
    async (data) => {
      const prevHash = getLastCompiledHash()
      const nextHash = hash({ blocks: data.blocks })

      if (nextHash === prevHash) {
        props.onChange?.({
          ...data,
          ...(lastError.current
            ? { error: lastError.current }
            : lastCompiled.current
            ? { compiled: lastCompiled.current }
            : {})
        })
      } else {
        lastError.current = null
        setLastCompiledHash(nextHash)
        const forCompile = packBlocksByLanguage(data.blocks)
        const bundle = await compile(forCompile)

        const compiled = bundle?.js

        const warning = compiled?.warnings?.find(
          ({ code }) => code === 'NAMESPACE_CONFLICT'
        )
        if (compiled && !compiled.error && !warning) {
          data.compiled = {
            generatedCode: compiled.generated?.code,
            exports: compiled.exports,
            imports: compiled.imports
          }
          lastCompiled.current = data.compiled
          announceCompilationData(data.compiled)
        } else if (compiled && compiled.error) {
          announceCompilationError(compiled.error)
          lastError.current = compiled.error
          data.compiled = {
            error: compiled.error
          }
        } else if (compiled && warning) {
          announceCompilationError(warning)
          lastError.current = warning
          data.compiled = {
            error: warning
          }
        }
        props.onChange?.(data)
      }
    },
    [lastCompiledHash]
  )

  // Initiate `onEditorChange` once on load to invoke compile
  useEffect(() => {
    if (props.data) onEditorChange(props.data)
  }, [])

  const addErrorListener = (subscriber) => {
    errorListeners.current = [...errorListeners.current, subscriber]
    if (lastError.current) subscriber(lastError.current)

    return () => {
      errorListeners.current = errorListeners.current.filter(
        (fn) => subscriber !== fn
      )
    }
  }
  const addCompiledListener = (subscriber) => {
    compilerListeners.current = [...compilerListeners.current, subscriber]
    if (lastCompiled.current) subscriber(lastCompiled.current)

    return () => {
      compilerListeners.current = compilerListeners.current.filter(
        (fn) => subscriber !== fn
      )
    }
  }

  const announceCompilationError = (error) => {
    errorListeners.current.map((fn) => fn?.(error))
  }
  const announceCompilationData = (compiled) => {
    compilerListeners.current.map((fn) => fn?.(compiled))
  }

  const noImplementation = async () => {
    throw new Error('This function is not configured')
  }

  const state = {
    data: props.data
  }

  const actions = {
    executeCode,
    onChange: onEditorChange,

    addErrorListener,
    addCompiledListener,
    runCode: noImplementation,
    runModules
  }
  const contextValue = [state, actions]

  return (
    <CompileProviderContext.Provider value={contextValue}>
      {props.children}
    </CompileProviderContext.Provider>
  )
}

const supportedCompilers = {
  js: {},
  md: 'markdown',
  mdx: 'extra-babel'
}

const packBlocksByLanguage = (blocks) => {
  if (!blocks || !blocks.length) return {}

  const codeBlocks = blocks.filter((block) => block.type === BlockType.LiveCode)

  const forCompilers = codeBlocks
    // Find all supported languages
    .filter(
      (block) =>
        block?.data?.data?.code?.options?.language in supportedCompilers
    )
    .map((block) => [
      block.data.data.code.options.language,
      {
        filename: block.data.tool?.options?.name,
        code: block.data.data.code.code
      }
    ])
    .reduce(
      (acc, [language, block]) => ({
        ...acc,
        [language]: [...(acc[language] || []), block]
      }),
      {}
    )

  return forCompilers
}

/**
 * Provides a compiler and execution environment
 * @returns {[CompileState, CompileActions]}
 */
export const useCompile = () => useContext(CompileProviderContext)

export default CompileProvider

/**
 * @typedef {Object} CompileState
 */

/**
 * @typedef {Object} CompileActions
 * @property {executeCode} executeCode Execute arbitrary code
 */

/**
 * @typedef {Object} CompileOptions
 * @property {Object} context Context to be provided to the invoked code
 * @property {string[]} imports Imports to preload for the invoked code
 * @property {importsLoader} loader Handle imports from the code
 */
