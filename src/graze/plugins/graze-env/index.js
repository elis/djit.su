import serialize from 'serialize-javascript' // Safer stringify, prevents XSS attacks
const name = 'graze-env'

export const server = {
  name,
  onRequest: () => ({}),
  output: ({ options: { re } }) => {
    const sorted = Object.entries(process.env)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .reduce((acc, [n, v]) => ({ ...acc, [n]: v }), {})

    return `
    <script>(window.env = ${serialize(
      Object.entries(sorted)
        .filter(([name]) => name.match(re || /^RAZZLE/))
        .reduce((a, [n, v]) => ({ ...a, [n]: v }), {}),
      { unsafe: true, isJSON: true, spaces: 2 }
    )})</script>`
  }
}

export const client = {
  name,
  onLoad: () => ({
    test: 'TESTING'
  }),
  Wrapper: ({ children }) => {
    return children
  }
}

export const app = {
  onLoad: () => ({}),
  Wrapper: ({ children }) => children,
  expose: () => {
    return { miko: 'piko' }
  }
}
