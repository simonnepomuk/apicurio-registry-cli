import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import nock from "nock";

describe('artifact:download', () => {
    const registryUrl = 'http://localhost:8080'
    const apiPath = '/apis/registry/v2'
    const registryApiUrl = `${registryUrl}${apiPath}`

    it('downloads latest when not providing version', async () => {
        const groupId = 'group-id'
        const artifactName = 'artifact-name'
        const artifactTag = `${groupId}/${artifactName}`
        const expectedReturnValue = {id: 'FAKE_ARTIFACT'};
        nock(registryApiUrl)
            .get(`/groups/${groupId}/artifacts/${artifactName}`)
            .reply(200, expectedReturnValue);

        const {stdout} = await runCommand(`artifact:download ${artifactTag} --registry ${registryUrl}`)
        expect(stdout).to.contain(JSON.stringify(expectedReturnValue, null, 2))
    })
})
