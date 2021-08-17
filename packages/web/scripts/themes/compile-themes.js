const fs = require('fs')
const path = require('path')
const YAML = require('yaml')

const makeCSSVars = require('./utils/vscode-to-css-vars')
const makeLessVars = require('./utils/vscode-to-djitsu')
const makeMonaco = require('./utils/vscode-to-monaco')

const ROOT_PATH = path.resolve(__dirname, '../../')
const THEMES_SOURCE = path.join(ROOT_PATH, 'src/themes')
const THEMES_OUTPUT = path.join(ROOT_PATH, 'public/themes')

const CLEAN_BEFORE_RUN = true

const run = async () => {
  const result = await fs.promises.readdir(THEMES_SOURCE)
  console.log('Start themes compilation...')

  const possibleThemes = result.filter(isValidThemeDir(THEMES_SOURCE))

  if (CLEAN_BEFORE_RUN)
    fs.rmSync(THEMES_OUTPUT, { recursive: true, force: true })

  fs.mkdirSync(THEMES_OUTPUT, { recursive: true })

  const themes = await Promise.all(
    possibleThemes.map(processTheme(THEMES_SOURCE))
  )
  themes.map(prepareThemeVariants)
  themes.map(prepareCSSVars)
  themes.map(prepareLessVars)

  await Promise.all(themes.map(makeThemes))
  makeThemesConfig(themes)
  console.log('Themes compiles successfully!')
}

run()

/** @type {import('./compile-themes').PrepareThemeVariants} */
const prepareThemeVariants = (theme) =>
  theme.variants.forEach((variant, index) => {
    const getData = () =>
      loadThemeVariantSource(
        variant.type,
        path.join(theme.paths.fullpath, variant.source)
      )

    const filename =
      theme.variants.length === 1 || (!index && !variant.name)
        ? theme.name
        : variant.name
        ? `${theme.name}-${variant.name}`
        : variant.title
            .toLowerCase()
            .replace(/([ ])+/g, '-')
            .replace(/([^a-z0-9-])+/g, '')
    const title =
      variant.title ||
      (theme.variants.length === 1 || (!index && !variant.title)
        ? theme.title || theme.name
        : variant.name)

    Object.assign(variant, {
      ...(!variant.name ? { name: filename } : {}),
      ...(!variant.title ? { title } : {}),
      getData,
      filename
    })
  })

/**
 * Make theme for djitsu from processed theme
 * @param {ProcessedTheme} theme Theme to generate
 */
const makeThemes = async (theme) => {
  await Promise.all(
    theme.variants.map((variant) =>
      Promise.all([
        makeAntdTheme(variant, theme),
        makeMonacoTheme(variant, theme)
      ])
    )
  )
}

/** @type {import('./compile-themes').MakeAntdTheme} */
const makeAntdTheme = async (variant, theme) => {
  const less = require('less')
  const lessPath = path.join(theme.paths.fullpath, variant.less)

  let lessSource
  try {
    lessSource = fs.readFileSync(lessPath, 'utf-8')
  } catch (error) {
    console.log(error)
    throw new Error('Unable to load less file')
  }

  const lessOptions = {
    paths: [theme.paths.fullpath],
    javascriptEnabled: true
  }

  let rendered
  try {
    rendered = await less.render(lessSource, {
      ...lessOptions,
      ...{ modifyVars: variant.getLessVars() }
    })
  } catch (error) {
    console.warn(error)
    throw new Error('Unable to compile less file')
  }

  const cssOutput = path.join(theme.paths.output, `${variant.filename}.css`)
  try {
    fs.writeFileSync(cssOutput, `${rendered.css}\n${variant.getCSSVars()}`)
  } catch (error) {
    console.log(error)
    throw new Error('Unable to write rendered css file')
  }

  Object.assign(variant, {
    css: `${theme.name}/${variant.filename}.css`
  })
}

/** @type {import('./compile-themes').MakeMonacoTheme} */
const makeMonacoTheme = async (variant, theme) => {
  const variantData = variant.getData()
  const compiled = await makeMonaco(variantData)

  const monacoFile = `${variant.filename}.monaco.json`

  try {
    fs.writeFileSync(
      path.join(theme.paths.output, monacoFile),
      JSON.stringify(compiled, 1, 1)
    )
  } catch (error) {
    console.log(error)
    throw new Error('Unable to write monaco theme file')
  }

  Object.assign(variant, {
    isDark: variantData.type === 'dark',
    monaco: `${theme.paths.dir}/${variant.filename}.monaco.json`
  })
}

const prepareCSSVars = ({ variants }) =>
  variants.map((variant) =>
    Object.assign(variant, {
      getCSSVars: () => makeCSSVars(variant.getData())
    })
  )

const prepareLessVars = ({ variants }) =>
  variants.map((variant) =>
    Object.assign(variant, {
      getLessVars: () => makeLessVars(variant.getData())
    })
  )

/** @type {import('./compile-themes').ThemeProcessorWrapper} */
const processTheme = (base) => async (dir) => {
  const fullpath = path.join(base, dir)
  const themeFile = path.join(fullpath, 'theme.yaml')
  const themeRaw = await fs.promises.readFile(themeFile, 'utf-8')
  const output = path.join(THEMES_OUTPUT, dir)
  fs.mkdirSync(output, { recursive: true })

  /** @type {ProcessedTheme} */
  const parsed = {
    name: dir, // Override `name` from theme.yaml - this provides the default
    ...YAML.parse(themeRaw),
    paths: {
      base,
      dir,
      fullpath,
      output
    }
  }

  return parsed
}

/** @type {import('./compile-themes').MakeThemesConfig} */
const makeThemesConfig = (themes) => {
  const themesConfig = {
    version: require('../../package.json').version,
    dv: require('../../package.json').dv,
    themes: themes.map(({ name, title, version, variants, paths }) => ({
      name,
      title,
      version,
      base: paths.dir,
      variants: variants.map((variant) => ({
        css: variant.css,
        isDark: variant.isDark,
        name: variant.name,
        title: variant.title,
        monaco: variant.monaco
      }))
    }))
  }

  try {
    fs.writeFileSync(
      path.join(THEMES_OUTPUT, 'themes.json'),
      JSON.stringify(themesConfig, 1, 1)
    )
  } catch (error) {
    console.log(error)
    throw new Error('Unable to write themes config file')
  }
}

/** @type {import('./compile-themes').IsValidThemeDir} */
const isValidThemeDir = (base) => (dir) => {
  const fullpath = path.join(base, dir)
  if (!dir.match(/-theme$/)) return false
  try {
    const stat = fs.statSync(fullpath)
    return stat.isDirectory()
  } catch (error) {
    return false
  }
}

/** @type {import('./compile-themes').LoadThemeVariantSource} */
const loadThemeVariantSource = (type, filepath) => {
  // vscode theme
  if (type === ThemeSourceType.VSCode) {
    try {
      const fileData = require(filepath)
      return fileData
    } catch (err) {
      return false
    }
  }
}
const ThemeSourceType = {
  VSCode: 'vsc'
}
