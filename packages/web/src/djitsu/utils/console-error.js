export const consoleError = (error) => {
  console.groupCollapsed(`Notebook Error: ${error}`)
  console.error(error)
  console.groupEnd()
}

export default consoleError
