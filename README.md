# SVG Path

This is a small (WIP) library to normalise SVG paths according to the spec, and create polylines and dimensions based on those normalised paths.

[![NPM version](https://img.shields.io/npm/v/@larsgw/svg-path.svg)](https://npmjs.org/package/@larsgw/svg-path)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![license](https://img.shields.io/github/license/larsgw/citation.js.svg)](https://github.com/larsgw/citation.js/blob/master/LICENSE.md)

## Install

    npm install @larsgw/svg-path

## Usage

```js
let {SvgPath} = require('@larsgw/svg-path')

let path = new SvgPath('M0 0 10 0h20 a15 15,1,0,1,-30 0')
```

### Normalise

```js
path.normalize()

// [
//   {type: 'M', args: [0, 0]},
//   {type: 'L', args: [10, 0]},
//   {type: 'L', args: [30, 0]},
//   {type: 'A', args: [15, 15, 1, 0, 1, 0, 0]}
// ]
```

Normalises all commands (relative, absolute, chained calls) into the absolute variants of A (arc), C (cubic bezier), L (line), M (move), Q (quadratic bezier) and
Z (close). Doesn't handle parameter correction for arc commands, that is currently dealt with in `getPolygons()`.

### Get polygons

```js
path.getPolygons()

// [
//   [[0, 0], [10, 0], [30, 0], ..., [0, 0]]
// ]
```

Get polygons based on this path, one per M (move) command. Precision of polygons for ellipse arcs and bezier curve will be possible to change in the future.

### Get dimensions

```js
path.getDimensions()

// [
//   {
//     width: 30,
//     height: 15,
//     xmin: 0,
//     xmax: 30,
//     ymin: 0,
//     ymax: 15 // may differ depending on the arc rendering precision
//   }
// ]
```

Get dimensions based on the polygons mentioned above, one set per polygon.

### Helper functions

  * `SvgPath.parsePath(string path)` - parse path into list of type/args pairs. splits up chain calls
  * `SvgPath.normalizeCommand(string type, int[] args, object context)` - normalize command given some context
    * `int[] context.pos.start` - endpoint of the previous move command
    * `int[] context.pos.prev` - endpoint of the previous command
    * `int[] context.bezier.cubic` - previous cubic bezier control point
    * `int[] context.bezier.quadratic` - previous quadratic bezier control point
    * `boolean context.pathStart` - whether the command is the start of a new path component (e.g. the first coordinate pair of a move command)
  * `SvgPath.commandToPolygon(object command, int[] prev)` - get polyline based on a command and a starting position (prev)

## License

MIT
