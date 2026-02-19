'use server';
/**
 * @fileOverview Genkit Flow to extract transaction details with focus on TTxxxxxx reference codes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExtractTransactionInputSchema = z.object({
  emailBody: z.string().describe('The plain text content of the bank notification email.'),
});
export type ExtractTransactionInput = z.infer<typeof ExtractTransactionInputSchema>;

const ExtractTransactionOutputSchema = z.object({
  amount: z.number().describe('The transaction amount.'),
  currency: z.string().default('VND'),
  transactionType: z.enum(['credit', 'debit']),
  referenceCode: z.string().nullable().describe('The reference code, specifically looking for patterns like TT followed by 6 digits (e.g., TT123456).'),
  senderName: z.string().optional(),
  timestamp: z.string(),
});
export type ExtractTransactionOutput = z.infer<typeof ExtractTransactionOutputSchema>;

export async function extractTransaction(input: ExtractTransactionInput): Promise<ExtractTransactionOutput> {
  return extractTransactionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractTransactionPrompt',
  input: { schema: ExtractTransactionInputSchema },
  output: { schema: ExtractTransactionOutputSchema },
  prompt: `You are a financial expert. Parse this bank email.
Look specifically for a reference code starting with "TT" followed by 6 digits (e.g., TT123456, TT009876). This is the MOST important field for order matching.

Email Content:
"""
{{{emailBody}}}
"""

Instructions:
1. Extract the amount as a number.
2. Find the reference code. If you see "TT" followed by digits, that is definitely the referenceCode.
3. Identify if it's money in (credit) or money out (debit).
4. Return a clean JSON.`,
});

const extractTransactionFlow = ai.defineFlow(
  {
    name: 'extractTransactionFlow',
    inputSchema: ExtractTransactionInputSchema,
    outputSchema: ExtractTransactionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Could not parse transaction.');
    }
    return output;
  }
);
