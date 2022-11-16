// [ ] set tag on master / main branch

import chalk from 'chalk'
import {
  addLabel,
  createLabel,
  getCurrentBranch,
  getOpenedPRs,
  git,
} from './git.js'
import {logger} from './logger.js'
import {execute} from './package-manager.js'
import {preMigrate} from './pre-migrate.js'

export type MigrateOptions = {}

const migrationAuthor = '💙 Typescript'
const migrationName = 'typescript'
const author = `${migrationAuthor} <dev@swan.com>`
const commitOptions = {
  '--author': author,
  '--no-verify': null,
  '--all': null,
}

export const migrate = async (options: MigrateOptions) => {
  const branch = await getCurrentBranch()
  const mergeFrom = 'wp/ts'

  // logger.info(`Migrating '${chalk.blue(branch)}' to ${migrationAuthor}...`)
  // await git.fetch()
  // await git.pull()

  // await preMigrate({branch, migration: migrationName})

  // logger.info(`Merging from '${chalk.blue(mergeFrom)}'`)
  // await git.merge(['-X', 'ours', mergeFrom])
  // await git.commit(
  //   `Merge branch '${mergeFrom}' into ${branch}`,
  //   undefined,
  //   commitOptions,
  // )

  logger.info(`Renaming files to ".ts"`)
  await execute(['ts-migrate', 'rename', '.'])
  // await git.commit(`Renaming files to ".ts"`, undefined, commitOptions)

  // // get all the files that were changed from master
  // logger.info(
  //   `Running migration on the changed files from '${chalk.blue(branch)}'`,
  // )
  // const files = (await git.diff(['--name-only', mergeFrom])).split('\n')
  // await execute([
  //   'ts-migrate',
  //   'migrate',
  //   ...files
  //     .map(f => `-s ${f.trim()}`)
  //     .join(' ')
  //     .split(' '),
  // ])

  // createLabel()

  // // get all PRs from the repo
  // const prs = await getOpenedPRs()

  // // add migration label to all PRs
  // await Promise.all(prs.map(pr => addLabel(pr.number)))

  // const productionPRs = prs.filter(pr => pr.base.ref.startsWith('deploy'))
  // const stagingPRs = prs.filter(pr => pr.base.ref.startsWith('qa'))

  // // get dev from prod because staging could have been merged already
  // const devBranches = productionPRs.map(pr =>
  //   pr.base.ref.replace('deploy/', ''),
  // )
  // const productionBranches = productionPRs.map(pr => pr.base.ref)
  // const stagingBranches = stagingPRs.map(pr => pr.base.ref)

  // // pre-migrate all branches
  // await Promise.all(
  //   [...productionBranches, ...stagingBranches, ...devBranches].map(branch =>
  //     preMigrate({branch, migration: migrationName}),
  //   ),
  // )
}

// xxx replace module.exports to esm
// add types

// rename all files to ts
// commit
// migrate all changed files?
