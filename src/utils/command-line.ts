import fs from 'fs'
import { SpadarError } from './error'
import { resolvePath } from './path'

import * as I from '../types'

export const getIsRunningInPipe = () => !process.stdin.isTTY

export const getCLIPipeMessage = (): Promise<string> =>
  new Promise((resolve) => {
    let message = ''

    process.stdin.on('data', (chunk) => (message += chunk.toString().trim()))
    process.stdin.on('end', () => resolve(message))
  })

const reduceToBuffer = (filePath: string): Buffer => {
  const absolutePath = resolvePath(filePath)

  if (fs.existsSync(absolutePath) === false) {
    throw new SpadarError(`Could't find Buffer source: ${filePath}`)
  }

  return fs.readFileSync(absolutePath)
}

export const collectFlags = <T extends Record<string, I.PropSchema>>(
  schema: T,
  argv: string[]
): I.SchemaToType<T> => {
  // eslint-disable-next-line
  const result: any = {}

  for (const key in schema) {
    const propSchema = schema[key]
    const expectedFlag = key.length === 1 ? `-${key}` : `--${key}`
    const flagIndex = argv.findIndex((x) => x === expectedFlag)

    const value = argv[flagIndex + 1]

    if (flagIndex === -1) {
      if (typeof propSchema === 'object') {
        if (propSchema.required && !propSchema.default) {
          throw new SpadarError(
            `The required flag is not specified: ${expectedFlag}`
          )
        }

        result[key] = propSchema.default
        continue
      }

      if (propSchema === 'boolean') {
        result[key] = false
        continue
      }

      continue
    }

    const flagValue = ((): string | number | boolean | Buffer => {
      if (typeof propSchema === 'object') {
        switch (propSchema.type) {
          case 'string': {
            if (typeof value !== 'string') {
              if (typeof propSchema.default !== 'string') {
                throw new SpadarError(
                  `The ${expectedFlag} value should be a string`
                )
              }

              return propSchema.default
            }

            return value
          }

          case 'number': {
            const parsedFloat = parseFloat(value)

            if (isFinite(parsedFloat) === false) {
              if (typeof propSchema.default !== 'number') {
                throw new SpadarError(
                  `The ${expectedFlag} value should be a number`
                )
              }

              return propSchema.default
            }

            return parsedFloat
          }

          case 'boolean': {
            if (typeof value === 'undefined') {
              return true
            }

            if (typeof value === 'string') {
              try {
                const parsed = JSON.parse(value)

                if (typeof parsed === 'boolean') {
                  return parsed
                }
              } catch (_) {
                // TODO: forbide to name key props with literal { "true": '...' } or
                //       { "false": '...' } on the ADAPTER SCHEMA level
                return true
              }
            }

            return true
          }

          case 'Buffer': {
            if (typeof value !== 'string') {
              if (!propSchema.default) {
                throw new SpadarError(
                  `The ${expectedFlag} value should be path to a file`
                )
              }

              return propSchema.default
            }

            return reduceToBuffer(value)
          }

          case 'stringUnion': {
            if (propSchema.of.includes(value) === false) {
              if (typeof propSchema.default !== 'string') {
                const allowedOptions = propSchema.of.join(', ')
                throw new SpadarError(
                  `The ${expectedFlag} value should be one of: ${allowedOptions}`
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
          case 'string': {
            if (typeof value !== 'string') {
              throw new SpadarError(
                `The ${expectedFlag} value should be a string`
              )
            }

            return value
          }

          case 'number': {
            const parsedFloat = parseFloat(value)

            if (isFinite(parsedFloat) === false) {
              throw new SpadarError(
                `The ${expectedFlag} value should be a number`
              )
            }

            return parsedFloat
          }

          case 'boolean': {
            if (typeof value === 'undefined') {
              return true
            }

            if (typeof value === 'string') {
              try {
                const parsed = JSON.parse(value)

                if (typeof parsed === 'boolean') {
                  return parsed
                }
              } catch (_) {
                // TODO: forbid to name key props with literal { "true": '...' } or
                //       { "false": '...' } on the ADAPTER SCHEMA level
                return true
              }
            }

            return true
          }

          case 'Buffer': {
            if (typeof value !== 'string') {
              throw new SpadarError(
                `The ${expectedFlag} value should be path to a file`
              )
            }

            return reduceToBuffer(value)
          }
        }
      }

      throw new SpadarError('Unknown property schema')
    })()

    result[key] = flagValue
  }

  return result
}

export const cmd = <T extends Record<string, I.PropSchema>>(
  flagsSchema: T,
  callback: (flags: I.SchemaToType<T>, pipeInput: unknown) => void
) => {
  return (argv: string[]) => {
    const parsedFlags = collectFlags(flagsSchema, argv)

    if (process.env['NODE_ENV'] !== 'test' && getIsRunningInPipe()) {
      return getCLIPipeMessage().then((data) => {
        const parsedData = ((): unknown => {
          try {
            return JSON.parse(data)
          } catch (_) {
            return data
          }
        })()

        callback(parsedFlags, parsedData)
      })
    }

    callback(parsedFlags, undefined)
  }
}

/**
 * @example
 *
 * ```typescript
 * initCli([
 *   // ROOT command
 *   [
 *     [],
 *     cmd(
 *      { h: { type: 'boolean' }, help: { type: 'boolean'} },
 *      ({ h, help }) => {
 *        if (h || help) {
 *         console.log('Nobody will help you and you will die alone')
 *        }
 *      }
 *     )
 *   ],
 *
 *   // Third level command
 *   [
 *    ['textToText', 'spadar-openai', 'GPT.string.string'],
 *    cmd({}, () => {})
 *   ],
 *
 *   // Without using cmd
 *   [
 *     ['customCmd'],
 *     (argv: string[]) => {}
 *   ],
 *
 * ])(process.argv.slice(2))
 * ```
 **/
export const initCli = (
  commands: Array<[string[], ReturnType<typeof cmd>]>
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

      if (pathChunk[0] === '-') {
        throw new SpadarError(`
          Found flag in "commandPath" strings:
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

      const isPathsEqual = (() => {
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

      if (isPathsEqual) {
        throw new SpadarError(`
            Found "CommandPath" duplicate:
            [${commandPath.map((x) => `"${x}"`).join(', ')}]
            [${referenceCommandPath.map((x) => `"${x}"`).join(', ')}]
          `)
      }
    }
  }

  const getPathLiteral = (pathChunks: string[]) => pathChunks.join('')

  const commandByPathLiteral = commands.reduce<
    Map<string, [string[], ReturnType<typeof cmd>]>
  >((acc, command) => {
    const [commandPath] = command
    acc.set(getPathLiteral(commandPath), command)
    return acc
  }, new Map())

  return (argv: string[]) => {
    const command = ((): [string[], ReturnType<typeof cmd>] | undefined => {
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
        ? `The following command is not exists: ${argv.join(' ')}`
        : 'No commands is provided'

      throw new SpadarError(errorMessage)
    }

    const callback = command[1]

    callback(argv)
  }
}
