import chalk from 'chalk'
import {
  addLabel,
  createLabel,
  getCurrentBranch,
  getOpenedPRs,
  git,
} from '../git.js'
import {execute, install} from '../package-manager.js'
import {preMigrate} from '../pre-migrate.js'

interface MigrateOptions {
  '--': string[]
  migrationName: string
  author: string
  baseBranch: string
}

export const toTypescript = async (
  givenBranch: string | null,
  options: MigrateOptions,
) => {
  const branch = givenBranch || (await getCurrentBranch())
  const {author, migrationName: migration, baseBranch} = options

  console.log(
    `Applying migration "${chalk.green(migration)}" to branch "${chalk.blue(
      branch,
    )}"`,
  )
  await git.fetch()

  // Merge from the pre-migration tag
  const preMerge = await git.merge([`pre-migration-${migration}`])
  if (preMerge.conflicts.length) {
    console.log(
      chalk.red.bold(
        `Failed to merge 'pre-migration-${migration}' into ${branch}. That happens because there are conflicts that need to be solved manually. Please merge it manually. Then run this command again.`,
      ),
    )
    console.log(chalk.whiteBright(`git merge pre-migration-${migration}`))
    return process.exit(1)
  }

  // Prepare the branch for the migration
  await preMigrate({branch, migration})
  await mergeTS({baseBranch, branch, author, migration})

  // install packages
  await install()

  // execute strategy for migration
  await renameFiles({author})
  await migrateChangedFiles({baseBranch, branch, author})
}

async function mergeTS({
  baseBranch,
  branch,
  author,
  migration,
}: {
  baseBranch: string
  branch: string
  author: string
  migration: string
}) {
  console.log(`Merging from '${chalk.blue(baseBranch)}'`)
  await git.merge([`post-migration-${migration}`, '-X', 'ours', baseBranch])
  await git.commit(`Merge branch '${baseBranch}' into ${branch}`, undefined, {
    '--author': `${author} <dev@no-email.com>`,
    '--no-verify': null,
    '--all': null,
  })
}

async function renameFiles({author}: {author: string}) {
  console.log(`Renaming files to ".ts"`)
  await execute(['-y', 'ts-migrate', 'rename', '.'])

  await git.add(['.'])
  await git.commit(`Renaming files to ".ts"`, undefined, {
    '--author': `${author} <dev@no-email.com>`,
    '--no-verify': null,
  })
}

async function migrateChangedFiles({
  baseBranch,
  branch,
  author,
}: {
  baseBranch: string
  branch: string
  author: string
}) {
  console.log(
    `Running migration on the changed files from '${chalk.blue(branch)}'`,
  )

  // get all the files that were changed from master
  const files = (await git.diff(['--name-only', baseBranch]))
    .split('\n')
    .filter(a => !!a)

  const fileSources = files
    .map(f => `-s ${f.trim()}`)
    .join(' ')
    .split(' ')

  // ts migrate the files
  await execute([
    '-y',
    'ts-migrate',
    'migrate',
    '--aliases',
    'tsfixme',
    '.',
    ...fileSources,
    '-s',
    'src/tsfixme.d.ts',
  ])

  console.log(`💅 Formatting the changed files`)
  // format files according to prettier
  await execute(['-y', 'prettier', '-w', ...files])

  await git.add(['.'])

  console.log(`🎉 Files migrated successfully!`)
  try {
    await git.commit(`Add $TSFixMe types`, undefined, {
      '--author': `${author} <dev@no-email.com>`,
    })
    console.log(
      `You can now push the changes to the remote branch\n\n${chalk.blue(
        './tools/push',
      )}`,
    )
  } catch (error) {
    console.log(
      `The commit has failed. Please review the changes and commit them manually.`,
    )
  }

  // TODO: replace module.exports to esm
}
