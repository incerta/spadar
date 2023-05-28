import { cli } from 'cleye'
import { version } from '../../package.json'

import chat from './chat'

cli({
  name: 'meatbag-crusher',
  version: version,
  commands: [chat],
})
