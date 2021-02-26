# Djitsu Monorepo

## Installing

To bootstrap all the packages run:

```bash
$ yarn bootstrap
```

To bootstrap specific package run:

```bash
$ yarn bootstrap desktop
```

Both will install the proper dependencies for the package(s).

## Starting

There's no aggregated start script - run packages individually as needed. For example:

```bash
$ yarn start desktop
```

Use `concurrently` or similar tools to run several environments side-by-side:

```bash
$ concurrently "yarn start editor" "yarn start desktop"
```

## Adding dependencies

To respect the package links and avoid errors it's recommended to install dependencies (aka `yarn add`) using the `package:add` command from the repo root instead of using `yarn add` in package dir.

Usage:

```bash
$ yarn package:add <packageName> <dependencies...>
```

### Installing new depedndencies
```bash
$ yarn package:add desktop react-parallax
```

### Installing new ___dev___ dependencies

```bash
$ yarn package:add desktop --dev worker-loader
```

# Packages

### [`packages/core`](./packages/core)

[`@djitsu/core`](https://npmjs.com/package/@djitsu/core)

Future stub

### [`packages/desktop`](./packages/desktop)

[`@djitsu/desktop`](https://npmjs.com/package/@djitsu/desktop)

Electron based desktop client for djitsu

### [`packages/editor`](./packages/editor)

[`@djitsu/editor`](https://npmjs.com/package/@djitsu/editor)

Editorjs based djitsu document editor

### [`packages/web`](./packages/web)

[`djitsu`](https://npmjs.com/package/djitsu)

Razzle based djitsu web client
