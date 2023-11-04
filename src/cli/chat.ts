import { command } from 'cleye'

import { DEFAULT_LLM } from '../constants'
import { conversation, displayConverstaionContext } from '../utils/interactive-cli'
import { complitionStreamFactory } from '../utils/text-generator'
import { getIsRunningInPipe, getCLIPipeMessege, getClipboardText } from '../utils/command-line'
import { getTextAdapter } from '../utils/adapter'
import { generateImage } from '../AI'

import * as I from '../types'

const runCLIChat = (options: I.TextOptions, initialMessages?: I.TextUnit[]) => {
  const adapter = getTextAdapter(options.model, options.adapterId)
  const runComplitionStream = complitionStreamFactory(adapter.chatToAnswerStream)

  return conversation(
    {
      processAnswerRequest: (messages) => runComplitionStream(options, messages),
      processImageRequest: (image) => generateImage(image),
    },
    initialMessages
  )
}

export default command(
  {
    name: 'chat',
    flags: {
      fromClipboard: {
        type: Boolean,
        description: 'Start conversation with AI where first message is a text from clipboard',
        alias: 'c',
      },

      model: {
        type: String,
        description: 'Choose the Large Language Model like: "gpt-3.5-turbo", "gpt-4"',
        alias: 'm',
      },

      adapter: {
        type: String,
        description: 'Choose specific built-in or external adapter for LLM complition processing',
        alias: 'a',
      },

      temperature: {
        type: Number,
        description:
          "OpenAI's API adjusts output diversity, with a value range from 0.0 (more deterministic) to 1.0 (more random).",
        alias: 't',
      },

      maxTokens: {
        type: Number,
        description: 'Sets the maximum number of tokens allowed in both input and output text',
      },

      topP: {
        type: Number,
        description:
          "OpenAI's API adjusts output diversity, with a value range from 0.0 (more deterministic) to 1.0 (more random).",
      },

      disableContextDisplay: {
        type: Boolean,
        description: 'disabled dispaying conversation context in case we are using conversation from clipboard or pipe',
        alias: 'd',
      },
    },
    help: {
      description: 'Start conversation with ChatGPT',
    },
  },
  async (argv) => {
    const { adapter, model, maxTokens, temperature, topP, disableContextDisplay } = argv.flags

    if (temperature && (temperature < 0 || temperature > 1)) {
      throw Error(`Allowed --temperature paramter value range is between 0.0 and 1.0 but given: ${temperature}`)
    }

    if (topP && (topP < 0 || topP > 1)) {
      throw Error(`Allowed --topP paramter value range is between 0.0 and 1.0 but given: ${topP}`)
    }

    const options: I.TextOptions = {
      model: (model || DEFAULT_LLM) as I.TextModelId,
      adapterId: adapter as I.TextAdapterId,
      maxTokens: maxTokens,
      temperature: temperature,
      topP: topP,
    }

    if (argv.flags.fromClipboard) {
      const clipboardText = getClipboardText()

      if (clipboardText) {
        const messages: I.TextUnit[] = [{ role: 'user', content: clipboardText }]

        if (!disableContextDisplay) displayConverstaionContext(messages)
        runCLIChat(options, messages)
        return
      }
    }

    if (getIsRunningInPipe()) {
      const messageFromPipe = await getCLIPipeMessege()
      const messages: I.TextUnit[] = [{ role: 'user', content: messageFromPipe }]

      if (!disableContextDisplay) displayConverstaionContext(messages)
      runCLIChat(options, messages)
      return
    }

    runCLIChat(options)
  }
)
