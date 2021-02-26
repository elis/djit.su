const fs = require('fs/promises')
const chalk = require('chalk')
const Listr = require('listr')
const { getPackageNames, getPackages, resolvePath } = require('./utils')

const main = async () => {
  process.stdout.write(chalk`{bgBlue.black  ⟑ } {underline Djitsu Monorepo Bootstrap}\n`)
  try {
    const res = await tasks.run({
      package: process.argv[2]
    })
  
    process.stdout.write(chalk`{bgBlue.black  ⟑ } Bootstrap complete.\n`)
    process.stdout.write(chalk`{bgBlue.blue  ⟑ } Installed {blue ${res.installed.length}} packages: {green {dim ${res.installed.join(', ')}}}\n`)
    if (res.package) {
      process.stdout.write(chalk`{bgBlue.blue  ⟑ } Start development by running {cyan {dim $} yarn start ${res.package}}\n`)
    } else {
      res.packages
      .filter(([, { scripts: start }]) => start)
      .forEach(([n]) => 
        process.stdout.write(chalk`{bgBlue.blue  ⟑ } Start {green packages/${n}} development by running {cyan {dim $} yarn start ${n}}\n`)
      )
    }
  } catch (error) {
    process.stdout.write(chalk`{bgRed.red  ⟑ }\n{bgRed.black  ⟑ } ${error}\n`)
    process.exit(1)
  }
}

const tasks = new Listr([
  {
    title: 'Discover packages',
    task: async (ctx, task) => {
      const dirs = await fs.readdir('./packages')
      ctx.packages = getPackages(dirs)
      const foundPackages = ctx.packages.map(([n]) => n)
      if (!foundPackages.length) throw new Error(`No packages found in ${resolvePath('./', 'packages')}`)
      ctx.dirs = dirs.filter((dir) => foundPackages.indexOf(dir) >= 0)
      
      task.title = chalk`Found {cyan ${ctx.dirs.length}} packages: {blue ${ctx.dirs.join(', ')}}`
      ctx.packageNames = getPackageNames(ctx.dirs)
    }
  },
  {
    title: 'Verify package setup',
    enabled: (ctx) => ctx.package && (ctx.dirs?.indexOf(ctx.package) === -1),
    task: (ctx) => {throw new Error(`Package "${ctx.package}" was not found`)}
  },
  {
    title: 'Build dependency tree',
    task: async (ctx) => {
      const buildEarly = []
      const buildLate = []
      const packages = ctx.packages
        .map(([name, package]) => [
          name, 
          ctx.packageNames.find(([n]) => n === name)[1], 
          Object.keys({ ...package.dependencies || {}, ...package.devDependencies || {} })
        ])
      
      const check = packages
        .map(([name, packageName, deps]) => [
          name, 
          packageName, 
          packages
            .filter(([n]) => n !== name)
            .filter(([, indep]) => deps.indexOf(indep) !== -1)
            .map(([, indep]) => indep)
        ])
        .filter(([,, deps]) => deps.length)
      
      ctx.dependencyTree = check
  
      check.forEach(([, pname, deps]) => {
        buildEarly.push(...deps.filter(n => buildEarly.indexOf(n) !== -1))
        buildLate.indexOf(pname) === -1 && buildLate.push(pname)
      })

      ctx.buildOrder = [
        ...buildEarly.map((pn) => packages.find(([, p]) => p === pn)[0]),
        ...packages.filter(([n, pn]) => buildEarly.indexOf(pn) === -1 && buildLate.indexOf(pn) === -1).map(([n]) => n),
        ...buildLate.map((pn) => packages.find(([, p]) => p === pn)[0]),
      ]
    }
  },
  {
    title: 'Install packages',
    task: (ctx) => new Listr([
      ...ctx.buildOrder.map((package) => ({
        title: chalk`Install {cyan packages/${package}}`,
        enabled: () => ctx.package
          ? ctx.package === package || isDependency(ctx.packageNames.find(([n]) => n === package)[1], ctx.packageNames.find(([n]) => n === ctx.package)[1], ctx.dependencyTree)
          : true,
        task: (c, subtask) => new Promise(async (resolve, reject) => {
          ctx.installed = [...ctx.installed || [], package]

          const t = require('child_process').spawn(`yarn`, ['setup', package], { cwd: resolvePath('./'), shell: true })
          t.stdout.on('data', (data) => subtask.output = data)
          t.on('close', (code) => {
            if (code) reject()
            resolve()
          })
        })
      }), {
        nonTTYRenderer: 'silent'
      })
    ])
  }
], {
  nonTTYRenderer: 'silent'
})

const isDependency = (package, consumer, tree) => {
  if (tree && tree.length) {
    return tree.find(([, pn]) => pn === consumer)?.[2]?.indexOf(package) !== -1
  }
}

main()