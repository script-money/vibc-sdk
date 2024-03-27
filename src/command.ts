import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { createNewProject } from './handler'
import { version } from '../package.json'

yargs(hideBin(process.argv))
  .command(
    'new [project-name]',
    'Creates a new vibc project',
    (yargs) =>
      yargs.positional('projectName', {
        description: 'The name of the project',
        type: 'string',
      }),
    (argv) => createNewProject(argv.projectName as string)
  )
  .scriptName('vibc')
  .version(`vibc-sdk ${version}`)
  .alias('v', 'version')
  .parse()
