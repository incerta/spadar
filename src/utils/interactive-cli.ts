import * as cliColor from 'kolorist'
import * as clackPrompt from '@clack/prompts'

import * as I from '../types'

export async function getUserPrompt(message: string) {
  const group = clackPrompt.group(
    {
      prompt: () =>
        clackPrompt.text({
          message,
          validate: (value) => {
            if (!value) return 'Please enter a prompt.'
          },
        }),
    },
    {
      onCancel: () => {
        clackPrompt.cancel('Operation cancelled.')
        process.exit(0)
      },
    }
  )
  return (await group).prompt
}

export async function conversation(
  processResponse: (chatHistory: I.GPTMessage[]) => Promise<string /* answer */>,
  chatHistory: I.GPTMessage[] = []
) {
  if (chatHistory.length === 0) {
    clackPrompt.intro('Starting new conversation')
    chatHistory.push({ role: 'user', content: await getUserPrompt(`${cliColor.cyan('You:')}`) })
  }

  const spin = clackPrompt.spinner()

  spin.start('THINKING...')

  const responseMessage = await processResponse(chatHistory)

  spin.stop(`${cliColor.green('AI:')}`)

  console.log(`\n${responseMessage}\n`)

  chatHistory.push({ role: 'assistant', content: responseMessage })

  const userPrompt = await getUserPrompt(`${cliColor.cyan('You:')}`)

  chatHistory.push({ role: 'user', content: userPrompt })

  return conversation(processResponse, chatHistory)
}
