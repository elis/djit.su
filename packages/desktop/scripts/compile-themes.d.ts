import { IVSCodeTheme } from 'monaco-vscode-textmate-theme-converter'

export type PrepareThemeVariants = (theme: ProcessedTheme) => void

export type ThemeProcessorWrapper = (
  base: string
) => (theme: string) => Promise<ProcessedTheme>

export type IsValidThemeDir = (base: string) => (theme: string) => boolean

export type LoadThemeVariantSource = <T>(
  type: T,
  filepath: string
) => ThemeVariantSource<T>

export type PrepareCSSVars = (theme: ProcessedTheme) => ProcessedTheme
export type PrepareLessVars = (theme: ProcessedTheme) => ProcessedTheme

// export type MakeAntdThemeWrapper = (theme: ProcessedTheme) => MakeAntdTheme
export type MakeAntdTheme = (
  variant: ProcessedVariant,
  theme: ProcessedTheme
) => Promise<void>

export type MakeMonacoTheme = (
  variant: ProcessedVariant,
  theme: ProcessedTheme
) => Promise<void>

export type MakeThemesConfig = (themes: ProcessedTheme[]) => void

export type ThemeConfig = {
  /** Theme name (lowercase, kebab case, a-z, 0-9) */
  name: string
  /** Theme version (semver or whatever) */
  version: string
  /** Theme variants */
  variants: ThemeVariant[]
}

export type ThemeVariant = {
  /** Variant title */
  title: string
  /** Variant name */
  name: string
  /** Variant source type */
  type: ThemeSourceType
  /** Variant source file */
  source: string
  /** Variant less file path - e.g. `theme.less` */
  less: string
}

export interface ProcessedTheme extends ThemeConfig {
  paths: ThemePaths
  variants: ProcessedVariant[]
}

export interface ProcessedVariant extends ThemeVariant {
  /** Load VSCode source theme */
  getData: () => Promise<IVSCodeTheme>
  /** Get CSS variables */
  getCSSVars: () => Promise<string>
  /** Get Less variables object */
  getLessVars: () => Promise<Record<string, string>>
  filename: string
}

export type ThemePaths = {
  /** Dir name of the theme */
  dir: string // Dir name of the theme
  /** Base path on disk where theme is located */
  base: string
  /** Fullpath on disk to theme source */
  fullpath: string
  /** Fullpath on disk where to write these output */
  output: string
}

export enum ThemeSourceType {
  VSCode = 'vsc'
}

export type ThemeVariantSource<ThemeSourceType> = IVSCodeTheme
