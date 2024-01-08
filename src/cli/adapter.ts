import dedent from 'dedent'
import fs from 'fs'

import { askQuestion } from '../utils/interactive-cli'
import { getAdapterByPath, UsedAdapter } from '../utils/adapter'

import config from '../config'

export const adapterUse = async (options: {
  silent: boolean
  adapterModulePath: string
}) => {
  const { adapter, adapterAbsolutePath } = getAdapterByPath(
    options.adapterModulePath
  )

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

  if (options.silent !== true) {
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

export const adapterUnuse = async (options: { usedAdapterName: string }) => {
  // FIXME: implement
  console.log(options)
  throw Error('Not implemented')
}

export const adapterList = () => {
  config.usedAdapters.forEach(({ name, version }) => {
    console.log(`${name} ${version}`)
  })
}
