import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import { useDebounceFn } from 'ahooks'
import isEqual from 'react-fast-compare'
import findLine from 'find-line-column'

import useStates from '../../../utils/hooks/use-states'
import { Tool, toolMaker, useTool } from '../../editorjs-react-tool' // '../../editorjs-react-tool'

import ViewCode from './view-code'
import ViewDemoCode from './view-demo-code'
import ViewPreview from './view-preview'
import { ThemeContext } from '../../../../djitsu/theme'

export const liveCodeTool = (blockName, options = {}) =>
  toolMaker(LiveCodeComponent, blockName, { icon: ICON, ...options })

export const LiveCodeComponent = props => {
  const [toolState] = useTool()
  const {
    getTheme,
    addErrorListener,
    addCompiledListener,
    runModules,
    onChange,
    data
  } = props
  const theme = getTheme?.()
  const [inputs, setInput] = useStates({
    code: data?.code || '',
    demo: data?.demo || '',
    preview: data?.preview || ''
  })
  const [errors, setErrors] = useState()

  const [codeExports, setCodeExports] = useState()

  const baseEditorProps = {
    theme, // theme === 'dark' ? 'monokai' : 'tomorrow',
    width: '100%',
    wrapEnabled: true,
    editorProps: { $blockScrolling: true },
    setOptions: {
      minLines: 4,
      maxLines: 30,
      autoScrollEditorIntoView: true
    }
  }

  const onChangeInput = useCallback((name, value) => {
    setInput(name, value)
  }, [])

  const { run: sendParentUpdate, cancel: cancelParentUpdate } = useDebounceFn(
    data => onChange?.(data),
    {
      wait: 300
    }
  )

  const [notifiedToParent, setNotifiedToParent] = useState()

  useEffect(() => {
    if (notifiedToParent) {
      const { error, ...codeData } = notifiedToParent?.code || data?.code
      const { error: _error, ...codeInputs } = inputs?.code || {}
      const areEqual = isEqual(
        { ...inputs, code: codeInputs },
        { code: codeData, demo: data?.demo }
      )
      if (!areEqual) {
        sendParentUpdate({ ...inputs, code: codeInputs })
        setNotifiedToParent({ ...inputs, code: codeInputs })
      }
      return () => {
        cancelParentUpdate()
      }
    }
    if (inputs) {
      const { error: _error, ...codeInputs } = inputs?.code
      sendParentUpdate({ ...inputs, code: codeInputs })
      setNotifiedToParent({ ...inputs, code: codeInputs })
    }
  }, [inputs])

  useEffect(() => {
    if (errors?.length > 0) {
      const haveName = !!data?.options?.name
      if (haveName) {
        // handle
      } else {
        const myCode = inputs.code.code
        const myOffence = errors.find(({ code }) => code === myCode)
        if (myOffence) setInput('code', v => ({ ...v, error: myOffence.error }))
      }

      // handle
    } else if (errors) {
      const { message, code } = errors

      // X is not defined
      const [, ident] = message.match(/^(.*) is not defined$/) || []
      if (ident) {
        const myCode = inputs.code.code
        if (myCode) {
          const indexOf = myCode.indexOf(ident)
          const found = indexOf >= 0 ? findLine(myCode, indexOf) : null
          if (found) {
            const offence = {
              loc: {
                line: found.line,
                column: found.col
              },
              message
            }
            setInput('code', v => ({ ...v, error: offence }))
          }
        }
      }

      // Cannot find module 'x'
      const [, missingModule] =
        message.match(/^Cannot find module '(.*)'$/) || []
      if (missingModule) {
        const myCode = inputs.code.code
        const regex = new RegExp(
          `(import (.* from )?'(${missingModule})'|"(${missingModule})")|(require\\s*\\(\\s*'(${missingModule})'|"(${missingModule})"\\s*\\))`,
          'im'
        )
        const result = myCode.search(regex)
        const found = result >= 0 ? findLine(myCode, result) : null
        if (found) {
          const offence = {
            loc: {
              line: found.line,
              column: found.col
            },
            message
          }
          setInput('code', v => ({ ...v, error: offence }))
        }
      }

      // Cannot find module 'x'
      if (message === 'No name for import was provided') {
        const myCode = inputs.code.code
        const regex = new RegExp(
          `(import (.* from )?''|"")|(require\\s*\\(\\s*''|""\\s*\\))`,
          'im'
        )
        const result = myCode.search(regex)
        const found = result >= 0 ? findLine(myCode, result) : null
        if (found) {
          const offence = {
            loc: {
              line: found.line,
              column: found.col
            },
            message
          }
          setInput('code', v => ({ ...v, error: offence }))
        }
      }

      // Cannot find module 'x'
      if (code === 'NAMESPACE_CONFLICT') {
        const myCode = inputs.code.code
        const regex = new RegExp(
          `(export (const|let|var)?\\s?${errors.name}|\\{\\s*${errors.name}\\s*\\})`,
          'im'
        )
        const result = myCode.search(regex)
        const found = result >= 0 ? findLine(myCode, result) : null
        if (found) {
          const offence = {
            loc: {
              line: found.line,
              column: found.col
            },
            message
          }
          setInput('code', v => ({ ...v, error: offence }))
        }
      }
    }
  }, [errors])

  // Clear errors
  useEffect(() => {
    if (!errors && inputs.code.error) {
      setInput('code', ({ error: _error, ...v }) => ({ ...v }))
    }
  }, [errors, inputs.code.error])

  useEffect(() => {
    const cancelErrors = addErrorListener(errors => {
      setErrors(errors)
    })
    const cancelCompiler = addCompiledListener(compiled => {
      setErrors()
      setCodeExports(compiled.exports)
      // console.log('⌨️ Compiled Result:', compiled.exports, { compiled })
    })
    return () => {
      cancelErrors()
      cancelCompiler()
    }
  }, [])

  const [previewResult, setPreviewResult] = useState()
  const [previewError, setPreviewError] = useState()

  useEffect(() => {
    if (inputs.demo && Object.keys(codeExports || {}).length) {
      const template = `import React from 'react'
        export const result = (%SPF%)`
      const code = template.replace('%SPF%', inputs.demo)

      // console.log('⛩ Generating preview of:', `"${inputs.demo}"`, {
      //   codeExports
      // })
      try {
        runModules([{ filename: 'system/result.js', code }], {
          context: codeExports
        })
          .then(result => {
            // console.log('⛩ Resulting compiled:', result)
            if (result?.error) {
              const error = result.error
              if (!error?.length) {
                const { message } = error
                const [, ident] = message.match(/^(.*) is not defined$/) || []
                if (ident) {
                  const myCode = inputs.demo
                  const indexOf = myCode.indexOf(ident)
                  const found = indexOf >= 0 ? findLine(myCode, indexOf) : null
                  if (found) {
                    const offence = {
                      loc: {
                        line: found.line,
                        column: found.col
                      },
                      message,
                      name: '<FIX ME>'
                    }
                    setPreviewError(offence)
                  }
                }
              } else {
                setPreviewError(result.error)
                // setPreviewResult()
              }
            } else {
              if (typeof result?.exports.result === 'function')
                setPreviewResult({ value: result.exports.result })
              else setPreviewResult(result.exports.result)
              setPreviewError()
            }
          })
          .catch(error => {
            console.log('caught error:', error)
          })
      } catch (error) {
        console.log('compile error:', error)
      }
    }
  }, [inputs.demo, codeExports])

  const onPreviewRendered = useCallback(([b64image]) => {
    setInput('preview', () => b64image)
  }, [])

  useEffect(() => {
    if (!toolState?.options?.name) return
    const [, ext] = `${toolState?.options?.name}`.match(/[.]([^.]+)$/) || []
    if (ext && (!inputs.code?.options?.language || !inputs.code?.code)) {
      setInput('code', code => ({
        ...code,
        options: { ...(code?.options || {}), language: ext }
      }))
    }
  }, [toolState?.options?.name])

  return (
    <ThemeContext.Provider value={[{ theme }]}>
      <StyledTool placeholder="Untitiled code block">
        <ViewCode
          baseEditorProps={baseEditorProps}
          input={inputs.code}
          onChange={value => onChangeInput('code', value)}
        />
        {inputs?.code?.options?.language === 'js' && (
          <ViewDemoCode
            baseEditorProps={baseEditorProps}
            input={inputs.demo}
            onChange={value => onChangeInput('demo', value)}
            errors={previewError}
          />
        )}
        <ViewPreview
          theme={theme}
          result={previewResult}
          error={previewError}
          onRender={onPreviewRendered}
          currentPreview={inputs.preview}
          inputs={inputs}
        />
      </StyledTool>
    </ThemeContext.Provider>
  )
}

const StyledTool = styled(Tool)`
  & + .block-meta {
    top: -6px;
    border: 3px solid #0f0;
  }
`

const ICON = `
<svg xmlns="http://www.w3.org/2000/svg" width="17" height="15"
	 viewBox="0 0 511.997 511.997" xml:space="preserve">
		<path d="M506.76,242.828l-118.4-125.44c-7.277-7.718-19.424-8.07-27.142-0.787c-7.706,7.277-8.064,19.43-0.781,27.142
			l105.965,112.256L360.437,368.268c-7.283,7.712-6.925,19.859,0.781,27.142c3.712,3.501,8.454,5.235,13.178,5.235
			c5.101,0,10.195-2.022,13.965-6.01l118.4-125.446C513.742,261.785,513.742,250.226,506.76,242.828z"/>
		<path d="M151.566,368.262L45.608,255.999l105.958-112.262c7.277-7.712,6.925-19.866-0.787-27.142
			c-7.706-7.277-19.866-6.925-27.142,0.787l-118.4,125.44c-6.982,7.398-6.982,18.963,0,26.362L123.643,394.63
			c3.776,4,8.864,6.016,13.965,6.016c4.723,0,9.466-1.741,13.171-5.242C158.498,388.127,158.843,375.974,151.566,368.262z"/>
		<path d="M287.061,52.697c-10.477-1.587-20.282,5.606-21.882,16.083l-56.32,368.64c-1.6,10.483,5.6,20.282,16.083,21.882
			c0.986,0.147,1.958,0.218,2.925,0.218c9.325,0,17.504-6.803,18.957-16.301l56.32-368.64
			C304.744,64.095,297.544,54.297,287.061,52.697z"/>
</svg>
`

export default liveCodeTool
