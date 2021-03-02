export default function execute (code, options = {}) {


  const layContext = Object.keys(options.context || {})
  const layValues = Object.values(options.context || {})

  console.log('>>> Executing Code', {code, layContext, layValues})
  const localContext = {
    require: (loadeWhatte) => {
      console.log('loading what?', loadeWhatte)
      if (loadeWhatte === 'react') return require('react')
    },
    exports: {}
  }


  const toExec = `
  console.log('THIS IS GONNA ROCK!')
  ${code}`
  const fn = new Function(...['require', 'exports', ...layContext, toExec])
  console.log('>>> Compiled function:', fn)

  let result = null
  try {
    result = fn(...[localContext.require, localContext.exports, ...layValues])
    console.log('>>> Executed function:', result, localContext)
  } catch (error) {
    console.log('Error executing function:', error)
    // TODO: Handle Generic error
  }

  return result
}
