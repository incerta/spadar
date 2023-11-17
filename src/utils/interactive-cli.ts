import * as clackPrompt from '@clack/prompts'

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
