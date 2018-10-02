import {normalizeCommand} from './normalizeCommand'
import {commandToPolygon} from './commandToPolygon'
import {normalizePolygonDirection} from './normalizePolygonDirection'

const commands = {
  M: 2,
  Z: 0,
  L: 2,
  H: 1,
  V: 1,

  A: 7,

  C: 6,
  S: 4,
  Q: 4,
  T: 2
}

export class SvgPath {
  constructor (path) {
    this.path = SvgPath.parsePath(path)
  }

  static parsePath (path) {
    return path.trim().split(/(?!^)\s*(?=[a-df-z])/i).map((command) => {
      let type = command[0]
      let key = type.toUpperCase()
      let data = command.slice(1)

      if (!commands.hasOwnProperty(key)) {
        throw new SyntaxError(`Invalid SVG path command: "${type}"`)
      }

      return {
        type,
        key,
        args: data.trim().split(/\s*,\s*|\s+|(?=-)/g).map(parseFloat)
      }
    })
  }

  static normalizeCommand (...args) {
    return normalizeCommand(...args)
  }

  static commandToPolygon (...args) {
    return commandToPolygon(...args)
  }

  normalize () {
    let pos = {
      prev: [0, 0],
      start: [0, 0]
    }
    let bezier = {
      cubic: [0, 0],
      quadratic:[0, 0]
    }
    let pathStart

    this.normalizedPath = this.path.map((command) => {
      let commandList = []

      let numOfArgs = commands[command.key]
      let totalCalls = numOfArgs !== 0 ? command.args.length / numOfArgs : 1

      if (command.key === 'M') {
        pathStart = true
      }

      for (let i = 0; i < totalCalls; i++) {
        let args = command.args.slice(i * numOfArgs, (i + 1) * numOfArgs)
        let out = SvgPath.normalizeCommand(command.type, args, {pos, bezier, pathStart})

        pos.prev = out.pos
        pathStart = false

        commandList.push({
          type: out.type,
          args: [...(out.args || []), ...out.pos]
        })
      }

      return commandList
    }).reduce((acc, arr) => {
      return acc.concat(arr)
    }, [])
  }

  getPolygons () {
    if (!this.normalizedPath) {
      this.normalize()
    }

    let prev = [0, 0]

    let polygons = this.normalizedPath.reduce((polygons, command) => {
      if (command.type === 'M') {
        polygons.push([])
      }

      let polygon = polygons[polygons.length - 1]

      let points
      if (command.type === 'Z') {
        points = [polygon[0]]
      } else {
        points = SvgPath.commandToPolygon(command, prev)
      }

      polygon.push(...points)
      prev = points[points.length - 1]

      return polygons
    }, [])

    this.polygons = polygons.map(normalizePolygonDirection)

    return this.polygons
  }

  getDimensions () {
    if (!this.polygons) {
      this.getPolygons()
    }

    return this.polygons.map((polygon) => {
      let xmin = Infinity
      let xmax = -Infinity
      let ymin = Infinity
      let ymax = -Infinity

      for (let [x, y] of polygon) {
        xmin = Math.min(x, xmin)
        xmax = Math.max(x, xmax)
        ymin = Math.min(y, ymin)
        ymax = Math.max(y, ymax)
      }

      return {
        width: Math.abs(xmax - xmin),
        height: Math.abs(ymax - ymin),
        xmin,
        xmax,
        ymin,
        ymax
      }
    })
  }
}
