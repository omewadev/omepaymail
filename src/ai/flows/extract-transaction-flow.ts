'use server';
/**
 * @fileOverview Genkit Flow to extract transaction details from bank notification emails.
 *
 * - extractTransaction - The main function to parse email content.
 * - ExtractTransactionInput - Input schema (email body).
 * - ExtractTransactionOutput - Structured output (amount, ref, etc).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExtractTransactionInputSchema = z.object({
  emailBody: z.string().describe('The plain text content of the bank notification email.'),
  bankName: z.string().optional().describe('Optional hint about which bank sent the email.'),
});
export type ExtractTransactionInput = z.infer<typeof ExtractTransactionInputSchema>;

const ExtractTransactionOutputSchema = z.object({
  amount: z.number().describe('The transaction amount as a numeric value.'),
  currency: z.string().default('VND').describe('The currency of the transaction.'),
  transactionType: z.enum(['credit', 'debit']).describe('Whether money was added or removed.'),
  referenceCode: z.string().nullable().describe('The order reference or description code found in the transaction content.'),
  timestamp: z.string().describe('The date and time of the transaction mentioned in the email.'),
  senderName: z.string().optional().describe('Name of the person who sent the money, if available.'),
  accountNumber: z.string().optional().describe('The partial or full account number mentioned.'),
});
export type ExtractTransactionOutput = z.infer<typeof ExtractTransactionOutputSchema>;

export async function extractTransaction(input: ExtractTransactionInput): Promise<ExtractTransactionOutput> {
  return extractTransactionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractTransactionPrompt',
  input: { schema: ExtractTransactionInputSchema },
  output: { schema: ExtractTransactionOutputSchema },
  prompt: `You are a financial data extraction assistant. 
Your task is to parse a bank notification email and return a clean JSON object.

Bank Name: {{{bankName}}}
Email Content:
"""
{{{emailBody}}}
"""

Instructions:
1. Identify the numerical amount.
2. Determine if it's a "credit" (money in, usually marked by '+') or "debit" (money out, usually marked by '-').
3. Look for reference codes like "ORD-123", "DH456", or any unique string in the description.
4. Extract the date/time.
5. If the language is Vietnamese, translate fields appropriately to the English schema but keep the reference code exactly as is.`,
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
      throw new Error('Could not extract transaction data from the provided email.');
    }
    return output;
  }
);
