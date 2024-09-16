import {Flags} from '@oclif/core'
import {writeFileSync} from "node:fs";

import {getArtifactVersion, getLatestArtifact} from "../../generated/client/index.js";
import {ArtifactCommand} from "../../index.js";
import {parseArtifactInfo} from "../../utils/artifact.js";
import {ensureDirectoryExistence} from "../../utils/fs.js";

export default class ArtifactDownload extends ArtifactCommand<typeof ArtifactDownload> {

    static description = 'Download artifact. Usage example: artifact download <groupId>/<artifactId>[:version]'

    static examples = [
        '<%= config.bin %> <%= command.id %>',
    ]

    static flags = {
        output: Flags.string({char: 'o', description: 'Output file path.'}),
        overwrite: Flags.boolean({char: 'w', default: false, description: 'Overwrite existing files'}),
    }

    public async run(): Promise<void> {
        console.log(`Downloading artifact: ${this.args.artifactTag}`);

        const { artifactId, groupId, version } = parseArtifactInfo(
            this.args.artifactTag as string,
        );

        const path = { artifactId, groupId };

        const { data, error } = version
            ? await getArtifactVersion({ path: { ...path, version } })
            : await getLatestArtifact({ path });

        if (error) {
            throw new Error(error.detail);
        }

        if (this.flags.output) {
            console.log(`Writing artifact to file: ${this.flags.output}`);
            ensureDirectoryExistence(this.flags.output);
            writeFileSync(this.flags.output, JSON.stringify(data, null, 2), {
                flag: this.flags.overwrite ? "w" : "wx",
            });
        } else {
            console.log("Artifact content: \n");
            console.log(JSON.stringify(data, null, 2));
        }
    }
}
