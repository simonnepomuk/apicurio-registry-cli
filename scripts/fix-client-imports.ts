import * as fs from 'node:fs';
import * as path from 'node:path';

console.log("\nFixing client imports...");

const directory = 'src/generated/client';
const importRegex = /^(import|export)\s+(.*)\s+from\s+["'](\.\/.*)["'];?$/gm;

for (const file of fs.readdirSync(directory)) {
    if (file.endsWith('.ts')) { // Only modify .ts files
        const filePath = path.join(directory, file);
        addJsExtension(filePath);
    }
}

function addJsExtension(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf8');

    const updatedContent = content.replaceAll(importRegex, (match, p1, p2, p3) => {
        if (p3.endsWith('.js')) return match;
        return `${p1} ${p2} from '${p3}.js';`;
    });

    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Updated file: ${filePath}`);
}

