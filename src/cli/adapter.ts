import dedent from 'dedent'
import fs from 'fs'
import path from 'path'

import { SpadarError } from '../utils/error'
import { schemaToAdapterFiles } from '../utils/schema'
import { resolvePath } from '../utils/command-line'
import { askQuestion } from '../utils/interactive-cli'
import { getAdapterByPath, UsedAdapter } from '../utils/adapter'

import config from '../config'
import * as I from '../types'

export const runAdapter = async (flags: {
  generate?: boolean
  use?: string
  silent?: boolean
  list?: boolean
}) => {
  if (flags.generate) {
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

    if (flags.silent !== true) console.log(generationLog)
    process.exit(0)
  }

  if (flags.use) {
    const { adapter, adapterAbsolutePath } = getAdapterByPath(flags.use)

    const usedAdapter = config.usedAdapters.find((x) => x.name === adapter.name)

    const requiredKeys = adapter.schema.reduce<Record<string, string>>(
      (acc, connectorSchema) => {
        connectorSchema.keys.forEach(({ key, description }) => {
          acc[key] = description || 'The key description is not specified'
        })

        return acc
      },
      {}
    )

    const updatedUsedAdapter: UsedAdapter = {
      name: adapter.name,
      version: adapter.version,
      path: adapterAbsolutePath,
      specifiedKeys: usedAdapter?.specifiedKeys || {},
      requiredKeys: requiredKeys,
    }

    if (usedAdapter) {
      config.usedAdapters = config.usedAdapters.filter(
        (x) => x.name !== usedAdapter.name
      )
    }

    config.usedAdapters.push(updatedUsedAdapter)
    const stringifiedUsedAdapters = JSON.stringify(config.usedAdapters, null, 2)

    fs.writeFileSync(
      config.resources.usedAdaptersFilePath,
      stringifiedUsedAdapters,
      'utf-8'
    )

    const { name, version } = updatedUsedAdapter

    if (flags.silent !== true) {
      console.log(
        `\nYour adapter ${name}@${version} had been successfully connected!\n`
      )

      const notSpecifiedKeys: Array<{ key: string; description?: string }> = []

      for (const key in updatedUsedAdapter.requiredKeys) {
        if (!updatedUsedAdapter.specifiedKeys[key]) {
          const description = updatedUsedAdapter.requiredKeys[key]
          notSpecifiedKeys.push({ key, description })
        }
      }

      if (notSpecifiedKeys.length) {
        console.log(
          dedent(`
            We have detected that following keys for the recently connected adapter
            are not yet specified:
          `) + '\n'
        )

        notSpecifiedKeys.forEach(({ key, description }) =>
          console.log(key + ': ' + description)
        )

        console.log('')

        const answer = await askQuestion(
          dedent(`
              You can specify them manually later at the ${config.resources.usedAdaptersFilePath}
              But would you like to specify those keys one by one right now? y/n
          `)
        )

        if (answer.trim() === 'y') {
          for (const { key, description } of notSpecifiedKeys) {
            const secret = await askQuestion(`${key}: ${description}`)
            updatedUsedAdapter.specifiedKeys[key] = secret
          }
        }
      }

      fs.writeFileSync(
        config.resources.usedAdaptersFilePath,
        JSON.stringify(config.usedAdapters, null, 2)
      )
    }
  }

  if (flags.list) {
    if (flags.silent) {
      throw new SpadarError(
        `The --list and --silent flags are incompatible because --list log can not be silent`
      )
    }

    // TODO: log if connected adapter could be used in spadar cli chat
    //       based on the provided schema
  }
}
