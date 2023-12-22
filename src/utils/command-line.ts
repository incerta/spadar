import os from 'os'
import { execSync } from 'child_process'

import { SpadarError } from './error'
import * as I from '../types'

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

// TODO: support shorthand aliases for the flags, for example flag `--help`
//       expected to have `-h` alias

// TODO: add unit tests for the `collectFlags` function

// FIXME: we should assume that if Buffer property type is came from
//        the cli flags it must be either file path or URL to the file
//        so we need a function `reduceToBuffer(urlOrFilePath: string)`
//        which should be used within `collectFlags` function for the `Buffer` case
export const collectFlags = <T extends Record<string, I.PropSchema>>(
  schema: T,
  argv: string[]
): {
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
} => {
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

type FlagsSchmaExpectedType<T> = {
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

/**
 * @param argv - sequence of commands initially passed from `process.argv.slice(2)`,
 *               for the `runCli` function we want to allow its usage recursively
 *
 * @param help - help will be logged in to types of scenarios:
 *               1) The command has `-h` or `--help` specified flags
 *               2) No `commandPath` matches are found on the `commands` level
 **/
export const runCli =
  (argv: string[], help?: string) =>
  <
    T extends Record<string, I.PropSchema>,
    U extends (restArgv: string[], flags: FlagsSchmaExpectedType<T>) => void
  >(
    commands: Array<[commandPath: string[], flagsSchema: T, callback: U]>
  ) => {
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
            within the root of the recursive "runCli" call inside a command "callback".
          `)
        }

        for (let k = 0; k < commandPath.length; k++) {
          if (commandPath[k] === referenceCommandPath[k]) {
            throw new SpadarError(`
              Found "CommandPath" duplicate:
              [${commandPath.map((x) => `"${x}"`).join(', ')}]
            `)
          }
        }
      }
    }

    /**
     * Call the command callback if `commandPath` matches with `argv`,
     * collect/validate specified flags by the `flagsSchema`, pass the rest
     * of `commandPath` to the callback `restArgv` argument which can be
     * handled by the `runCli` recursive call
     **/

    const commandMatch = commands.reduce<{
      matchNCommandPathChunks: number
      command?: [commandPath: string[], flagsSchema: T, callback: U]
    }>(
      (acc, command) => {
        const [commandPath] = command

        const pathChunkMatchSequenceLength = ((): number | undefined => {
          if (argv.length > commandPath.length) {
            return undefined
          }

          if (argv.length === 0 && commandPath.length === 0) {
            return 0
          }

          let result: number | undefined

          for (let i = 0; i < commandPath.length; i++) {
            if (typeof result === 'undefined' && i > 0) {
              return result
            }

            if (typeof result === 'number' && i + 1 > result) {
              return result
            }

            if (argv[i] === commandPath[i]) {
              result = (result || 0) + 1
            }
          }

          return result
        })()

        if (typeof pathChunkMatchSequenceLength !== 'number') {
          return acc
        }

        if (pathChunkMatchSequenceLength > acc.matchNCommandPathChunks) {
          acc.matchNCommandPathChunks = pathChunkMatchSequenceLength
          acc.command = command
        }

        return acc
      },
      {
        matchNCommandPathChunks: -Infinity,
        command: undefined,
      }
    )

    const { command } = commandMatch

    if (typeof command === 'undefined') {
      console.log(
        help || `The follwoing command is not exists: ${argv.join(' ')}`
      )

      return
      // FIXME: use command below instead of `return`
      // process.exit(1)
    }

    // TODO: configure eslint to ignore identifiers prefixed with underscore sign
    const [_, flagsSchema, callback] = command

    const restArgv = argv
    const collectedFlags = collectFlags(flagsSchema, argv)

    callback(restArgv, collectedFlags)
  }
