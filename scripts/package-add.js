const fs = require('fs/promises')
const chalk = require('chalk')
const Listr = require('listr')
const merge = require('lodash/fp/merge')
const {
  getPackageNames,
  getPackages,
  resolvePath,
  unlinkPackage,
  installPackagesInPackage,
  linkPackages,
  linkPackage
} = require('./utils')

const main = async () => {
  const [,, selectedPackage, ...installPackages] = process.argv
  process.stdout.write(chalk`{bgMagenta.black  ⟑ } {underline Djitsu Package Adder}\n`)
  try {
    await tasks.run({ package: selectedPackage, add: installPackages })
  } catch (error) {
    process.stdout.write(chalk`{bgRed.black  ⟑ } ${error}`)
  }
}

const tasks = new Listr([
  {
    title: 'Prepare package',
    task: async (ctx, task) => {
      const { package } = ctx
      ctx.packages = await fs.readdir('./packages')
      const selfPackage = getPackages(ctx.packages).find(([name]) => name === package)[1]

      await unlinkPackage(package)
      ctx.updater = udpateJson(package, ctx.packages)
      task.output = chalk`{cyan ${selfPackage.name}} ./packages/${package}`
      await ctx.updater.next()
      task.title = chalk`Prepare package: {cyan ${selfPackage.name}} ./packages/${package}`
    }
  },
  {
    title: chalk`Install requested packages`,
    task: async (ctx, task) => {
      const { add, package, updater } = ctx
      task.title = chalk`Install requested packages: {cyan ${add.join(', ')}}`
      task.output = chalk`$ yarn add {cyan ${add.join(' ')}}`
      await installPackagesInPackage(package, add)
      ctx.links = (await updater.next()).value
    }
  },
  {
    title: 'Link dependency packages',
    task: async (ctx, task) => {
      task.output = 'Linking: ' + ctx.links.join(', ')
      await new Promise(resolve => setTimeout(resolve, 5000))
      task.title = chalk`Linked packages: ${ctx.links.join(', ')}`
      await linkPackages(ctx.package, ctx.links)
    }
  },
  {
    title: 'Link package',
    task: async (ctx, task) => linkPackage(ctx.package)
  }
], {
  nonTTYRenderer: 'silent'
})


async function* udpateJson (package, packages) {
  const names = getPackageNames(packages).map(([, packageName]) => packageName)
  const selfPackage = getPackages(packages).find(([name]) => name === package)[1]

  const deps = selfPackage.dependencies || {}
  const devDeps = selfPackage.devDependencies || {}

  const newJson = {
    ...selfPackage,
    dependencies: {
      ...Object.entries(deps).filter(([dep]) => names.indexOf(dep) === -1).reduce((acc, [dep, ver]) => ({ ...acc, [dep]: ver}), {})
    },
    devDependencies: {
      ...Object.entries(devDeps).filter(([dep]) => names.indexOf(dep) === -1).reduce((acc, [dep, ver]) => ({ ...acc, [dep]: ver}), {}),
    }
  }

  await fs.copyFile(resolvePath('packages', package, 'package.json'), resolvePath('packages', package, 'package.json_djitsu-backup'))
  await fs.writeFile(resolvePath('packages', package, 'package.json'), JSON.stringify(newJson, 1, 1))
  yield true
  const updateJson = JSON.parse(await fs.readFile(resolvePath('packages', package, 'package.json'), { encoding: 'utf8' }))
  
  const nextJson = {
    ...newJson,
    dependencies: merge(merge({}, deps), updateJson.dependencies),
    devDependencies: merge(merge({}, devDeps), updateJson.devDependencies),
  }

  await fs.writeFile(resolvePath('packages', package, 'package.json'), JSON.stringify(nextJson, 1, 2))
  await fs.unlink(resolvePath('packages', package, 'package.json_djitsu-backup'))
  return [
    ...Object.keys(deps).filter((dep) => names.indexOf(dep) !== -1),
    ...Object.keys(devDeps).filter((dep) => names.indexOf(dep) !== -1)
  ]
}

main()