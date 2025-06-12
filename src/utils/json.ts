import { readdirSync, readFileSync } from 'fs'
import { extname, join } from 'path'

// TODO: validate parsed json by schema based parser (schematox)
//       require schema parser function along with "dirPath"
//

export function readJsonFiles<T = unknown>(dirPath: string): T[] {
  const files = readdirSync(dirPath)

  return files
    .filter((file) => extname(file) === '.json')
    .map((file) => JSON.parse(readFileSync(join(dirPath, file), 'utf8')))
}
