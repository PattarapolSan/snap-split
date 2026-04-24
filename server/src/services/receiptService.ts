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
        rounding: number;
    }> {
        if (!process.env.CLAUDE_API_KEY) {
            throw new Error('CLAUDE_API_KEY is not configured');
        }

        const base64Image = imageBuffer.toString('base64');

        const systemPrompt = `
        You are a receipt scanning assistant. Extract purchased items and tax info from the image.
        
        CRITICAL RULES:
        1. **Price is UNIT PRICE**: The 'price' field must be the price per single item. If quantity is 2 and the receipt shows 38.00, extract price as 19.00.
        2. **Tax (STRICT)**: Set 'tax_rate' ONLY if a Tax/VAT/GST line with a percentage is EXPLICITLY printed on the receipt. NEVER assume or infer tax from country, restaurant type, or math. If you do not see a tax line printed, tax_rate MUST be 0.
        3. **Service Charge**: Extract the "Service Charge" (SVC/SC) percentage only if explicitly printed.
        4. **Base Price Priority**: NEVER include Tax or Service Charge amounts in the item 'price'. If prices are tax-inclusive, set tax_rate to 0.
        5. **Anti-Hallucination**: DO NOT guess or invent items or rates. If text is blurry or cut off, skip it.
        6. **Unsure Marking**: If not 100% sure of name or price, prefix with "[UNSURE] ".
        7. **Rounding**: Handle two cases:
           - EXPLICIT: Receipt shows a "Rounding", "ปัดเศษ", or "Round" line → extract that value directly as 'rounding' in baht.
           - SILENT: No rounding line, but grand total on receipt differs from (subtotal + service_charge_amount) by a small amount (within ±5 baht) → rounding = printed_grand_total - (subtotal + service_charge_amount). Do NOT add tax to explain the difference.
           Negative rounding = round down, positive = round up. Default 0.

        Return ONLY a JSON object:
        {
          "items": [
            { "name": "ItemName", "price": 100.0, "quantity": 1 }
          ],
          "tax_rate": 7.0,
          "service_charge_rate": 0.0,
          "rounding": 0.0
        }

        Exclude subtotals, taxes, rounding, or total lines from the "items" list.
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
                service_charge_rate: Number(result.service_charge_rate) || 0,
                rounding: Number(result.rounding) || 0
            };

        } catch (error) {
            console.error('Receipt analysis failed:', error);
            throw new Error('Failed to analyze receipt');
        }
    }
}
