import React, { useCallback, useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import ToolProvider from './tool.context'

class ReactTool {
  static enableLineBreaks = true
  /**
   * Automatic sanitize config
   */
  static get sanitize() {
    return {
      data: true,
      tool: true,
      tune: true
    }
  }

  constructor({ data, api, config }) {
    this.config = config
    this.data = data
    this.api = api
    this.wrapper = null
    this.rt = {}

    this.settings = [
      {
        name: 'stretched',
        icon: `<svg width="17" height="10" viewBox="0 0 17 10" xmlns="http://www.w3.org/2000/svg"><path d="M13.568 5.925H4.056l1.703 1.703a1.125 1.125 0 0 1-1.59 1.591L.962 6.014A1.069 1.069 0 0 1 .588 4.26L4.38.469a1.069 1.069 0 0 1 1.512 1.511L4.084 3.787h9.606l-1.85-1.85a1.069 1.069 0 1 1 1.512-1.51l3.792 3.791a1.069 1.069 0 0 1-.475 1.788L13.514 9.16a1.125 1.125 0 0 1-1.59-1.591l1.644-1.644z"/></svg>`
      }
    ]
  }

  onReactToolReady({ onSave }) {
    const onUpdate = (config) => {
      this.config = config
    }
    this.rt = {
      onSave,
      onUpdate
    }
  }

  renderSettings() {
    this.settingsWrapper = document.createElement('div')

    this.settings.forEach((tune) => {
      const button = document.createElement('div')

      button.classList.add('cdx-settings-button')
      button.innerHTML = tune.icon
      this.settingsWrapper.appendChild(button)

      button.addEventListener('click', () => {
        this._toggleTune(tune.name)
        button.classList.toggle('cdx-settings-button--active')
      })
      if (this.data.tune?.[tune.name])
        button.classList.toggle('cdx-settings-button--active')
    })
    this._acceptTuneView()

    return this.settingsWrapper
  }

  /**
   * @private
   * Click on the Settings Button
   * @param {string} tune — tune name from this.settings
   */
  _toggleTune(tune) {
    Object.assign(this.data, {
      tune: {
        ...(this.data.tune || {}),
        [tune]: !this.data.tool?.tune?.[tune]
      }
    })
    this._acceptTuneView()
  }

  /**
   * Add specified class corresponds with activated tunes
   * @private
   */
  _acceptTuneView() {
    this.settings.forEach((tune) => {
      this.settingsWrapper.classList.toggle(
        tune.name,
        !!this.data?.tune?.[tune.name]
      )
      if (tune.name === 'stretched') {
        this.api.blocks.stretchBlock(
          this.api.blocks.getCurrentBlockIndex(),
          !!this.data.tune?.stretched
        )
      }
    })
  }

  render() {
    this.wrapper = document.createElement('div')

    if (this.config.component) {
      const reactContainer = document.createElement('div')
      reactContainer.classList.add('react-container')
      const { component, props = {} } = this.config

      // console.log('‡°‡°‡°°‡°‡°‡°‡°‡‡°‡ RENDER FN', this.config, this.data)

      const mahPortal = ReactDOM.render(
        <ToolProvider
          value={this.data?.tool}
          data={this.data}
          onChange={(newValue) => {
            this.providerValue = newValue
          }}
        >
          <ToolComponentWrapper
            {...props}
            component={component}
            onReady={(stuff) => {
              this.onReactToolReady(stuff)
            }}
            data={this.data?.data}
          />
        </ToolProvider>,
        reactContainer
      )

      console.log('🏊‍♀️📍', 'mah portal:', mahPortal)
      this.wrapper.append(reactContainer)
    }
    return this.wrapper
  }

  save() {
    const data = this.rt.onSave?.()
    const tool = this.providerValue
    return {
      data,
      tool,
      tune: this.data.tune || {}
    }
  }
}

const ToolComponentWrapper = (props) => {
  const {
    data,
    component: Component,
    onReady: onReadyUser,
    onUpdate,
    ...rest
  } = props
  const [componentValue, setComponentValue] = useState()
  const valueRef = useRef()

  useEffect(() => {
    onReadyUser({
      onSave: () => ({ ...data, ...getFreshValue() })
    })
  }, [])

  const componentDataChanged = useCallback((newData) => {
    setComponentValue(newData)
  }, [])

  const getFreshValue = useCallback(() => valueRef.current, [valueRef])

  useEffect(() => {
    valueRef.current = componentValue
    // eslint-disable-next-line no-unused-expressions
    onUpdate?.(componentValue)
  }, [componentValue])

  return <Component {...rest} data={data} onChange={componentDataChanged} />
}

export default ReactTool
