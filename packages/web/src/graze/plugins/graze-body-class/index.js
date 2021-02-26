const name = 'graze-body-class'

export const server = {
  name,
  onRequest: () => ({}),
  Wrapper: ({ children }) => children,
  post: (_, markup) => {
    const regex = /class="djs-theme ([^"]*)"/i
    const matched = markup.match(regex)

    if (
      (matched && matched[1] === 'light') ||
      (matched && matched[1] === 'dark')
    ) {
      return markup.replace('<body>', `<body class="djs-theme ${matched[1]}">`)
    }

    return markup
  }
}
