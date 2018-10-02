function relativePoint ([x1, y1], [x2, y2]) {
  return [x1 + x2, y1 + y2]
}

function reflectPoint ([x1, y1], [x2, y2]) {
  return [2 * x2 - x1, 2 * y2 - y1]
}

export function normalizeCommand (type, args, {pos, bezier, pathStart}) {
  let out = {}

  switch (type) {
    case 'a':
      args = [...args.slice(0, 5), ...relativePoint(args.slice(5, 7), pos.prev)]
      // fall through
    case 'A':
      out.args = args.slice(0, 5)
      out.pos = args.slice(5, 7)
      break

    case 'c':
      out.args = [].concat(
        relativePoint(args.slice(0, 2), pos.prev),
        bezier.cubic = relativePoint(args.slice(2, 4), pos.prev)
      )
      out.pos = relativePoint(args.slice(4, 6), pos.prev)
      break
    case 'C':
      out.args = [].concat(
        args.slice(0, 2),
        bezier.cubic = args.slice(2, 4)
      )
      out.pos = args.slice(4, 6)
      break

    case 'h':
      out.pos = relativePoint([args[0], 0], pos.prev)
      break
    case 'H':
      out.pos = [args[0], pos.prev[1]]
      break

    case 'l':
      out.pos = relativePoint(args, pos.prev)
      break
    case 'L':
      out.pos = args
      break

    case 'm':
      out.pos = relativePoint(args, pos.prev)
      if (pathStart) {
        pos.start = out.pos
      }
      break
    case 'M':
      out.pos = args
      if (pathStart) {
        pos.start = out.pos
      }
      break

    case 'q':
      out.args = bezier.quadratic = relativePoint(args.slice(0, 2), pos.prev)
      out.pos = relativePoint(args.slice(2, 4), pos.prev)
      break
    case 'Q':
      out.args = bezier.quadratic = args.slice(0, 2)
      out.pos = args.slice(2, 4)
      break

    case 's':
      out.args = [].concat(
        reflectPoint(bezier.cubic || pos.prev, pos.prev),
        bezier.cubic = relativePoint(args.slice(0, 2), pos.prev)
      )
      out.pos = relativePoint(args.slice(2, 4), pos.prev)
      break
    case 'S':
      out.args = [].concat(
        reflectPoint(bezier.cubic || pos.prev, pos.prev),
        bezier.cubic = args.slice(0, 2)
      )
      out.pos = args.slice(2, 4)
      break

    case 't':
      out.args = bezier.quadratic = reflectPoint(bezier.quadratic || pos.prev, pos.prev)
      out.pos = relativePoint(args, pos.prev)
      break
    case 'T':
      out.args = bezier.quadratic = reflectPoint(bezier.quadratic || pos.prev, pos.prev)
      out.pos = args
      break

    case 'v':
      out.pos = relativePoint([0, args[0]], pos.prev)
      break
    case 'V':
      out.pos = [pos.prev[0], args[0]]
      break

    case 'z':
    case 'Z':
      out.pos = pos.start
      break
  }

  if ('zZvVhH'.match(type)) {
    out.type = 'L'
  } else if ('mM'.match(type) && !pathStart) {
    out.type = 'L'
  } else if ('tT'.match(type)) {
    out.type = 'Q'
  } else if ('sS'.match(type)) {
    out.type = 'C'
  } else if ('mlacqMLACQ'.match(type)) {
    out.type = type.toUpperCase()
  }

  return out
}
