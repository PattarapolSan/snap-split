import { ChatAnthropic } from '@langchain/anthropic';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { Item } from '@snap-split/shared';

export class ReceiptService {
    private model: ChatAnthropic;

    constructor() {
        if (!process.env.CLAUDE_API_KEY) {
            console.warn('CLAUDE_API_KEY is not configured');
        }

        this.model = new ChatAnthropic({
            apiKey: process.env.CLAUDE_API_KEY,
            modelName: 'claude-sonnet-4-5-20250929',
            maxTokens: 1024,
            temperature: 0,
        });
    }

    async analyzeReceipt(imageBuffer: Buffer, mediaType: string = 'image/jpeg'): Promise<Partial<Item>[]> {
        if (!process.env.CLAUDE_API_KEY) {
            throw new Error('CLAUDE_API_KEY is not configured');
        }

        const base64Image = imageBuffer.toString('base64');

        const systemPrompt = `
        You are a receipt scanning assistant.
        Extract the list of purchased items from the receipt image.
        Return ONLY a JSON array of objects with these fields:
        - name (string): The name of the item
        - price (number): The total price for this line item (if quantity > 1, total price, not unit price)
        - quantity (number): The quantity (default to 1 if not specified)
        
        Do not include subtotal, tax, or total lines.
        Do not include any text, markdown, or code blocks before or after the JSON array.
        `;

        try {
            const response = await this.model.invoke([
                new SystemMessage(systemPrompt),
                new HumanMessage({
                    content: [
                        {
                            type: 'image_url', // LangChain uses 'image_url' for OpenAI compat, but usually accepts base64 for Anthropic too if structured right
                            // Actually, standard LangChain image content block:
                            // For Anthropic specifically, it might expect specific format or generic message content.
                            // Let's use the generic 'image_url' with data URI which works across many LangChain providers
                            image_url: {
                                url: `data:${mediaType};base64,${base64Image}`
                            }
                        }
                    ]
                })
            ]);

            // Clean up content
            let contentText = typeof response.content === 'string' ? response.content : '';
            if (Array.isArray(response.content)) {
                // If complex content, extract text
                contentText = response.content.map(c => (c as any).text || '').join('');
            }

            // Just in case model adds markdown
            const jsonStr = contentText.replace(/```json/g, '').replace(/```/g, '').trim();
            const items = JSON.parse(jsonStr);

            return items.map((item: any) => ({
                name: item.name,
                price: Number(item.price),
                quantity: Number(item.quantity) || 1
            }));

        } catch (error) {
            console.error('Receipt analysis failed:', error);
            throw new Error('Failed to analyze receipt');
        }
    }
}
