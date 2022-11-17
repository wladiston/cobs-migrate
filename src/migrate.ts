import chalk from 'chalk'
import inquirer from 'inquirer'
import {git, mergePR} from './git.js'
import {postMigrate} from './post-migrate.js'
import {preMigrate} from './pre-migrate.js'

type MigrateOptions = {
  '--'?: string[]
}

/**
 * Due to the current limitations of the Branch Strategy we have at work, we need to merge the
 * migration PR to dev and master at the same time. This is a temporary solution until we can
 * change the strategy.
 *
 * @param options
 */
export const migrate = async (migration: string, options: MigrateOptions) => {
  const answers: {
    masterPr: number
    devPr: number
    update: boolean
  } = await inquirer.prompt([
    {
      type: 'number',
      name: 'masterPr',
      message: 'Master PR number:',
      validate(input) {
        if (Number.isNaN(input)) {
          return 'Please enter a PR number'
        }
        return true
      },
    },
    {
      type: 'number',
      name: 'devPr',
      message: 'Dev PR number:',
      validate(input) {
        if (Number.isNaN(input)) {
          return 'Please enter a PR number'
        }
        return true
      },
    },
    {
      name: 'update',
      message: `Are you those PRs up to date with '${chalk.blue('master')}'?`,
      type: 'confirm',
      default: false,
    },
  ])

  if (!answers.update) {
    console.log('Please merge master to the PRs and try again')
    return
  }

  await preMigrate({branch: 'development', migration})
  await mergePR(answers.devPr)
  await postMigrate({branch: 'development', migration})

  await preMigrate({branch: 'master', migration})
  await mergePR(answers.masterPr)
  await postMigrate({branch: 'master', migration})

  console.log('🎉 Migration complete!')
}
