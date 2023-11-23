import fs from 'fs'
import { execSync } from 'child_process'

import config from '../config'
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

export const getAdapterModuleAbsolutePath = (relativePath: string): string => {
  if (relativePath[0] === '/') {
    throw new SpadarError(`
      The given path "${relativePath}" is absolute, we expect
      relative path as input of "validateFileRelativePath" function
    `)
  }

  // TODO: now one can apply spadar cli command only
  //       if current path is the root of the adapter
  //       module source but we could find the project
  //       root directory from its nested directories
  const currentPath = process.cwd() + '/'
  const supposedFilePath = currentPath + relativePath

  if (fs.existsSync(supposedFilePath) === false) {
    throw new SpadarError(`
      The "${supposedFilePath}" file is not found
    `)
  }

  return supposedFilePath
}
