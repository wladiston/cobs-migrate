import {simpleGit} from 'simple-git'
import type {SimpleGitOptions} from 'simple-git'
import {Octokit} from 'octokit'
import chalk from 'chalk'

const auth = process.env.GITHUB_TOKEN

if (!auth) {
  throw new Error('Missing GITHUB_TOKEN')
}

const octokit = new Octokit({
  auth,
})

const options: Partial<SimpleGitOptions> = {
  baseDir: process.cwd(),
  //   binary: 'git',
  //   maxConcurrentProcesses: 6,
  //   trimmed: false,
}

/**
 * Git commands
 */
export const git = simpleGit(options)

/**
 * Get repo name and owner from git remote
 * @returns
 */
export const getRepoInfo = async () => {
  const repoUrl = (await git.listRemote(['--get-url']))
    .replace('.git', '')
    .replace('git@github.com:', '')
    .replace('\n', '')
  const [owner, repo] = repoUrl.split('/').slice(-2)

  return {
    repo,
    owner,
  }
}

/**
 * Get current branch name
 */
export const getCurrentBranch = async () => {
  const branch = await git.branch()
  return branch.current
}

/**
 * Get all opened PRs ordered by most recent
 * @returns {Promise<Octokit.PullsListResponseItem[]>}
 */
export const getOpenedPRs = async () => {
  const {owner, repo} = await getRepoInfo()
  const prs = []

  for await (const response of octokit.paginate.iterator(
    octokit.rest.pulls.list,
    {
      owner,
      repo,
      state: 'open',
      sort: 'updated',
      direction: 'desc',
    },
  )) {
    prs.push(...response.data)
  }

  return prs
}

/**
 * Add label to the PR
 * @param prNumber
 * @param label
 */
export const addLabel = async (prNumber: number) => {
  const {owner, repo} = await getRepoInfo()

  console.log(
    `Adding label "${chalk.red('needs-migration')}" to "${chalk.cyan(
      prNumber,
    )}"...`,
  )
  await octokit.rest.issues.addLabels({
    owner,
    repo,
    issue_number: prNumber,
    labels: ['needs-migration'],
  })
}

/**
 * Remove label from the PR
 */
export const removeLabel = async (prNumber: number) => {
  const {owner, repo} = await getRepoInfo()

  console.log(
    `Removing label "${chalk.red('needs-migration')}" from "${chalk.cyan(
      prNumber,
    )}"...`,
  )
  await octokit.rest.issues.removeLabel({
    owner,
    repo,
    issue_number: prNumber,
    name: 'needs-migration',
  })
}

/**
 * Create label if it doesn't exist
 */
export const createLabel = async () => {
  const {owner, repo} = await getRepoInfo()

  console.log(`Creating label "${chalk.red('needs-migration')}"...`)
  await octokit.rest.issues.createLabel({
    owner,
    repo,
    name: 'needs-migration',
    color: 'FF0000',
  })
}

/**
 * Merge PR using merge method
 * @param prNumber
 * @returns
 */
export const mergePR = async (prNumber: number) => {
  const {owner, repo} = await getRepoInfo()

  console.log(`Merging PR "${chalk.cyan(prNumber)}"...`)
  await octokit.rest.pulls.merge({
    owner,
    repo,
    pull_number: prNumber,
    merge_method: 'merge',
  })
}
