import { commands as numOfArgs } from '.'

function point (coords) {
  return coords.join(',')
}

function chunk (args, size) {
  return args.reduce((acc, arg) => {
    let lastIndex = acc.length - 1
    if (acc[lastIndex] && acc[lastIndex].length < size) {
      acc[lastIndex].push(arg)
    } else {
      acc.push([arg])
    }
    return acc
  }, [])
}

function stringifyCommand (args, type) {
  switch (type.toUpperCase()) {
    case 'C':
    case 'L':
    case 'M':
    case 'Q':
    case 'S':
    case 'T':
      return chunk(args, 2).map(point).join(' ')

    case 'A':
      let a = args.splice(0, 2)
      let [b, c, d, ...e] = args
      return `${point(a)} ${b} ${c} ${d} ${point(e)}`

    case 'H':
    case 'V':
      return args[0].toString()

    case 'Z':
    default:
      return ''
  }
}

export function stringify (commands) {
  return commands
    .map(({ type, args }) => {
      let nums = args.slice()
      let key = type.toUpperCase()

      let calls = []

      while (nums.length) {
        calls.push(stringifyCommand(nums.splice(0, numOfArgs[key]), key))
      }

      return `${type}${calls.join(', ')}`
    })
    .join(delimiter)
}
