import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('artifact:upload', () => {
  it('runs artifact:upload cmd', async () => {
    const {stdout} = await runCommand('artifact:upload')
    expect(stdout).to.contain('hello world')
  })

  it('runs artifact:upload --name oclif', async () => {
    const {stdout} = await runCommand('artifact:upload --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
