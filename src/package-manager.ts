import {detect, parseNi, parseNx, run} from '@antfu/ni'

const getPackageManager = async () => {
  const packageManager = await detect({autoInstall: false})
  if (!packageManager) {
    throw new Error('No package manager detected')
  }
  return packageManager
}

/**
 * Install a package using the detected package manager.
 * @param args
 * @returns
 */
export async function install(args: string[] = []) {
  const packageManager = await getPackageManager()
  return await parseNi(packageManager, args)
}

/**
 * Execute a package command using the detected package manager.
 * @param args
 * @returns
 */
export async function execute(args: string[]) {
  return await run(parseNx, args, {
    autoInstall: true,
  })
}
