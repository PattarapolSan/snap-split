import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import path from 'path';

// Load env from root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const client = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
});

async function main() {
    try {
        const page = await client.models.list();
        console.log('Available Models:');
        for (const model of page.data) {
            console.log(`- ${model.id} (${model.display_name})`);
        }
    } catch (e) {
        console.error('Error listing models:', e);
    }
}

main();
