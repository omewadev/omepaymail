
'use server';
/**
 * @fileOverview Genkit Flow to extract transaction details with strict focus on TTxxxxxx reference codes.
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
  referenceCode: z.string().nullable().describe('The order reference code, strictly looking for TT followed by 6 digits (e.g., TT123456).'),
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
  prompt: `You are a financial AI agent. Your mission is to extract transaction details from bank notification emails, specifically for matching WordPress orders.

The most critical field is the "referenceCode". WordPress uses a QR code that includes a reference like "TT123456" (TT + 6 digits). 

Email Content:
"""
{{{emailBody}}}
"""

Rules:
1. Scan for the pattern "TT" followed by exactly 6 digits.
2. If multiple patterns exist, pick the one most likely to be the payment description.
3. Extract the amount.
4. If the email describes money received, set transactionType to 'credit'.
5. Return a valid JSON object.`,
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
