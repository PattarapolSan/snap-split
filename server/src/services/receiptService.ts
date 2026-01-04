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

    async analyzeReceipt(imageBuffer: Buffer, mediaType: string = 'image/jpeg'): Promise<{
        items: Partial<Item>[];
        tax_rate: number;
        service_charge_rate: number;
    }> {
        if (!process.env.CLAUDE_API_KEY) {
            throw new Error('CLAUDE_API_KEY is not configured');
        }

        const base64Image = imageBuffer.toString('base64');

        const systemPrompt = `
        You are a receipt scanning assistant. Extract purchased items and tax info from the image.
        
        CRITICAL RULES:
        1. **Price is UNIT PRICE**: The 'price' field must be the the price per single item. If quantity is 2 and the receipt shows 38.00, extract price as 19.00.
        2. **Tax & Service Charge**: Extract the "Tax" (VAT/GST) and "Service Charge" (SVC/SC) if present as percentages of the subtotal.
        3. **Base Price Priority**: NEVER include the identified Tax or Service Charge amounts in the item 'price' field. The 'price' must be the BASE price. If the receipt prices are "Tax inclusive", set 'tax_rate' to 0 to avoid double counting.
        4. **Anti-Hallucination**: DO NOT guess or invent items. If text is blurry or cut off, skip it.
        5. **Unsure Marking**: If not 100% sure of name or price, prefix with "[UNSURE] ".
        6. **Mathematical Consistency**: Aim for the sum of (price × quantity) for all items to match the subtotal on the receipt. If there's a minor rounding difference, prioritize the prices shown on the receipt.
        
        Return ONLY a JSON object:
        {
          "items": [
            { "name": "ItemName", "price": 100.0, "quantity": 1 }
          ],
          "tax_rate": 7.0,
          "service_charge_rate": 0.0
        }
        
        Exclude subtotals, taxes, or total lines from the "items" list.
        `;

        try {
            const response = await this.model.invoke([
                new SystemMessage(systemPrompt),
                new HumanMessage({
                    content: [
                        {
                            type: 'image_url',
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
                contentText = response.content.map(c => (c as any).text || '').join('');
            }

            // More robust JSON extraction
            const jsonMatch = contentText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.error('No JSON found in response:', contentText);
                throw new Error('Failed to find JSON data in receipt analysis');
            }

            const result = JSON.parse(jsonMatch[0]);

            return {
                items: (result.items || []).map((item: any) => ({
                    name: item.name,
                    price: Number(item.price),
                    quantity: Number(item.quantity) || 1
                })),
                tax_rate: Number(result.tax_rate) || 0,
                service_charge_rate: Number(result.service_charge_rate) || 0
            };

        } catch (error) {
            console.error('Receipt analysis failed:', error);
            throw new Error('Failed to analyze receipt');
        }
    }
}
