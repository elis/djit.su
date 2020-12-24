const name = 'graze-prettier'

export const server = {
  name,
  onRequest: () => ({}),
  Wrapper: ({ children }) => children,
  post: ({ options: { beautify: userOptions } }, markup) => {
    const beautify = require('js-beautify').html

    const options = {
      indent_size: 1,
      ...userOptions
    }

    const output = beautify(markup, options)
    return output
  }
}
