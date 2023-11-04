import * as cliColor from 'kolorist'
import * as clackPrompt from '@clack/prompts'
import { execSync } from 'child_process'
import readline from 'readline'

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

const getPromptFromYou = () => getUserPrompt(`${cliColor.cyan('You:')}`)

// TODO: align display context format with `conversation` UI
export const displayConverstaionContext = (messages: I.TextUnit[]) => {
  console.log('\n\nConverstaion context:')

  messages.forEach(({ role, content }) => {
    if (role === 'assistant') return
    console.log(`\n  role: ${role}:\n    ${content}`)
  })

  console.log('\n')
}

export async function conversation(
  ai: {
    processAnswerRequest: (chatHistory: I.TextUnit[]) => Promise<{
      requestAnswerStream: (onStreamChunkReceived: (data: string) => void) => Promise<string>
      cancel: () => void
    }>
    processImageRequest: (req: I.ImageUnit) => Promise<string>
  },
  chatHistory: I.TextUnit[] = [],
  isRecursiveCall = false
): Promise<void> {
  if (chatHistory.length === 0 || isRecursiveCall) {
    const conversationTitle = isRecursiveCall ? 'Conversation continued' : 'Starting new conversation'

    console.log('')
    clackPrompt.intro(conversationTitle)
    chatHistory.push({ role: 'user', content: await getPromptFromYou() })
  }

  const lastMessage = chatHistory[chatHistory.length - 1]
  const imgGenReq = parseImageGenerationRequest(lastMessage.content)

  const spin = clackPrompt.spinner()

  if (imgGenReq !== null) {
    spin.start('GENERATING IMAGE...')

    const imgURL = await ai.processImageRequest(imgGenReq)

    spin.stop(`${cliColor.green('AI:')}`)
    console.log(`\nimage url: ${imgURL}`)

    // TODO: maybe better ask for copying to clipboard?
    execSync(`echo "${imgURL}" | ${process.platform === 'win32' ? 'clip' : 'pbcopy'}`)
    console.log('\nURL is copied to your clipboard!')

    const updatedChatHistory = chatHistory.slice(0, chatHistory.length - 2)
    return conversation(ai, updatedChatHistory, true)
  }

  spin.start('THINKING...')

  const { requestAnswerStream } = await ai.processAnswerRequest(chatHistory)

  spin.stop(`${cliColor.green('AI:')}`)

  /* TODO: unfortunately method below is not working in the current context
   we want to `cancel` the stream on "s" key press, the `cancel` method
   can be destructured from `await ai.processAnswerRequest(chatHistory)` statement
   
  ```
    readline.emitKeypressEvents(process.stdin)
    process.stdin.setRawMode(true)
    process.stdin.on('keypress', (_, key) => {
      if (key.sequence === 's') {
        cancel()
      }
    })
  ```
  */

  console.log('')
  const responseMessage = await requestAnswerStream(process.stdout.write.bind(process.stdout))
  console.log('\n')

  chatHistory.push({ role: 'assistant', content: responseMessage })

  const userPrompt = await getPromptFromYou()

  chatHistory.push({ role: 'user', content: userPrompt })

  return conversation(ai, chatHistory)
}
