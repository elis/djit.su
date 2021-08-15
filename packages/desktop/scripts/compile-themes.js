const fs = require('fs')
const path = require('path')
const YAML = require('yaml')

const ROOT_PATH = path.resolve(__dirname, '../')
const THEMES_SOURCE = path.join(ROOT_PATH, 'src/themes')
const THEMES_OUTPUT = path.join(ROOT_PATH, 'src/dist/themes')

const CLEAN_BEFORE_RUN = false

const run = async () => {
  const result = await fs.promises.readdir(THEMES_SOURCE)

  const themes = (
    await Promise.all(
      result
        .filter(isValidThemeDir(THEMES_SOURCE))
        .map(loadThemeData(THEMES_SOURCE))
    )
  ).filter(({ error }) => !error)

  if (CLEAN_BEFORE_RUN)
    await fs.promises.rm(THEMES_OUTPUT, { recursive: true, force: true })

  await fs.promises.mkdir(THEMES_OUTPUT, { recursive: true })

  console.log('Generate css variables...')
  await Promise.all(themes.map(generateCSSVars))
  console.log('Done.')
  console.log('Generate less modifyVars...')
  await Promise.all(themes.map(generateModifyVars))
  console.log('Done.')
  console.log('Generate Ant Design themes...')
  await Promise.all(themes.map(generateAntdTheme))
  console.log('Done.')
  console.log('Generate Monaco themes...')
  await Promise.all(themes.map(generateMonacoTheme))
  console.log('Done.')

  console.log('Generate themes configuration...')
  await generateThemesConfig(themes)
  console.log('All Done.')
}

run()

const makeCSSVars = require('./utils/vscode-to-css-vars')
const makeLessVars = require('./utils/vscode-to-djitsu')
const makeMonaco = require('./utils/vscode-to-monaco')

/**
 *
 * @param {LoadedTheme[]} themes
 */
const generateThemesConfig = async themes => {
  const themesConfig = {
    themes: themes.map(({ name, title, version, variants, _ }) => ({
      name,
      title,
      version,
      base: _.dir,
      variants: variants.map(variant => ({
        css: variant.css,
        isDark: variant.isDark,
        name: variant.name,
        title: variant.title,
        monaco: variant.monaco
      }))
    }))
  }

  try {
    await fs.promises.writeFile(
      path.join(THEMES_OUTPUT, 'themes.json'),
      JSON.stringify(themesConfig, 1, 1)
    )
  } catch (error) {
    console.log(error)
    throw new Error('Unable to write themes config file')
  }
}

/**
 * Generate `modifyVars` for less
 * @param {LoadedTheme} theme
 */
const generateModifyVars = async ({ variants }) =>
  variants.map(variant =>
    Object.assign(variant, { lessVars: makeLessVars(variant.variantData) })
  )

/**
 * Generates CSS variables for variant
 * @param {LoadedTheme} theme
 */
const generateCSSVars = async ({ variants }) =>
  variants.map(variant =>
    Object.assign(variant, { cssVars: makeCSSVars(variant.variantData) })
  )

/**
 * Creates `{theme}/{variant}.monaco.json` file in theme output directory
 * @param {LoadedTheme} theme
 */
const generateMonacoTheme = ({ name, variants }) =>
  Promise.all(
    variants.map(async variant => {
      const compiled = await makeMonaco(variant.variantData)
      const themeOutput = path.join(THEMES_OUTPUT, name)

      const monacoFile = `${variant.filename}.monaco.json`

      try {
        await fs.promises.writeFile(
          path.join(themeOutput, monacoFile),
          JSON.stringify(compiled, 1, 1)
        )
      } catch (error) {
        console.log(error)
        throw new Error('Unable to write monaco theme file')
      }

      Object.assign(variant, {
        isDark: variant.variantData.type === 'dark',
        monaco: `${name}/${variant.filename}.monaco.json`
      })
    })
  )

/**
 * Creates `{theme}/{variant}.css`
 * @param {LoadedTheme} theme
 */
const generateAntdTheme = async theme => {
  const less = require('less')

  await Promise.all(
    theme.variants.map(async (variant, index) => {
      const lessPath = path.join(theme._.fullpath, variant.less)

      let lessSource
      try {
        lessSource = await fs.promises.readFile(lessPath, 'utf-8')
      } catch (error) {
        console.log(error)
        throw new Error('Unable to load less file')
      }

      const lessOptions = {
        paths: [theme._.fullpath],
        javascriptEnabled: true
      }

      const rendered = await less.render(lessSource, {
        ...lessOptions,
        ...(variant.lessVars ? { modifyVars: variant.lessVars } : {})
      })
      const themeOutput = path.join(THEMES_OUTPUT, theme.name)
      await fs.promises.mkdir(themeOutput, { recursive: true })
      const variantName =
        theme.variants.length === 1 || (!index && !variant.name)
          ? theme.name
          : variant.name ||
            variant.title
              .toLowerCase()
              .replace(/([ ])+/g, '-')
              .replace(/([^a-z0-9-])+/g, '')

      const cssOutput = path.join(themeOutput, `${variantName}.css`)
      try {
        await fs.promises.writeFile(
          cssOutput,
          `${rendered.css}\n${variant.cssVars}`
        )
      } catch (error) {
        console.log(error)
        throw new Error('Unable to write rendered css file')
      }

      Object.assign(variant, {
        name: variantName,
        css: `${theme.name}/${variantName}.css`
      })
    })
  )
}

/**
 *
 * @param {string} base Themes base path
 * @returns {ThemeDataLoader}
 */
const loadThemeData = base => async dir => {
  const fullpath = path.join(base, dir)
  const themeFile = path.join(fullpath, 'theme.yaml')
  try {
    const themeRaw = await fs.promises.readFile(themeFile, 'utf-8')
    /** @type {ThemeConfig} */
    const parsed = {
      name: dir, // Override `name` from theme.yaml - this provides the default
      ...YAML.parse(themeRaw)
    }
    if (parsed.version && parsed.variants?.length > 0) {
      const themeOutput = path.join(THEMES_OUTPUT, parsed.name)
      await fs.promises.mkdir(themeOutput, { recursive: true })

      await Promise.all(
        parsed.variants.map(async (variant, index) => {
          const variantData = loadThemeVariantSource(
            variant.type,
            path.join(fullpath, variant.source)
          )

          const variantFilename =
            parsed.variants.length === 1 || (!index && !variant.name)
              ? parsed.name
              : variant.name
              ? `${parsed.name}-${variant.name}`
              : variant.title
                  .toLowerCase()
                  .replace(/([ ])+/g, '-')
                  .replace(/([^a-z0-9-])+/g, '')

          Object.assign(variant, {
            variantData,
            filename: variantFilename
          })
        })
      )

      return {
        ...parsed,
        _: {
          themeOutput,
          base,
          dir,
          fullpath
        }
      }
    }
  } catch (error) {
    console.log(error)
    console.log('Debug data:', {
      base,
      dir,
      fullpath,
      error
    })
    throw new Error('Error processing theme')
  }
}

const isValidThemeDir = base => dir => {
  const fullpath = path.join(base, dir)
  if (!dir.match(/-theme$/)) return false
  try {
    const stat = fs.statSync(fullpath)
    return stat.isDirectory()
  } catch (error) {
    return false
  }
}

/**
 *
 * @param {ThemeSourceType} type Source type
 * @param {string} filepath Full file path to source file
 * @returns {ThemeVariantSource}
 */
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

/**
 * @callback ThemeDataLoader
 * @param {string} dir Theme dir name
 * @returns {Promise<LoadedTheme>}
 */

/**
 * @typedef ThemeConfig
 * @property {string} name Theme name (lowercase, kebab case, a-z, 0-9)
 * @property {string} version Theme version (semver)
 * @property {ThemeVariant[]} variants Available theme variants
 */

/**
 * @typedef ThemeVariant
 * @property {string} title Display title for the variant
 * @property {string} name Variant name (lowercase, kebab case, a-z, 0-9)
 * @property {ThemeSourceType} type Variant source type
 * @property {string} source Source file
 */

/**
 * @typedef {ThemeConfig} LoadedTheme
 * @property {ThemePrivate} _ Private properties
 * @property {LoadedThemeVariant[]} variants Loaded theme variants
 */

/**
 * @typedef LoadedThemeVariant
 * @mixes ThemeVariant
 * @property {ThemeVariantSource} variantData The loaded variant data
 */

/**
 * @typedef ThemePrivate
 * @property {string} dir Original dirname of the theme
 * @property {string} base Basepath of the theme dir
 * @property {string} fullpath Fullpath of the theme dir
 */

/**
 *
 * @typedef ThemeVariantSource
 */

/**
 * Theme source type enum
 * @readonly
 * @enum {string}
 */
const ThemeSourceType = {
  VSCode: 'vsc'
}
