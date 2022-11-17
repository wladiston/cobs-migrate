#!/usr/bin/env node
import {cac} from 'cac'
import chalk from 'chalk'
import config from '../package.json'
import {migrate} from './migrate.js'
import {toTypescript} from './migrations/to-typescript.js'

const cli = cac()

console.log(chalk.white.bold(`🦢 Git Migration Helper CLI - ${config.version}`))

// Default command
cli
  .command('<migration-name>', 'Merge a migration PR to dev and master')
  .action(migrate)

// Migration specific commands
cli
  .command(
    'to-typescript [branch]',
    `Migrate branch to TS (default: ${chalk.blue('current')})`,
  )
  .option(
    '--base-branch <branch>',
    'Name of the the base branch (default: master)',
    {
      default: 'master',
    },
  )
  .option(
    '--migration-name <name>',
    'The name of the migration (default: typescript)',
    {
      default: 'typescript',
    },
  )
  .option(
    '--author <branch>',
    'The author name that will be used on git commits',
    {
      default: '💙 Typescript',
    },
  )
  .action(toTypescript)

// Listen to unknown commands
cli.on('command:*', () => {
  console.error('Invalid command: %s', cli.args.join(' '))
  process.exit(1)
})

// Display help message when `-h` or `--help` appears
cli.help()
// Display version number when `-v` or `--version` appears
// It's also used in help message
cli.version(config.version)

cli.parse()
