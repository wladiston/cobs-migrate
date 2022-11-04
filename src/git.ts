import {simpleGit} from 'simple-git'
import type {SimpleGitOptions} from 'simple-git'

const options: Partial<SimpleGitOptions> = {
  baseDir: process.cwd(),
  //   binary: 'git',
  //   maxConcurrentProcesses: 6,
  //   trimmed: false,
}

export const git = simpleGit(options)
