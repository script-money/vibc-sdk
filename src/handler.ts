import chalk from 'chalk';
import { exec, spawn } from 'child_process';
import { existsSync } from 'fs';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function createNewProject(
  project: string | undefined,
  useTypeScript: boolean = false
) {
  try {
    let projectName;
    let projectInputName;
    if (project) {
      projectName = project;
    } else {
      projectInputName = await promptInput('Project name: ');
      projectName = projectInputName;
    }

    if (!projectName) {
      console.error(chalk.red('Project name is required'));
      return;
    }

    if (existsSync(projectName)) {
      console.error(chalk.red(`Folder ${projectName} already exists`));
      return;
    }

    if (useTypeScript) {
      console.log(chalk.blue('Checking if bun is installed...'));
      try {
        const { stdout } = await execPromise('bun --version');
        console.log(chalk.green(`Found bun, version: ${stdout.trim()}`));
      } catch (error) {
        console.error(
          chalk.red(
            'bun is required for TypeScript projects. Please install bun from https://bun.sh/'
          )
        );
        return;
      }
    }

    const templateUrl = useTypeScript
      ? 'https://github.com/script-money/ibc-app-solidity-template --branch typescript'
      : 'https://github.com/open-ibc/ibc-app-solidity-template';
    const cloneCommand = `git clone --depth 1 --recursive --shallow-submodules --progress ${templateUrl} ${projectName}`;
    console.log(
      chalk.green(
        `Creating new project: ${projectName}, using ${
          useTypeScript ? 'TypeScript' : 'JavaScript'
        }, need minutes to download dependencies...`
      )
    );
    const cloneArgs = cloneCommand.split(' ');
    const cloneProcess = spawn(cloneArgs.shift()!, cloneArgs, { stdio: 'inherit' });

    cloneProcess.on('close', async (code: number) => {
      if (code !== 0) {
        console.error(chalk.red(`Git clone failed with code ${code}`));
        return;
      }
      console.log(chalk.green('Cloned template successfully'));
      process.chdir(projectName);

      await execPromise('rm -rf .git');
      await execPromise('git init');
      await execPromise('rm -f .gitmodules');

      console.log(chalk.green('Installing dependencies...'));
      if (useTypeScript) {
        await execPromise('npm install');
      } else {
        await execPromise('bun install');
      }
      await execPromise('cp .env.example .env');
      await execPromise('echo "lib/" >> .gitignore');

      console.log(chalk.green('New project created successfully!'));
      console.log('To start the project, run:');
      console.log(chalk.yellow(`cd ${projectName}`));
      console.log(chalk.yellow('then fill missing fields in .env file'));
      console.log(chalk.yellow('more details in README.md'));
    });
  } catch (error) {
    console.error(chalk.red('Error creating new project:'), error);
  }
}

async function promptInput(message: string): Promise<string> {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    readline.question(message, (input: string) => {
      readline.close();
      resolve(input);
    });
  });
}