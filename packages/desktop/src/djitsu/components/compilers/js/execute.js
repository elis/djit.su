export default function execute(code, options = {}) {
  const layContext = Object.keys(options.context || {})
  const layValues = Object.values(options.context || {})

  const localContext = {
    require: dep => {
      if (dep === 'react') return require('react')
      if (dep === 'antd') return require('antd')
    },
    exports: {}
  }

  const toExec = `${code}`
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const fn = new Function(...['require', 'exports', ...layContext, toExec])

  let result = null
  try {
    result = fn(...[localContext.require, localContext.exports, ...layValues])
  } catch (error) {
    console.error('Error executing function:', error)
    // TODO: Handle Generic error
  }

  return localContext.exports
}
