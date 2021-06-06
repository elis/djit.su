export const babelConfig = {
  plugins: [],
  debugEnvPreset: false,
  envConfig: {
    browsers: "defaults, not ie 11, not ie_mob 11",
    electron: "1.8",
    isEnvPresetEnabled: true,
    isElectronEnabled: false,
    isNodeEnabled: false,
    forceAllTransforms: false,
    shippedProposals: false,
    isBuiltInsEnabled: false,
    isSpecEnabled: false,
    isLooseEnabled: false,
    isBugfixesEnabled: true,
    node: "10.13",
    version: "",
    builtIns: "usage"
    // corejs: "3.6"
  },
  presetsOptions: {
    decoratorsLegacy: false,
    decoratorsBeforeExport: false,
    pipelineProposal: "minimal",
    reactRuntime: "classic"
  },
  evaluate: false,
  presets: [
    "env",
    "react",
    "stage-2"
  ],
  prettify: false,
  sourceMap: false,
  sourceType: "module",
  getTransitions: false
}
