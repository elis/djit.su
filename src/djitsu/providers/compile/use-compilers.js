export const useCompilers = (compilers, importHandler) => {
  const importLoader = async (item, test) => {
    return importHandler?.(item, test)
  }

  const compilerOptions = {}

  const languageCompilers = new Map()

  const compiler = (language) => {
    if (!languageCompilers.has(language)) {
      const cmplr = compilers.find(
        ({ extensions }) => extensions?.indexOf(language) >= 0
      )
      if (cmplr) {
        languageCompilers.set(language, cmplr)
      }
    }
    const cmplr = languageCompilers.get(language)
    return cmplr?.compiler
  }

  const compile = async (items, options = {}) => {
    const _loader =
      typeof options.loader === 'function'
        ? async (...args) => {
            const result = await options.loader(...args)
            if (!result) return importLoader(...args)
            return result
          }
        : importLoader

    const compiled = (
      await Promise.all(
        Object.entries(items).map(async ([language, files]) => [
          language,
          await compiler(language)?.(files, {
            ...compilerOptions,
            ...options,
            loader: _loader
          })
        ])
      )
    ).reduce(
      (acc, [language, compiled]) => ({ ...acc, [language]: compiled }),
      {}
    )
    return compiled
  }
  return [compile]
}

export default useCompilers
