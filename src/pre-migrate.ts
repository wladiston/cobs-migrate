import chalk from 'chalk'
import {git} from './git.js'

export type PreMigrationProps = {
  /**
   * The branch to migrate.
   * @default 'master'
   */
  branch?: string
  /**
   * The name of the migration.
   */
  migration: string
}

/**
 * Prepare a branch for a migration
 * @param {PreMigrationProps}
 */
export async function preMigrate({
  branch = 'master',
  migration,
}: PreMigrationProps) {
  await git.checkout(branch)
  await git.pull()

  const branchName =
    branch !== 'master' ? `-${branch.replaceAll('/', '_')}` : ''
  const tagName = `pre-migration-${migration}${branchName}`

  try {
    console.log(`Adding pre-migration tag "${chalk.green(tagName)}"`)

    await git.addAnnotatedTag(tagName, `Pre-migration commit for ${migration}`)
    await git.pushTags()
  } catch (error) {
    console.log('Failed to add pre-migration tag', error)
  }
}
