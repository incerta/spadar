import os from 'os'
import { SpadarError } from './error'

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
