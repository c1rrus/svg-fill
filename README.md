# SVG Fill

Fills all shapes of an SVG in single colour.

<p align="center">

![Illustration of an SVG shape being filled with a color](./svg-fill-illustration.svg)

</p>

:warning: Currently uses a naive solution that simply adds a fill attribute with the chosen fill color to the SVG element. For SVGs without styling attributes, such as ones to be composed into a symbol sprite, this should work fine. For anything else, the results will be hit and miss.

## Usage

### Requirements

* Node.js >= 10

### Installation

```
npm install --save svg-fill
```

### API

Simple usage:

```js
const SvgFill = require('svg-fill');

// Instantiante SvgFill with your chosen fill
// color:
const svgFill = new SvgFill('#FF0000');

// SvgFill expects SVG data as a string or Buffer
const originalSvgData = '<svg>....</svg>';

// Color your SVG!
const coloredSvgData = svgFill.fillSvg(originalSvgData);
```

Alternatively, `SvgFill` can provide a transform stream that you can pipe your SVG data into:

```js
const fs = require('fs');
const SvgFill = require('svg-fill');

// Same setup as above
const svgFill = new SvgFill('#FF0000');

// E.g. read an SVG file, pipe it through SvgFill
// and save the result to another file:
fs.createReadStream('in.svg')
  .pipe(svgFill.fillSvgStream())
  .pipe(fs.createWriteStream('out.svg'));
```

## Development

### Setup

Clone this repo and `npm install` its dependencies:

```
git clone git@github.com:c1rrus/svg-fill.git

cd svg-fill/

npm install
```

### Building

```
npm run build
```

This will transpile the [TypeScript](https://www.typescriptlang.org/) source code (in the `src/`) directory and output the results to `dist/`.

For development convenience, you can alternatively watch the source files and automatically trigger rebuilds when they change:

```
npm run watch
```

### Running tests

```
npm run test
```

We use [Jest](https://jestjs.io/) for the tests. Each module's unit tests is located alongside its `[module name].ts` file as `[module name].test.ts`.


### Linting

To help keep code consistent and avoid common gotchas, we lint our code using [`typescript-eslint`](https://typescript-eslint.io/). To run it do:

```
npm run lint
```


### Commit message formatting

All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) standard as we use automated release tools that rely on this. [Commit messages are linted](https://commitlint.js.org/) to check this and your CI builds will fail if your messages don't conform.

To make composing suitable commit messages easier, this repo is [Commitizen friendly](http://commitizen.github.io/cz-cli/). We strongly recommend using commitizen rather than using `git` directly. To use it, simply run:

```
npm run commit
```

...and follow the prompts in your terminal.
