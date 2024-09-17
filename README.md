# Apicurio Registry CLI

This is the command-line interface (CLI) for the Apicurio Registry. It is a simple tool that allows you to interact with the Apicurio Registry using the command line. It is useful
for scripting, automation, and other tasks where a graphical user interface is not available.

## Installation

The CLI is distributed as a npm package. You can install it using the following command:

```bash
npm install -g @simonnepomuk/apicurio-registry-cli
```

This will install the CLI globally on your system. You can then run the CLI using the `apicurio` command.

For one-off usage, you can also use `npx` to run the CLI without installing it:

```bash
npx @simonnepomuk/apicurio-registry-cli
```

## Usage

The CLI is a simple command-line tool that provides a number of commands for interacting with the Apicurio Registry. You can get help on the available commands by running the CLI
with the `--help` option:

```bash
apicurio --help
```

### Downloading an artifact

You can download an artifact from the registry using the `download` command. For example:

```bash
apicurio artifact download com.example/my-artifact:1.0.0 --registry http://<registry-url>
```

This will download the artifact from the registry and save it to the current directory. Its possible to omit the version and the CLI will download the latest version of the artifact.

### Uploading an artifact

You can upload an artifact to the registry using the `upload` command. For example:

```bash
apicurio artifact upload com.example/my-artifact:1.0.0 -f my-artifact.json --registry http://<registry-url>
```

Its possible to omit the version and the CLI will upload a new artifact version.

### Authenticating with the registry

The CLI supports authentication using OAuth2 device flow for human actors and the resource owner password credentials grant for machine actors.
You can authenticate with the registry using the `auth-url` option. If you pass the `--auth-url` option and `client-id` the CLI will start the device flow.
If you pass the `--auth-url`, `client-id`, `client-secret` the CLI will start the resource owner password credentials grant. You can optionally pass a comma-separated list of scopes with the `--scopes` option to specify the scopes of the token.

#### Device flow
```bash
apicurio --auth-url http://<auth-url> --client-id <client-id>
```

#### Resource owner password credentials grant
```bash
apicurio --auth-url http://<auth-url> --client-id <client-id> --client-secret <client-secret>
```

# Commands
  <!-- commands -->
* [`apicurio artifact download ARTIFACTTAG`](#apicurio-artifact-download-artifacttag)
* [`apicurio artifact upload ARTIFACTTAG`](#apicurio-artifact-upload-artifacttag)
* [`apicurio help [COMMAND]`](#apicurio-help-command)

## `apicurio artifact download ARTIFACTTAG`

Download artifact. Usage example: `artifact download <groupId>/<artifactId>[:version]`

```
USAGE
  $ apicurio artifact download ARTIFACTTAG --registry <value> [--clientSecret <value>] [--scopes <value>... [--authUrl
    <value> --clientId <value>] ] [-o <value>] [-w]

ARGUMENTS
  ARTIFACTTAG  Artifact tag

FLAGS
  -o, --output=<value>        Output file path.
  -w, --overwrite             Overwrite existing files
      --authUrl=<value>       The .well-known URL of the OpenID Connect discovery document
      --clientId=<value>      The OAuth2 client ID
      --clientSecret=<value>  The OAuth2 client secret
      --registry=<value>      (required) Apicurio Registry URL
      --scopes=<value>...     OAuth2 scopes

DESCRIPTION
  Download artifact. Usage example: artifact download <groupId>/<artifactId>[:version]

EXAMPLES
  $ apicurio artifact download
```

_See code: [src/commands/artifact/download.ts](https://github.com/simonnepomuk/apicurio-registry-cli/blob/v/src/commands/artifact/download.ts)_

## `apicurio artifact upload ARTIFACTTAG`

Upload artifact

```
USAGE
  $ apicurio artifact upload ARTIFACTTAG --registry <value> -f <value> [--clientSecret <value>] [--scopes <value>...
    [--authUrl <value> --clientId <value>] ] [--ifExists FAIL|UPDATE|RETURN|RETURN_OR_UPDATE] [-t
    PROTOBUF|JSON|AVRO|KONNECT|OPENAPI|ASYNCAPI|GRAPHQL|WSDL|XSD]

ARGUMENTS
  ARTIFACTTAG  Artifact tag

FLAGS
  -f, --file=<value>          (required) file to upload
  -t, --type=<option>         Artifact Type.
                              <options: PROTOBUF|JSON|AVRO|KONNECT|OPENAPI|ASYNCAPI|GRAPHQL|WSDL|XSD>
      --authUrl=<value>       The .well-known URL of the OpenID Connect discovery document
      --clientId=<value>      The OAuth2 client ID
      --clientSecret=<value>  The OAuth2 client secret
      --ifExists=<option>     [default: RETURN_OR_UPDATE] Strategy if artifact already exists
                              <options: FAIL|UPDATE|RETURN|RETURN_OR_UPDATE>
      --registry=<value>      (required) Apicurio Registry URL
      --scopes=<value>...     OAuth2 scopes

DESCRIPTION
  Upload artifact

EXAMPLES
  $ apicurio artifact upload
```

_See code: [src/commands/artifact/upload.ts](https://github.com/simonnepomuk/apicurio-registry-cli/blob/v/src/commands/artifact/upload.ts)_

## `apicurio help [COMMAND]`

Display help for apicurio.

```
USAGE
  $ apicurio help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for apicurio.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.11/src/commands/help.ts)_
<!-- commandsstop -->