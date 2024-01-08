import dedent from 'dedent'
import fs from 'fs'
import path from 'path'

import { SpadarError } from '../utils/error'
import { schemaToAdapterFiles } from '../utils/schema'
import { resolvePath } from '../utils/path'

import config from '../config'
import * as I from '../types'

export const generateAdapterModule = async (options: {
  silent: boolean
  adapterModulePath?: string
}) => {
  console.log(options)
  // FIXME: implement
  throw Error('Not implemented')
}

export const generateAdapterConnectors = async (options: {
  silent: boolean
  // FIXME: use the path
  adapterModulePath?: string
}) => {
  const schemaFilePath = resolvePath(config.adapter.schemaFilePath)
  const packageJSONFilePath = resolvePath(config.adapter.packageJSON)

  if (fs.existsSync(schemaFilePath) !== true) {
    throw new SpadarError(`Could't find schema file at: ${schemaFilePath}`)
  }

  if (fs.existsSync(packageJSONFilePath) !== true) {
    throw new SpadarError(
      `Could't find package.json file at: ${schemaFilePath}`
    )
  }

  const schema = require(schemaFilePath).default as I.ConnectorSchema[]
  const adapterPackageJSON = require(packageJSONFilePath) as {
    name: string
    version: string
  }

  const files = schemaToAdapterFiles(adapterPackageJSON, schema)

  const generatedFilePaths: string[] = []
  const updatedFilePaths: string[] = []
  const ignoredFilePaths: string[] = []

  files.forEach((file) => {
    const absolutePath = process.cwd() + '/' + file.filePath
    const isFileExists = fs.existsSync(absolutePath)
    const shouldIgnoreFile = isFileExists && file.shouldBeEditedManually

    if (shouldIgnoreFile) return ignoredFilePaths.push(absolutePath)

    const directoryPath = path.dirname(absolutePath)

    fs.mkdirSync(directoryPath, { recursive: true })
    fs.writeFileSync(absolutePath, file.body)

    isFileExists
      ? updatedFilePaths.push(absolutePath)
      : generatedFilePaths.push(absolutePath)
  })

  let generationLog = '\n'

  if (generatedFilePaths.length) {
    generationLog +=
      dedent(`
        Newly generated files:\n
        ${generatedFilePaths.join('\n')}
      `) + '\n'
  }

  if (updatedFilePaths.length) {
    generationLog +=
      dedent(`
        Files that updated automatically:\n
        ${updatedFilePaths.join('\n')}
      `) + '\n\n'
  }

  if (ignoredFilePaths.length) {
    generationLog +=
      dedent(`
        Initially generated but now ignored files (might require manual editing):\n
        ${ignoredFilePaths.join('\n')}
      `) + '\n'
  }

  if (options.silent !== true) {
    console.log(generationLog)
  }
}

export const generateAdapterAPI = async (options: {
  silent: boolean
  adapterModulePath?: string
}) => {
  console.log(options)
  // FIXME: implement
  throw Error('Not implemented')
}
