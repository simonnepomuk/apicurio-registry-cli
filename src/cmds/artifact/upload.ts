import {
  createArtifact,
  CreateArtifactData,
  FileContent,
  IfExists,
  IfExistsSchema,
} from "../../../generated/client";
import { ArgumentsCamelCase, CommandModule } from "yargs";
import { parseArtifactInfo } from "./util";
import { readFileSync } from "node:fs";
import { OutgoingHttpHeaders } from "node:http";

type UploadArtifactCommandArgs = {
  artifactTag: string;
  filepath?: string;
  registry: string;
  ifExists?: IfExists;
  type?: ArtifactType;
};

type ArtifactType =
  | "PROTOBUF"
  | "JSON"
  | "AVRO"
  | "KONNECT"
  | "OPENAPI"
  | "ASYNCAPI"
  | "GRAPHQL"
  | "WSDL"
  | "XSD";

const artifactTypeValues = [
  "PROTOBUF",
  "JSON",
  "AVRO",
  "KONNECT",
  "OPENAPI",
  "ASYNCAPI",
  "GRAPHQL",
  "WSDL",
  "XSD",
] as const;

export const {
  command,
  describe,
  handler,
  builder,
}: CommandModule<{ registry: string }, UploadArtifactCommandArgs> = {
  command: "artifact upload <artifactTag>",
  describe:
    "Download artifact. Usage example: artifact download <groupId>/<artifactId>[:version]",
  builder: (yargs) => {
    return yargs
      .positional("artifactTag", {
        describe: "Artifact Tag. Example: com.example/my-artifact:1.0.0",
        type: "string",
        demandOption: true,
      })
      .option("filepath", {
        alias: "f",
        describe: "Input file path.",
        type: "string",
        demandOption: true,
      })
      .option("type", {
        alias: "t",
        describe: "Artifact Type.",
        type: "string",
        choices: artifactTypeValues,
      })
      .option("if-exists", {
        describe: "Select strategy if artifact already exists",
        type: "string",
        default: "RETURN_OR_UPDATE",
        choices: IfExistsSchema.enum,
      });
  },
  handler: handleUploadCommand,
};

async function handleUploadCommand(
  argv: ArgumentsCamelCase<UploadArtifactCommandArgs>,
) {
  const { groupId, artifactId, version } = parseArtifactInfo(
    argv.artifactTag as string,
  );

  const file = readFileSync(argv.filepath as string);
  const body = file.toString("utf-8");

  const createArtifactRequestOptions: CreateArtifactData & {
    headers: OutgoingHttpHeaders;
  } = {
    body: body as unknown as FileContent,
    path: {
      groupId,
    },
    headers: {
      "X-Registry-ArtifactId": artifactId,
      "X-Registry-ArtifactType": argv.type as string,
      "X-Registry-Version": version as string,
    },
    query: {
      ifExists: argv.ifExists,
    },
  };

  console.log(`Uploading artifact: ${argv.artifactTag}`);
  const { response, error } = await createArtifact(
    createArtifactRequestOptions,
  );

  if (error) {
    console.error(error);
    process.exit(1);
  }

  if (response) {
    console.log("Artifact uploaded successfully");
  }
}
