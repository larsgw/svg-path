let curveParts = 10

function rotatePoint ([x, y], rotation) {
  let distance = Math.hypot(x, y)
  let angle = Math.atan2(y, x) + rotation

  return [
    Math.cos(angle) * distance,
    Math.sin(angle) * distance
  ]
}

function getEllipse (prev, next, rx, ry, rotation, negate) {
  // align ellipse with coordinate axes
  if (rotation !== 0) {
    prev = rotatePoint(prev, -rotation)
    next = rotatePoint(next, -rotation)
  }

  let [x1, y1] = prev
  let [x2, y2] = next

  // see https://www.w3.org/TR/SVG/implnote.html#ArcCorrectionOutOfRangeRadii
  let lambda = (0.5 * (x1 - x2)) ** 2 / rx ** 2 + (0.5 * (y1 - y2)) ** 2 / ry ** 2
  if (lambda > 1) {
    rx *= Math.sqrt(lambda)
    ry *= Math.sqrt(lambda)
  }

  // see https://stackoverflow.com/a/198137
  let r1 = (x2 - x1) / (2 * rx)
  let r2 = (y1 - y2) / (2 * ry)

  let a1 = Math.atan2(r1, r2)
  let a2 = Math.asin(Math.hypot(r1, r2))

  let t1 = negate ? Math.PI + (a1 - a2) : a1 + a2
  let t2 = negate ? Math.PI + (a1 + a2) : a1 - a2

  let x0 = x1 - rx * Math.cos(t1)
  let y0 = y1 - ry * Math.sin(t1)

  return {x: x0, y: y0, a: rx, b: ry, arcStart: t1, arcEnd: t2}
}

function getBinomial (n, k) {
  let binomial = 1

  for (let i = n - k + 1; i <= n; i++) {
    binomial *= i
  }
  for (let i = 1; i <= k; i++) {
    binomial /= i
  }

  return binomial
}

function bezier (...points) {
  const order = points.length - 1

  let binomials = []
  for (let i = 0; i < points.length; i++) {
    binomials.push(getBinomial(order, i))
  }

  return function curve (t) {
    let x = 0
    let y = 0

    for (let i = 0; i < points.length; i++) {
      let factor = binomials[i] * (1 - t) ** (order - i) * t ** i
      x += factor * points[i][0]
      y += factor * points[i][1]
    }

    return [x, y]
  }
}

const commands = {
  A ([radiusX, radiusY, rotation, largeArc, sweep, ...next], prev) {
    // most edge cases
    if (radiusX === 0 || radiusY === 0) {
      return [next]
    } else if (next[0] === prev[0] && next[1] === prev[1]) {
      return []
    }

    radiusX = Math.abs(radiusX)
    radiusY = Math.abs(radiusY)
    rotation = (rotation % 360) * Math.PI / 180

    // normal cases & too small radii
    let points = []

    let ellipse = getEllipse(prev, next, radiusX, radiusY, rotation, largeArc !== sweep)
    let arc = ellipse.arcEnd - ellipse.arcStart

    if (largeArc) {
      arc = -Math.sign(arc) * (2 * Math.PI - Math.abs(arc))
    }

    let parts = Math.floor(curveParts * Math.abs(arc) / Math.PI)
    parts = Math.max(parts, 0.5 * curveParts)

    for (let i = 1; i <= parts; i++) {
      let angle = ellipse.arcStart + arc * i / parts
      points.push([
        ellipse.x + ellipse.a * Math.cos(angle),
        ellipse.y + ellipse.b * Math.sin(angle)
      ])
    }

    return points.map(point => rotatePoint(point, rotation))
  },

  C (args, prev) {
    let points = []

    let control1 = args.slice(0, 2)
    let control2 = args.slice(2, 4)
    let next = args.slice(4, 6)
    let curve = bezier(prev, control1, control2, next)

    for (let i = 1; i <= curveParts; i++) {
      let progress = i / curveParts
      points.push(curve(progress))
    }

    return points
  },

  L (next) {
    return [next]
  },

  M (next) {
    return [next]
  },

  Q (args, prev) {
    let points = []

    let control = args.slice(0, 2)
    let next = args.slice(2, 4)
    let curve = bezier(prev, control, next)

    for (let i = 1; i <= curveParts; i++) {
      let progress = i / curveParts
      points.push(curve(progress))
    }

    return points
  }
}

export function commandToPolygon ({type, args}, prev) {
  return commands[type](args.slice(), prev)
}
