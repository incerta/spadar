import { execSync } from 'child_process'
import * as clackPrompt from '@clack/prompts'
import * as cliColor from 'kolorist'

import * as cmd from '../utils/command-line'
import { getUserPrompt } from '../utils/interactive-cli'
import { complitionStreamFactory } from '../utils/text-generator'
import { getTextAdapter } from '../utils/deprecated-adapter'

type Message = {
  role: 'system' | 'assistant' | 'user'
  content: string
}

const DEFAULT_TEXT_MODEL = 'gpt-4'

const getPromptFromYou = () => getUserPrompt(`${cliColor.cyan('You:')}`)
// FIXME: we actually don't need it, if someone wants to
//        pass the message from clipboard to chat for example
//        they could use cli pipes, for macos the command
//        could look like:
//        ```
//        pbpaste | spadar chat spadar-openai GPT
//        ```
export function getClipboardText(): string | null {
  const command = ((): string => {
    switch (process.platform) {
      case 'darwin':
        return 'pbpaste'
      // TODO: did't actually tested on `windows` yet
      case 'win32':
        return 'powershell.exe -command "Get-Clipboard"'
      default:
        // TODO: try to find solution that works without `xclip` util
        return 'xclip -selection clipboard -o' // Linux (requires xclip to be installed)
    }
  })()

  const output = execSync(command, { encoding: 'utf-8' })

  if (typeof output !== 'string') return null

  return output.trim()
}

export const displayConverstaionContext = (messages: Message[]) => {
  console.log('\n\nConverstaion context:')

  messages.forEach(({ role, content }) => {
    console.log(`\n  role: ${role}:\n\n${content}`)
  })

  console.log('\n')
}

const conversation = async (
  ai: {
    processAnswerRequest: (chatHistory: Message[]) => Promise<{
      requestAnswerStream: (
        onStreamChunkReceived: (data: string) => void
      ) => Promise<string>
      cancel: () => void
    }>
    // TODO: unused API, revise after CHAT-PLUGIN discussion ends
    processImageRequest?: (req: unknown) => Promise<string>
  },
  chatHistory: Message[] = [],
  isRecursiveCall = false
): Promise<void> => {
  if (chatHistory.length === 0 || isRecursiveCall) {
    const conversationTitle = isRecursiveCall
      ? 'Conversation continued'
      : 'Starting new conversation'

    console.log('')
    clackPrompt.intro(conversationTitle)
    chatHistory.push({ role: 'user', content: await getPromptFromYou() })
  }

  const spin = clackPrompt.spinner()

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
  const responseMessage = await requestAnswerStream(
    process.stdout.write.bind(process.stdout)
  )
  console.log('\n')

  chatHistory.push({ role: 'assistant', content: responseMessage })

  const userPrompt = await getPromptFromYou()

  chatHistory.push({ role: 'user', content: userPrompt })

  return conversation(ai, chatHistory)
}

const runCLIChat = (
  options: { model: string; connectorId?: string },
  initialMessages?: Message[]
) => {
  const adapter = getTextAdapter(options.model, options.connectorId)
  const runComplitionStream = complitionStreamFactory(
    adapter.chatToAnswerStream
  )

  return conversation(
    {
      processAnswerRequest: (messages) =>
        runComplitionStream(options, messages),
    },
    initialMessages
  )
}

export const runChat = async (flags: {
  model?: string
  fromClipboard?: boolean
}) => {
  const options = {
    model: flags.model || DEFAULT_TEXT_MODEL,
  }

  if (flags.fromClipboard) {
    const clipboardText = getClipboardText()

    if (clipboardText) {
      const messages: Message[] = [{ role: 'user', content: clipboardText }]

      displayConverstaionContext(messages)
      runCLIChat(options, messages)
      return
    }
  }

  if (cmd.getIsRunningInPipe()) {
    const messageFromPipe = await cmd.getCLIPipeMessege()
    const messages: Message[] = [{ role: 'user', content: messageFromPipe }]

    displayConverstaionContext(messages)
    runCLIChat(options, messages)
    return
  }

  runCLIChat(options)
}
