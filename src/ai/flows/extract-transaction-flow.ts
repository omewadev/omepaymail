'use server';
/**
 * @fileOverview Genkit Flow to extract transaction details with dynamic reference prefixes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExtractTransactionInputSchema = z.object({
  emailBody: z.string().describe('The plain text content of the bank notification email.'),
  referencePrefix: z.string().default('TT').describe('The prefix used to identify orders (e.g., TT, CG, DH).'),
});
export type ExtractTransactionInput = z.infer<typeof ExtractTransactionInputSchema>;

const ExtractTransactionOutputSchema = z.object({
  amount: z.number().describe('The transaction amount.'),
  currency: z.string().default('VND'),
  transactionType: z.enum(['credit', 'debit']),
  referenceCode: z.string().nullable().describe('The identified order reference code found in the email.'),
  senderName: z.string().optional().describe('Name of the person who sent the money.'),
  timestamp: z.string().describe('Time of the transaction recorded in the email.'),
});
export type ExtractTransactionOutput = z.infer<typeof ExtractTransactionOutputSchema>;

export async function extractTransaction(input: ExtractTransactionInput): Promise<ExtractTransactionOutput> {
  return extractTransactionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractTransactionPrompt',
  input: { schema: ExtractTransactionInputSchema },
  output: { schema: ExtractTransactionOutputSchema },
  prompt: `You are a financial AI agent. Your mission is to extract transaction details from bank notification emails.

The user is looking for a specific reference code that starts with the prefix: "{{{referencePrefix}}}".

Email Content:
"""
{{{emailBody}}}
"""

Rules:
1. Check if this is a bank transfer notification (money received). If YES, extract the amount and set transactionType to 'credit'.
2. Scan for any alphanumeric pattern that starts with "{{{referencePrefix}}}". This is the referenceCode.
3. CRITICAL: If you find the amount (money received) BUT the user forgot to include the "{{{referencePrefix}}}" code in the transfer description, you MUST STILL return the amount, senderName, and timestamp, but set referenceCode to null.
4. Return a valid JSON object.`,
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
      throw new Error('AI could not identify a valid transaction in this email.');
    }
    return output;
  }
);