import * as cliColor from 'kolorist'
import * as clackPrompt from '@clack/prompts'
import { parseImageGenerationRequest } from '../utils/image-generator'

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
  processAIRequest: (chatHistory: I.GPTMessage[]) => Promise<{
    makeResponseWriter: (writer: (data: string) => void) => Promise<string>
  }>,
  chatHistory: I.GPTMessage[] = []
): Promise<void> {
  const getPromptFromYou = () => getUserPrompt(`${cliColor.cyan('You:')}`)

  if (chatHistory.length === 0) {
    console.log('')
    clackPrompt.intro('Starting new conversation')
    chatHistory.push({ role: 'user', content: await getPromptFromYou() })
  }

  const lastMessage = chatHistory[chatHistory.length - 1]
  const imgGenReq = parseImageGenerationRequest(lastMessage.content)

  if (imgGenReq !== null) {
    // TODO: branch out for image generation logic
    console.log('\nImage generation request detected!\n')
    console.log('The feature is under construction, yet what we know about your request:')
    console.log(JSON.stringify(imgGenReq))

    const updatedChatHistory = chatHistory.slice(0, chatHistory.length - 2)
    return conversation(processAIRequest, updatedChatHistory)
  }

  const spin = clackPrompt.spinner()

  spin.start('THINKING...')

  const { makeResponseWriter } = await processAIRequest(chatHistory)

  spin.stop(`${cliColor.green('AI:')}`)

  console.log('')
  const responseMessage = await makeResponseWriter(process.stdout.write.bind(process.stdout))
  console.log('\n')

  chatHistory.push({ role: 'assistant', content: responseMessage })

  const userPrompt = await getPromptFromYou()

  chatHistory.push({ role: 'user', content: userPrompt })

  return conversation(processAIRequest, chatHistory)
}
