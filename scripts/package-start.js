require('child_process').spawn('yarn', ['start'], {
  shell: true,
  stdio: [process.stdin, process.stdout, process.stderr],
  cwd: require('./utils').resolvePath('packages', process.argv[2])
})