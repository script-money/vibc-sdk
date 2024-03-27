import chalk from 'chalk'
import { exec } from 'child_process'
import { existsSync } from 'fs'
import { promisify } from 'util'

const execPromise = promisify(exec)

export async function createNewProject(project: string | undefined) {
  try {
    let projectName
    let projectInputName
    if (project) {
      projectName = project
    } else {
      projectInputName = await promptInput('Project name: ')
      projectName = projectInputName
    }

    if (!projectName) {
      console.error(chalk.red('Project name is required'))
      return
    }

    if (existsSync(projectName)) {
      console.error(chalk.red(`Folder ${projectName} already exists`))
      return
    }

    const templateUrl = 'https://github.com/open-ibc/ibc-app-solidity-template'
    const cloneCommand = `git clone --depth 1 ${templateUrl} ${projectName}`
    console.log(chalk.green(`Creating new project: ${projectName}`))

    await execPromise(cloneCommand)
    console.log(chalk.green('Cloned template successfully'))

    process.chdir(projectName)

    await execPromise('rm -rf .git')
    await execPromise('git init')

    console.log(chalk.green('Installing dependencies...'))
    // TODO:
    // 1. not install just
    // 2. check network
    // 3. show install progress
    await execPromise('just install')
    await execPromise('cp .env.example .env')

    console.log(chalk.green('New project created successfully!'))
    console.log('To start the project, run:')
    console.log(chalk.yellow(`cd ${projectName}`))
    console.log(chalk.yellow('then fill PRIVATE_KEY_1 in .env file'))
    console.log(chalk.yellow('run `just send-packet base` to send a packet from base to optimism'))
    console.log(chalk.yellow('more details in README.md'))
  } catch (error) {
    console.error(chalk.red('Error creating new project:'), error)
  }
}

async function promptInput(message: string): Promise<string> {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    readline.question(message, (input: string) => {
      readline.close()
      resolve(input)
    })
  })
}
