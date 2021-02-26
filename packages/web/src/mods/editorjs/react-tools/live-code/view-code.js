import React, { useCallback, useEffect, useState } from 'react'
import AceEditor from 'react-ace'

import { Select, Tooltip } from 'antd'
import {
  mdiCodeBraces,
  mdiLanguageJavascript,
  mdiLanguageMarkdown,
  mdiLanguagePhp
} from '@mdi/js'
import Icon from '@mdi/react'
import AntIcon, { BugTwoTone, BugOutlined } from '@ant-design/icons'

import useStates from 'djitsu/utils/hooks/use-states'
import Tool from 'mods/editorjs/tools/react-tool/tool.component'
import { VButton } from 'mods/editorjs/tools/react-tool/tool-header'
import isEqual from 'react-fast-compare'
import AntIconMDI from 'djitsu/components/anticon-mdi'
import compare from 'react-fast-compare'

export const ViewCode = (props) => {
  const { baseEditorProps = {}, input, onChange } = props
  const [codeInput, setCodeInput] = useState(input?.code)
  const [options, setOption] = useStates({
    language: 'js',
    ...(input.options || {})
  })
  const [annotations, setAnnotations] = useState()

  const onChangeInput = useCallback((value) => {
    setCodeInput(value)
  }, [])

  const toggleDebugCodeBlock = useCallback(() => {
    setOption('debug', !options.debug)
  }, [options.debug])

  const changeBlockLanguage = useCallback((language) => {
    setOption('language', language)
  }, [])

  useEffect(() => {
    // console.log('∂∂∂∂∂ CHANGED INPUT VALUE TO: ', { options, codeInput })
    const areEqual = isEqual(
      { code: input?.code, options: input?.options },
      { options, code: codeInput }
    )
    // console.log('∂∂∂∂∂ CHANGED INPUT VALUE TO IS EQUAL: ', { areEqual })
    if (!areEqual) onChange?.({ options, code: codeInput })
  }, [options, codeInput])

  useEffect(() => {
    if (input?.options) {
      const isEqual = compare(input?.options, options)
      if (!isEqual) {
        setOption(input?.options)
      }
    }
  }, [input?.options])

  useEffect(() => {
    // console.log('∂∂∂∂∂ CHANGED INPUT ERROR: ', input.error)
    if (input.error) {
      const annot = [
        {
          row: (input.error?.loc?.line ?? 1) - 1,
          column: (input.error?.loc?.column ?? 1) - 1,
          text: input.error?.message, // Or the Json reply from the parser
          type: 'error'
        }
      ]
      // console.log('∂∂∂∂∂ SETTING ANNOTATIONS: ', annot)
      setAnnotations(annot)
    } else setAnnotations()
  }, [input.error])

  return (
    <Tool.View
      name='main'
      label='Main Code'
      description='Main code...'
      icon={
        <AntIcon
          component={() => (
            <Icon path={mdiCodeBraces} color={'inherit'} size={'1em'} />
          )}
        />
      }
      actions={
        <>
          <Tooltip
            title={
              (options.debug ? 'Disable ' : 'Enable ') + ' debuggin on block'
            }
          >
            <VButton onClick={toggleDebugCodeBlock} size='small'>
              {options.debug ? (
                <BugTwoTone
                  twoToneColor={[
                    'var(--error-color)',
                    'var(--tool-outline-color)'
                  ]}
                />
              ) : (
                <BugOutlined />
              )}
            </VButton>
          </Tooltip>
          <Select
            size='small'
            bordered={false}
            value={options.language}
            onChange={(selected) => {
              changeBlockLanguage(selected)
            }}
          >
            <Select.Option value='js'>
              <AntIconMDI path={mdiLanguageJavascript} /> Javascript
            </Select.Option>
            <Select.Option value='md'>
              <AntIconMDI path={mdiLanguageMarkdown} /> Markdown
            </Select.Option>
            <Select.Option value='mdx'>
              <AntIconMDI path={mdiLanguagePhp} /> MDX
            </Select.Option>
          </Select>
        </>
      }
    >
      <AceEditor
        value={codeInput}
        mode='jsx'
        className='code-editor'
        {...baseEditorProps}
        onChange={onChangeInput}
        // onInput={onChange}
        // onLoad={onEditorLoad('input')}
        annotations={annotations}
        // markers={markers}
      />
    </Tool.View>
  )
}

export default ViewCode
