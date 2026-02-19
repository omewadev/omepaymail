
'use server';
/**
 * @fileOverview Genkit Flow to generate personalized limit warning emails.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const NotificationInputSchema = z.object({
  userName: z.string(),
  used: z.number(),
  limit: z.number(),
  planName: z.string(),
  paymentLink: z.string().default('/dashboard/billing'),
});
export type NotificationInput = z.infer<typeof NotificationInputSchema>;

const NotificationOutputSchema = z.object({
  subject: z.string(),
  body: z.string(),
  recipientType: z.enum(['user', 'admin']),
});
export type NotificationOutput = z.infer<typeof NotificationOutputSchema>;

export async function generateNotification(input: NotificationInput): Promise<NotificationOutput> {
  return notificationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'notificationPrompt',
  input: { schema: NotificationInputSchema },
  output: { schema: NotificationOutputSchema },
  prompt: `You are a professional customer success AI for PayMailHook.
Generate a persuasive and helpful notification for a user who has used {{{used}}} out of {{{limit}}} transactions in their {{{planName}}} plan.

For the USER:
- Subject: Urgent or Warning about their transaction limit.
- Body: Remind them that their service might be interrupted. Include the payment link: {{{paymentLink}}}. Be polite but firm.

For the ADMIN:
- Subject: High usage alert for user {{{userName}}}.
- Body: Inform the admin to prepare for manual upgrade or follow-up.

Return a JSON object with subject, body, and set recipientType to 'user'.`,
});

const notificationFlow = ai.defineFlow(
  {
    name: 'notificationFlow',
    inputSchema: NotificationInputSchema,
    outputSchema: NotificationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('Failed to generate notification content.');
    return output;
  }
);
