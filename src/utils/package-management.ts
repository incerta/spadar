import fs from 'fs'
import path from 'path'

export function mapModulePackageFiles(cb: (pkg: Record<string, unknown>) => void, dir = process.cwd()) {
  fs.readdir(dir, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error(`Failed to read directory: ${dir}`)
      return
    }

    files.forEach((file) => {
      const fullPath = path.join(dir, file.name)

      const isNodeModulesDirectory = file.isDirectory() && file.name !== 'node_modules'

      if (isNodeModulesDirectory) {
        mapModulePackageFiles(cb, fullPath)
        return
      }

      if (file.name === 'package.json') {
        console.log(file)
      }
    })
  })
}

function findNodeModulesDir(dir = process.cwd()) {
  const nodeModulesPath = path.join(dir, 'node_modules')

  fs.accessSync(nodeModulesPath, fs.constants.F_OK)

  fs.access(nodeModulesPath, fs.constants.F_OK, (err) => {
    if (err) {
      const parentDir = path.dirname(dir)

      if (parentDir === dir) {
        console.log('No node_modules directory found')
      } else {
        findNodeModulesDir(parentDir)
      }
    } else {
      console.log(`node_modules directory found at: ${nodeModulesPath}`)
    }
  })
}
