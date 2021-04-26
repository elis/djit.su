import commander from 'commander'

const main = {
  onLoad: callback => {
    commander
      .name('djitsu')
      .version('1.2.3')
      .addOption(new commander.Option('-v, --voice <voice>', 'Select voice'))
      .description('Working example')
      .addHelpText('after', 'Up')
      .action(options => {
        callback(options)
      })
    commander.parse(process.argv)
  }
}

export default {
  main
}
