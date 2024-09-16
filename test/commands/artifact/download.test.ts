import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('artifact:download', () => {
  it('runs artifact:download cmd', async () => {
    const {stdout} = await runCommand('artifact:download')
    expect(stdout).to.contain('hello world')
  })

  it('runs artifact:download --name oclif', async () => {
    const {stdout} = await runCommand('artifact:download --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
