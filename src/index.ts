import {Args, Command, Flags, Interfaces} from '@oclif/core';

import {authenticate} from "./auth/auth.js";
import {client} from "./generated/client/index.js";

export {run} from '@oclif/core'

export type Flags<T extends typeof Command> = Interfaces.InferredFlags<T['flags'] & typeof BaseCommand['baseFlags']>
export type Args<T extends typeof Command> = Interfaces.InferredArgs<T['args']>

export abstract class BaseCommand<T extends typeof Command> extends Command {
    static baseFlags = {
        authUrl: Flags.string({
            aliases: ['auth-url'],
            dependsOn: ['clientId'],
            description: 'Apicurio Registry Auth URL',
            env: 'APICURIO_REGISTRY_AUTH_URL',
            required: false,
        }),
        clientId: Flags.string({
            aliases: ['client-id'],
            description: 'Apicurio Registry Client ID',
            env: 'APICURIO_REGISTRY_CLIENT_ID',
        }),
        clientSecret: Flags.string({
            aliases: ['client-secret'],
            description: 'Apicurio Registry Client Secret',
            env: 'APICURIO_REGISTRY_CLIENT_SECRET',
        }),
        registry: Flags.string({
            description: 'Apicurio Registry URL',
            env: 'APICURIO_REGISTRY_URL',
            required: true,
        }),
        scopes: Flags.string({
            delimiter: ',',
            dependsOn: ['authUrl', 'clientId'],
            description: 'OAuth2 scopes',
            multiple: true,
        }),
    };

    protected args!: Args<T>
    protected flags!: Flags<T>

    public async init(): Promise<void> {
        await super.init()
        const {args, flags} = await this.parse({
            args: this.ctor.args,
            baseFlags: (super.ctor as typeof BaseCommand).baseFlags,
            enableJsonFlag: this.ctor.enableJsonFlag,
            flags: this.ctor.flags,
            strict: this.ctor.strict,
        })
        this.flags = flags as Flags<T>
        this.args = args as Args<T>

        const {authUrl, clientId, clientSecret, registry, scopes} = this.flags
        client.setConfig({
            baseUrl: `${registry}/apis/registry/v2`,
        });

        authUrl && await authenticate({authUrl, clientId: clientId as string, clientSecret, scopes})
    }
}

export abstract class ArtifactCommand<T extends typeof Command> extends BaseCommand<T> {
    static args = {
        ...BaseCommand.args,
        artifactTag: Args.string({description: 'Artifact tag', required: true}),
    }
}