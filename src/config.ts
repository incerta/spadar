import dotenv from 'dotenv'

dotenv.config()

const REQUIRED_ENVS = ['OPEN_AI_API_KEY']

const { OPEN_AI_API_KEY } = process.env

if (!OPEN_AI_API_KEY) {
  const missingEnvs = REQUIRED_ENVS.filter((x) => !process.env[x]).join(', ')
  throw new Error(
    'Some of .env required variables has not been set\n' +
      `\n    List of missing value identifiers: ${missingEnvs}` +
      '\n    Checkout .env.example at the root of the app' +
      '\n    It is also might be the case that you are trying to run script from the wrong place' +
      '\n    Try to run the program from the path where .env file is present\n'
  )
}

export default {
  openAI: { apiKey: OPEN_AI_API_KEY },
}
