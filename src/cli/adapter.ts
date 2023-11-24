import dedent from 'dedent'
import fs from 'fs'
import path from 'path'
import { command } from 'cleye'

import { schemaToAdapterFiles } from '../utils/schema'
import { getAdapterModuleAbsolutePath } from '../utils/command-line'
import { askQuestion } from '../utils/interactive-cli'

import config, { UsedAdapter } from '../config'
import * as I from '../types'

export default command(
  {
    name: 'adapter',
    help: {
      description: 'The CLI API for adapter module generation',
    },
    flags: {
      silent: {
        type: Boolean,
        description: 'Every log will be ommited with an exception of errors',
        alias: 's',
      },
      generate: {
        type: Boolean,
        description: dedent(`
          If current directory is an ADAPTER path generate/regenrate typings 
          from "${config.adapter.schemaFilePath}" file`),
        alias: 'g',
      },
      use: {
        type: String,
        description: dedent(
          `Specify absolute or relative path to the adapter module`
        ),
        alias: 'u',
      },
      list: {
        type: Boolean,
        description: 'List all currently connected adapters',
      },

      // TODO: implement `--health` flag which checks if
      //       connected adapter is actually available and which
      //       keys of the given adapter are actually specified in
      //       the config
    },
  },
  async (argv) => {
    // TODO: if multiple flags are set that should not supposed to
    //       work with each other we should throw an error

    if (argv.flags.generate) {
      const shemaFilePath = getAdapterModuleAbsolutePath(
        config.adapter.schemaFilePath
      )

      const packageJSONFilePath = getAdapterModuleAbsolutePath(
        config.adapter.packageJSON
      )

      const schema = require(shemaFilePath).default as I.ConnectorSchema[]
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
            Initially generated but now ignored files (might require manual edditing):\n
            ${ignoredFilePaths.join('\n')}
        `) + '\n'
      }

      if (argv.flags.silent !== true) console.log(generationLog)
      process.exit(0)
    }

    if (argv.flags.use) {
      // TODO: support connection of the multiple adapters at once

      const isRelativePath = argv.flags.use[0] === '.'
      const adapterModulePath = isRelativePath
        ? getAdapterModuleAbsolutePath(argv.flags.use)
        : argv.flags.use

      const adapter = require(adapterModulePath +
        config.adapter.adapterEntryPoint).default as I.Adapter

      const usedAdapter = config.userConfig.usedAdapters.find(
        (x) => x.name === adapter.name
      )

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
        path: adapterModulePath,
        specifiedKeys: usedAdapter?.specifiedKeys || {},
        requiredKeys: requiredKeys,
      }

      if (usedAdapter) {
        config.userConfig.usedAdapters = config.userConfig.usedAdapters.filter(
          (x) => x.name !== usedAdapter.name
        )
      }

      config.userConfig.usedAdapters.push(updatedUsedAdapter)

      fs.writeFileSync(
        config.resources.usedAdaptersFilePath,
        JSON.stringify(config.userConfig.usedAdapters)
      )

      const { name, version } = updatedUsedAdapter

      if (argv.flags.silent !== true) {
        console.log(
          `\nYour adapter ${name}@${version} had been succesfully connected!\n`
        )

        const notSpecifiedKeys: Array<{ key: string; description?: string }> =
          []

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
          JSON.stringify(config.userConfig.usedAdapters)
        )
        // TODO: log if connected adapter could be used in spadar cli chat
        //       based on the provided schema
      }
    }
  }
)
