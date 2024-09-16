import {Flags} from '@oclif/core'
import {readFileSync} from "node:fs";
import {OutgoingHttpHeaders} from "node:http";

import {CreateArtifactData, FileContent, IfExists, createArtifact} from "../../generated/client/index.js";
import {ArtifactCommand} from "../../index.js";
import {parseArtifactInfo} from "../../utils/artifact.js";

export default class ArtifactUpload extends ArtifactCommand<typeof ArtifactUpload> {
    static description = 'Upload artifact'

    static examples = [
        '<%= config.bin %> <%= command.id %>',
    ]

    static flags = {
        file: Flags.string({char: 'f', description: 'file to upload', required: true}),
        ifExists: Flags.string({
            default: 'RETURN_OR_UPDATE',
            description: 'Strategy if artifact already exists',
            name: 'if-exists',
            options: [
                "FAIL",
                "UPDATE",
                "RETURN",
                "RETURN_OR_UPDATE",
            ],
        }),
        type: Flags.string({
            char: 't',
            description: 'Artifact Type.',
            options: [
                "PROTOBUF",
                "JSON",
                "AVRO",
                "KONNECT",
                "OPENAPI",
                "ASYNCAPI",
                "GRAPHQL",
                "WSDL",
                "XSD",
            ],
        }),
    }

    public async run(): Promise<void> {
        const { artifactId, groupId, version } = parseArtifactInfo(
            this.args.artifactTag as string,
        );

        const file = readFileSync(this.flags.file);
        const body = file.toString("utf8");

        const createArtifactRequestOptions: {
            headers: OutgoingHttpHeaders;
        } & CreateArtifactData = {
            body: body as unknown as FileContent,
            headers: {
                "X-Registry-ArtifactId": artifactId,
                "X-Registry-ArtifactType": this.flags.type,
                ...version ? { "X-Registry-Version": version } : {}
            },
            path: {
                groupId,
            },
            query: {
                ifExists: this.flags.ifExists as IfExists,
            },
        };

        console.log(`Uploading artifact: ${this.args.artifactTag}`);
        const { error, response } = await createArtifact(
            createArtifactRequestOptions,
        );

        if (error) {
            throw new Error(error.detail);
        }

        if (response) {
            console.log("Artifact uploaded successfully");
        }
    }
}
