import React from 'react'
import { ipcMain, nativeTheme } from 'electron'
import { watchFile, promises as fs } from 'fs'
import { resolve } from 'path'
import yaml from 'yaml'

import { plugin } from '../..'

export const name = 'develop'

export const main = {
  init: () => {
    return {
    }
  },
  onReady: (options, fields) => {


    const filename = resolve(__dirname, '../../../../', 'commands')

    const loadCommands = async () => {

      const data = await fs.readFile(filename, { encoding: 'utf8' })
      const commands = yaml.parse(data)
      const plg = commands.plugin && plugin(commands.plugin)
      console.log('Commands:', commands)
      if (commands.fn && typeof plg?.dev[commands.fn] === 'function') {
        const args = commands.args && commands.args.length > 0
          ? commands.args
          : []

        console.log('Executing', commands.plugin, commands.fn, 'with args:', args)
        const res = await plg.dev[commands.fn](...args)
        console.log('result of command execution:', res)
      } else {
        console.log('Command/plugin not found')
      }
    }
    const listener = (curr, prev) => {
      console.log('Commands updated:', {curr, prev})
      loadCommands()
    }

    const watcher = watchFile(filename, listener)
  }
}
