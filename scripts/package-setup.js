const fs = require('fs/promises')
const chalk = require('chalk')
const Listr = require('listr')
const {
  getPackageNames,
  getPackages,
  resolvePath,
  unlinkPackage,
  installPackage,
  linkPackages,
  linkPackage
} = require('./utils')

const main = async () => {
  const [,, selectedPackage] = process.argv
  process.stdout.write(chalk`{bgYellow.black  ⟑ } {underline Djitsu Package Installer}\n`)
  try {
    await tasks.run({ package: selectedPackage })
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
      ctx.needsUpdate = !((await ctx.updater.next()).done)
      task.title = chalk`Prepare package: {cyan ${selfPackage.name}} ./packages/${package}`
    }
  },
  {
    title: 'Install package',
    task: async (ctx, task) => {
      const { package, updater } = ctx
      task.output = 'yarn install'
      await installPackage(package)
      if (ctx.needsUpdate) {
        ctx.links = (await updater.next()).value
      }
    }
  },
  {
    title: 'Link dependency packages',
    skip: (ctx) => !ctx.needsUpdate && 'No dependencies to link',
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
  const needsUpdate = (names.find((packageName) => packageName in deps) || names.find((packageName) => packageName in devDeps))

  if (needsUpdate) {
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

    await fs.copyFile(resolvePath('packages', package, 'package.json_djitsu-backup'), resolvePath('packages', package, 'package.json'))
    await fs.unlink(resolvePath('packages', package, 'package.json_djitsu-backup'))
    return [
      ...Object.keys(deps).filter((dep) => names.indexOf(dep) !== -1),
      ...Object.keys(devDeps).filter((dep) => names.indexOf(dep) !== -1)
    ]
  }
  return
}

main()