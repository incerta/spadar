import os from 'os'
import fs from 'fs'
import { execSync } from 'child_process'

import { SpadarError } from './error'

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
