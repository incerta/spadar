import dedent from 'dedent'
import { command } from 'cleye'

import { generateAPITypingsFromSchema } from '../utils/schema'
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
      schemaToType: {
        type: Boolean,
        description: dedent(`
            If current directory is an ADAPTER path generate/regenrate typings 
            from "${config.adapterModule.schemaFilePath}" file`),
      },
    },
  },
  async (argv) => {
    if (argv.flags.schemaToType) {
      const shemaFilePath = getAdapterModuleAbsolutePath(
        config.adapterModule.schemaFilePath
      )

      if (!shemaFilePath) return

      const schema = require(shemaFilePath).default as I.AdapterSchema[]
      const apiTypings = generateAPITypingsFromSchema(schema)

      console.log(JSON.stringify(apiTypings))

      /* 
      const typingsAbsolutePath =
        process.cwd() + '/' + config.adapter.typingsPath

      fs.writeFileSync(typingsAbsolutePath, apiTypings)

      console.log(
        `\nThe typings has beend succesfully written into: "${typingsAbsolutePath}" file\n`
      )
      */
      process.exit(0)
    }
  }
)
