import { command } from 'cleye'
import { mapModulePackageFiles } from '../utils/package-management'

const BOT_NAME_LENGTH_MIN = 3
const BOT_NAME_LENGTH_MAX = 214

function getExistedBotNames(): Set<string> {
  console.log('ATTEMPT')
  mapModulePackageFiles(() => {
    console.log('__')
  })

  return new Set('foxy')
}

async function handlePipe(p: { botName: string | undefined }): Promise<void> {
  const botName = ((): string => {
    const name = (p.botName || '').trim()

    if (name.length < BOT_NAME_LENGTH_MIN) {
      throw Error(`Bot name is too short. Min value is ${BOT_NAME_LENGTH_MIN}, given: ${name.length}`)
    }

    if (name.length > BOT_NAME_LENGTH_MAX) {
      throw Error(`Bot name is too long. Max value is ${BOT_NAME_LENGTH_MAX}, given: ${name.length}`)
    }

    return name
  })()

  const botExists = getExistedBotNames().has(botName)

  if (botExists) {
    throw Error(`Couldn't find given --bot-name: ${botName}`)
  }

  let pipeData = ''

  process.stdin.on('data', (chunk) => (pipeData += chunk))
  process.stdin.on('end', () => {
    console.log(pipeData.trim() + ' (edited)')
  })
}

export default command(
  {
    name: 'bot',
    flags: {
      name: {
        type: String,
        description: 'Bot of given name will be used as input processor',
        alias: 'n',
      },
    },
    help: {
      description: 'Use and CRUD your bots',
    },
  },
  async (argv) => {
    const isRunningInPipe = !process.stdin.isTTY

    if (isRunningInPipe) {
      handlePipe({ botName: argv.flags.name })
      return
    }

    console.log('NOT DATA IS PIPED')
  }
)
