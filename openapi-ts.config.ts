import {defineConfig} from '@hey-api/openapi-ts';

export default defineConfig({
    client: {name: '@hey-api/client-fetch'},
    input: 'tmp/openapi.json',
    output: 'src/generated/client',
});