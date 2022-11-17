import chalk from 'chalk'
import {addLabel, git} from './git.js'

export type PostMigrateProps = {
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
 * @param {PostMigrateProps}
 */
export async function postMigrate({
  branch = 'master',
  migration,
}: PostMigrateProps) {
  await git.checkout(branch)
  await git.pull()

  const branchName =
    branch !== 'master' ? `-${branch.replaceAll('/', '_')}` : ''
  const tagName = `post-migration-${migration}${branchName}`

  try {
    console.log(`Adding post-migration tag "${chalk.green(tagName)}"`)

    await git.addAnnotatedTag(tagName, `Post-migration commit for ${migration}`)
    await git.pushTags()
  } catch (error) {
    console.log('Failed to add post-migration tag', error)
  }
}
