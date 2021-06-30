import commander from 'commander'

export const name = 'filesystem'

export const main = {
  init: (options, app, config) => {
    commander
      .name('djitsu')
      .version('1.2.3')
      .addOption(new commander.Option('-v, --voice <voice>', 'Select voice'))
      .description('Working example')
      .addHelpText('after', 'Up')
    // .action(options => {
    //   config.callback(options)
    // })
    console.log('initializing commander...', options ? true : { app, config })
    commander.parse(process.argv)
  }
}
