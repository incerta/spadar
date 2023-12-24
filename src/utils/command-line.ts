import os from 'os'
import { execSync } from 'child_process'

import { SpadarError } from './error'
import * as I from '../types'

type Command<T extends Record<string, I.PropSchema>, U> = [
  commandPath: string[],
  flagsSchema: T,
  callback: U
]

type ParsedFlags<T extends Record<string, I.PropSchema>> = {
  [k in keyof T]: T[k] extends I.StringPropSchema
    ? OptionalizeProp<T[k], string>
    : T[k] extends I.NumberPropSchema
    ? OptionalizeProp<T[k], number>
    : T[k] extends I.BooleanPropSchema
    ? OptionalizeProp<T[k], boolean>
    : T[k] extends I.BufferPropSchema
    ? OptionalizeProp<T[k], Buffer>
    : T[k] extends I.StringUnionPropSchema
    ? OptionalizeProp<T[k], T[k]['of'][0]>
    : T[k] extends 'string'
    ? string
    : T[k] extends 'number'
    ? number
    : T[k] extends 'boolean'
    ? boolean
    : T[k] extends 'Buffer'
    ? Buffer
    : never
}

// FIXME: we actually don't need it, if someone wants to
//        pass the message from clipboard to chat for example
//        they could use cli pipes, for macos the command
//        could look like:
//        ```
//        pbpaste | spadar chat spadar-openai GPT
//        ```
export function getClipboardText(): string | null {
  const command = ((): string => {
    switch (process.platform) {
      case 'darwin':
        return 'pbpaste'
      // TODO: did't actually tested on `windows` yet
      case 'win32':
        return 'powershell.exe -command "Get-Clipboard"'
      default:
        // TODO: try to find solution that works without `xclip` util
        return 'xclip -selection clipboard -o' // Linux (requires xclip to be installed)
    }
  })()

  const output = execSync(command, { encoding: 'utf-8' })

  if (typeof output !== 'string') return null

  return output.trim()
}

export const getIsRunningInPipe = () => !process.stdin.isTTY

export const getCLIPipeMessege = (): Promise<string> =>
  new Promise((resolve) => {
    let message = ''

    process.stdin.on('data', (chunk) => (message += chunk.toString().trim()))
    process.stdin.on('end', () => resolve(message))
  })

// TODO: consider moving the `resolvePath` function from `command-line.ts`
//       somewhere else because path resolution is not directly connected
//       to command line and has much broader scope

/**
 * Resolve the absolute path from the given path.
 * Trailing forward slash (`/`) will be removed
 *
 * @example IO
 *
 * - `/` -> ``
 * - `~` -> `/${userDirectory}`
 * - `.` -> `/${process.cwd()}`
 * - ` ` -> `/${process.cwd()}`
 *
 * TODO: support `..` -> `/${parentDirPath}
 **/
export const resolvePath = (fileOrDirPath: string): string => {
  const trimmed = fileOrDirPath.trim()

  if (trimmed[0] === '.' && trimmed[1] == '.') {
    throw new SpadarError(
      `Invalid path format: "${trimmed}. We don't support ".." pathes resolution yet"`
    )
  }

  if (trimmed.length === 0) return process.cwd()

  const removeTrailingSlash = (x: string) =>
    x[x.length - 1] === '/' ? x.slice(0, x.length - 1) : x

  if (trimmed[0] === '/') return removeTrailingSlash(trimmed)

  if (trimmed[0] === '~') {
    if (trimmed[1] !== '/') {
      throw new SpadarError(`Invalid path format: "${trimmed}"`)
    }

    return removeTrailingSlash(os.homedir() + trimmed.slice(1))
  }

  if (trimmed === '.') return process.cwd()
  if (trimmed[0] === '.') {
    if (trimmed[1] !== '/') {
      throw new SpadarError(`Invalid path format: "${trimmed}"`)
    }

    return removeTrailingSlash(process.cwd() + trimmed.slice(1))
  }

  return removeTrailingSlash(process.cwd() + '/' + trimmed)
}

type OptionalizeProp<T extends I.ObjectPropSchema, U> = T extends {
  required: true
}
  ? U
  : U | undefined

// FIXME: we should assume that if Buffer property type is came from
//        the cli flags it must be either file path or URL to the file
//        so we need a function `reduceToBuffer(urlOrFilePath: string)`
//        which should be used within `collectFlags` function for the `Buffer` case
export const collectFlags = <T extends Record<string, I.PropSchema>>(
  schema: T,
  argv: string[]
): ParsedFlags<T> => {
  // eslint-disable-next-line
  const result: any = {}

  for (const key in schema) {
    const propSchema = schema[key]
    const flagIndex = argv.findIndex((x) => x === `--${key}`)

    if (flagIndex === -1) {
      if (typeof propSchema === 'object' && propSchema.required) {
        if (!propSchema.default) {
          throw new SpadarError(`The required flag is not specified: --${key}`)
        }

        result[key] = propSchema.default
        continue
      }
      continue
    }

    const flagValue = ((): string | number | boolean => {
      const value = argv[flagIndex + 1]

      if (typeof propSchema === 'object') {
        switch (propSchema.type) {
          case 'Buffer': {
            throw new SpadarError(
              `We are not supporting binary data passed as cli flag parameter value`
            )
          }

          case 'string': {
            if (typeof value !== 'string') {
              if (typeof propSchema.default !== 'string') {
                throw new SpadarError(`The --${key} value should be a string`)
              }

              return propSchema.default
            }

            return value
          }

          case 'number': {
            const parsedFloat = parseFloat(value)

            if (isFinite(parsedFloat) === false) {
              if (typeof propSchema.default !== 'number') {
                throw new SpadarError(`The --${key} value should be a number`)
              }

              return propSchema.default
            }

            return parsedFloat
          }

          case 'boolean': {
            return true
          }

          case 'stringUnion': {
            if (propSchema.of.includes(value) === false) {
              if (typeof propSchema.default !== 'string') {
                const allowedOptions = propSchema.of.join(', ')
                throw new SpadarError(
                  `The --${key} value should be one of: ${allowedOptions}`
                )
              }

              return propSchema.default
            }

            return value
          }
        }
      }

      if (typeof propSchema === 'string') {
        switch (propSchema) {
          case 'Buffer': {
            throw new SpadarError(
              `We are not supporting binary data passed as cli flag parameter value`
            )
          }

          case 'string': {
            if (typeof value !== 'string') {
              throw new SpadarError(`The --${key} value should be a string`)
            }

            return value
          }

          case 'number': {
            const parsedFloat = parseFloat(value)

            if (isFinite(parsedFloat) === false) {
              throw new SpadarError(`The --${key} value should be a number`)
            }

            return parsedFloat
          }

          case 'boolean': {
            return true
          }
        }
      }

      throw new SpadarError('Unknown property schema')
    })()

    result[key] = flagValue
  }

  return result
}

/**
 * @example
 *
 * ```typescript
 * initCli([
 *   // ROOT command
 *   [[], { h: { type: 'boolean' }, help: { type: 'boolean'} }, ({ h, help }) => {
 *     if (h || help) {
 *       console.log('Nobody will help you and you will die alone')
 *     }
 *   }],
 *
 *   // First level command
 *   [
 *     ['textToText'],
 *     { h: { type: 'boolean' }, help: { type: 'boolean'} },
 *     ({ h, help }) => {}
 *   }],
 *
 *   // Third level command
 *   [['textToText', 'spadar-openai', 'GPT', 'string.string'], {}, () => {
 *      //...
 *   }],
 * ])(process.argv.slice(2))
 * ```
 **/
export const initCli = <
  T extends Record<string, I.PropSchema>,
  U extends (flags: ParsedFlags<T>) => void
>(
  commands: Command<T, U>[]
): ((argv: string[]) => void) => {
  /**
   * Validate `commandPath` compatibility with each other
   **/

  for (let i = 0; i < commands.length; i++) {
    const [commandPath] = commands[i]

    for (const pathChunk of commandPath) {
      if (pathChunk === '') {
        throw new SpadarError(`
          Found empty string in "commandPath":
          [${commandPath.map((x) => `"${x}"`).join(', ')}]
        `)
      }

      if (/\s/.test(pathChunk)) {
        throw new SpadarError(`
          Found whitespace in "commandPath" strings:
          [${commandPath.map((x) => `"${x}"`).join(', ')}]
        `)
      }
    }

    if (i === commands.length - 1) {
      continue
    }

    /* Find `commandPath` duplicates */

    for (let j = i + 1; j < commands.length; j++) {
      const [referenceCommandPath] = commands[j]

      if (commandPath.length !== referenceCommandPath.length) {
        continue
      }

      if (commandPath.length === 0) {
        throw new SpadarError(`
          A duplicate "commandPath" was found along the commands array at the same level.
          Only one empty array in "commandPath" is allowed for the given list of
          commands as a means of reaction to the root command like "spadar" or
          within the root of the recursive "initCli" call inside a command "callback".
        `)
      }

      const isPathesEquall = (() => {
        if (commandPath.length !== referenceCommandPath.length) {
          return false
        }

        for (let k = 0; k < commandPath.length; k++) {
          if (commandPath[k] !== referenceCommandPath[k]) {
            return false
          }
        }

        return true
      })()

      if (isPathesEquall) {
        throw new SpadarError(`
            Found "CommandPath" duplicate:
            [${commandPath.map((x) => `"${x}"`).join(', ')}]
            [${referenceCommandPath.map((x) => `"${x}"`).join(', ')}]
          `)
      }
    }
  }

  const getPathLiteral = (pathChunks: string[]) => pathChunks.join('')

  const commandByPathLiteral = commands.reduce<Map<string, Command<T, U>>>(
    (acc, command) => {
      const [commandPath] = command
      acc.set(getPathLiteral(commandPath), command)
      return acc
    },
    new Map()
  )

  /**
   * @param argv - sequence of commands initially passed from `process.argv.slice(2)`,
   *               for the `initCli` function we want to allow its usage recursively
   **/
  return (argv: string[]) => {
    const command = ((): Command<T, U> | undefined => {
      const argvCommandPathLiteral = (() => {
        const pathChunks: string[] = []

        for (const pathOrFlagChunk of argv) {
          if (pathOrFlagChunk[0] === '-') {
            return getPathLiteral(pathChunks)
          }

          pathChunks.push(pathOrFlagChunk)
        }

        return getPathLiteral(pathChunks)
      })()

      return commandByPathLiteral.get(argvCommandPathLiteral)
    })()

    if (typeof command === 'undefined') {
      const errorMessage = argv.length
        ? `The follwoing command is not exists: ${argv.join(' ')}`
        : 'No commands is provided'

      throw new SpadarError(errorMessage)
    }

    const flagsSchema = command[1]
    const callback = command[2]
    const collectedFlags = collectFlags(flagsSchema, argv)

    callback(collectedFlags)
  }
}
