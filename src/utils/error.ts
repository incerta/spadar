import dedent from 'dedent'

// TODO: support error logs
export class SpadarError extends Error {
  constructor(errorMessage: string) {
    const formattedErrorMessage =
      SpadarError.properIndent(dedent(errorMessage)) + '\n'

    super(formattedErrorMessage)
  }

  /* We want each line after `Error:` to be indented as start of error content  */
  static properIndent(inputString: string) {
    return inputString
      .split('\n')
      .map((line, index) => {
        if (index === 0) return line
        return '             ' + line
      })
      .join('\n')
  }
}
