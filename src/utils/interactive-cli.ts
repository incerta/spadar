import * as cliColor from 'kolorist'
import * as clackPrompt from '@clack/prompts'
import { execSync } from 'child_process'

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
  ai: {
    processChatRequest: (chatHistory: I.GPTMessage[]) => Promise<{
      makeResponseWriter: (writer: (data: string) => void) => Promise<string>
    }>
    processImageRequest: (req: I.ImageGenerationRequest) => Promise<string>
  },
  chatHistory: I.GPTMessage[] = [],
  isContinueExistedConversation = false
): Promise<void> {
  const getPromptFromYou = () => getUserPrompt(`${cliColor.cyan('You:')}`)

  if (chatHistory.length === 0 || isContinueExistedConversation) {
    const conversationTitle = isContinueExistedConversation ? 'Conversation continued' : 'Starting new conversation'

    console.log('')
    clackPrompt.intro(conversationTitle)
    chatHistory.push({ role: 'user', content: await getPromptFromYou() })
  }

  // TODO: we are trying to invent internal
  // message code for some extra actions
  // for now only supported thing is
  // [img:sm|md|lg] code that makes previous text
  // image generation request prompt
  // we need proper name for this code injections

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

  const { makeResponseWriter } = await ai.processChatRequest(chatHistory)

  spin.stop(`${cliColor.green('AI:')}`)

  console.log('')
  const responseMessage = await makeResponseWriter(process.stdout.write.bind(process.stdout))
  console.log('\n')

  chatHistory.push({ role: 'assistant', content: responseMessage })

  const userPrompt = await getPromptFromYou()

  chatHistory.push({ role: 'user', content: userPrompt })

  return conversation(ai, chatHistory)
}
