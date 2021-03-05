const resolvePath = (...relative) => require('path').resolve(__dirname, '../', ...relative)

const getPackageNames = (packages) =>
  getPackages(packages).map(([name, json]) => [name, json.name])

const getPackages = (() => {
  let result
  return (packages) => {
    if (!result) {
      result = packages
        .map((package) => {
          try {
            const reqqed = require(resolvePath('packages', package, 'package.json'))
            return [package, reqqed]
          } catch (error) {
            return [package]
          }
        })
        .filter(([, result]) => result)
    }
    return result
  }
})()


const installPackage = (package) =>
  new Promise((resolve) => require('child_process')
    .exec('yarn install', { cwd: resolvePath('packages', package) }, () => resolve()))

const installPackagesInPackage = (package, packages) =>
  new Promise((resolve, reject) => require('child_process')
    .exec(`yarn add ${packages.join(' ')}`, { cwd: resolvePath('packages', package) }, (err, stdout) => err ? reject(err) : resolve(stdout)))

const linkPackage = (package) =>
  new Promise((resolve) => require('child_process')
    .exec('yarn link', { cwd: resolvePath('packages', package) }, () => resolve()))

const unlinkPackage = (package) =>
  new Promise((resolve) => require('child_process')
    .exec('yarn unlink', { cwd: resolvePath('packages', package) }, () => resolve()))

const linkPackages = (package, links) =>
  Promise.all(links.map((link) => new Promise((resolve) => require('child_process')
    .exec(`yarn link ${link}`, { cwd: resolvePath('packages', package) }, () => resolve()))))

module.exports = {
  getPackageNames,
  getPackages,
  installPackage,
  installPackagesInPackage,
  linkPackage,
  linkPackages,
  resolvePath,
  unlinkPackage
}
