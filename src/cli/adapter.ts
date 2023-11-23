import dedent from 'dedent'
import fs from 'fs'
import path from 'path'
import { command } from 'cleye'

import { schemaToAdapterFiles } from '../utils/schema'
import { getAdapterModuleAbsolutePath } from '../utils/command-line'

import config from '../config'
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
    },
  },
  async (argv) => {
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
  }
)
