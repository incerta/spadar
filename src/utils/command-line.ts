import os from 'os'
import { execSync } from 'child_process'

import { SpadarError } from './error'
import * as I from '../types'

export function getClipboardText(): string | null {
  const command = ((): string => {
    switch (process.platform) {
      case 'darwin':
        return 'pbpaste'
      // FIXME: did't actually tested on `windows` yet
      case 'win32':
        return 'powershell.exe -command "Get-Clipboard"'
      default:
        // FIXME: try to find solution that works without `xclip` util
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

export const collectFlags = (
  schema: Record<string, I.PropSchema>,
  argv: string[]
): Record<string, string | number | boolean | Buffer> => {
  const result: Record<string, string | number | boolean | Buffer> = {}

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
