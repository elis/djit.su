export default function execute (code, options = {}) {
  const layContext = Object.keys(options.context || {})
  const layValues = Object.values(options.context || {})

  const localContext = {
    require: (loadeWhatte) => {
      console.log('💐 loading what?', loadeWhatte)
      if (loadeWhatte === 'react') return require('react')
    },
    exports: {}
  }


  const toExec = `${code}`
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
