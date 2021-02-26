// import dependenciesLoader, {
//   clientLoader
// } from 'djitsu/components/utils/dependencies-loader'
// import { parseNotebookURI } from 'djitsu/utils/notebook'

import JavascriptCompiler from './compiler'
import execute from './executor'

export const compiler = async (files, options = {}) => {
  const { loader } = options
  // const deps = await dependenciesLoader(dependencies)
  const compiled = await JavascriptCompiler(files, {
    ...options,
    // getDependencies: () => deps,
    getDependencies: () => ({}),
    loader
  })

  return compiled
}

export const extensions = ['js']
const dependencies = {
  babel: {
    client: async () => {
      const src = 'https://unpkg.com/@babel/standalone/babel.min.js'
      try {
        await clientLoader(src)
        const babel = window.Babel
        return babel
      } catch (error) {
        console.log('Unable to load babel on client:', error)
        throw new Error(
          `Unable to load Babel as dependency via "${src}" — Error provided: ${error}`
        )
      }
    },
    server: async () => {
      console.log('load babel on server')
    }
  },
  rollup: {
    client: async () => {
      const src = 'https://unpkg.com/rollup/dist/rollup.browser.js'
      try {
        await clientLoader(src)
        const rollup = window.rollup
        return rollup
      } catch (error) {
        console.log('Unable to load rollup on client:', error)
        throw new Error(
          `Unable to load Rollup as dependency via "${src}" — Error provided: ${error}`
        )
      }
    },
    server: async () => {
      console.log('load babel on server')
    }
  }
}

export const importHandlerMaker = ({ isNotebook, getNotebook }) => async (
  name,
  test
) => {
  // const matched = parseNotebookURI(name)
  const matched = false
  if (test && matched) {
    const exists = await isNotebook({
      username: matched.username,
      notebookName: matched.notebook,
      version: matched.version
    })

    return exists
  } else if (matched) {
    const notebook = await getNotebook({
      username: matched.username,
      notebookName: matched.notebook,
      version: matched.version
    })

    return {
      type: 'notebook',
      notebook
    }
  }
}

export const loaderMaker = (importLoader) => {
  if (typeof importLoader !== 'function')
    throw new Error('importLoader is required to be a function')

  const loader = async (name, test, attempts = 5) => {
    const result = await importLoader(name, test)
    if (test) return result

    if (result?.type === 'notebook') {
      if (!result.notebook && --attempts) return loader(name, test, attempts)
      const executed = await executes(result.notebook.compiled.code, {
        imports: result.notebook.compiled.imports
      })

      const ret = Object.assign({}, executed.exports, {
        $blocks: result.notebook.blocks,
        $meta: result.notebook.meta,
        $properties: result.notebook.properties,
        $notebookId: result.notebook.notebookId
      })
      return ret
    }
    return result
  }

  const executes = async (code, opts) => {
    const result = await execute(code, {
      ...opts,
      loader
    })
    return result
  }

  return loader
}

export const allowedInstalled = {
  react: () => import('react'),
  React: () => import('react'),
  'react-dom': () => import('react-dom'),
  'prop-types': () => import('prop-types'),
  'react-router': () => import('react-router'),
  'react-router-dom': () => import('react-router-dom'),
  lodash: () => import('lodash'),
  antd: () => import('antd'),
  '@ant-design/icons': () => import('@ant-design/icons'),
  '@emotion/styled': () => import('styled-components'),
  'styled-components': () => import('styled-components')
}
export default {
  importHandlerMaker,
  allowedInstalled,
  loaderMaker,
  compiler,
  extensions
}
