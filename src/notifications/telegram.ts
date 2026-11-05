import { Job } from '../lib/types';

/**
 * Escapes reserved MarkdownV2 characters in Telegram messages:
 * _ * [ ] ( ) ~ ` > # + - = | { } . !
 */
export function escapeTelegramMarkdown(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

/**
 * Escapes characters inside inline Markdown link target: (url)
 * Telegram requires ')' and '\' to be escaped inside the URL parentheses.
 */
export function escapeTelegramUrl(url: string): string {
  return url.replace(/([)\\])/g, '\\$1');
}

/**
 * Formats a list of newly scraped jobs into a concise, readable Telegram MarkdownV2 message.
 */
export function formatTelegramMessage(jobs: Job[]): string {
  if (jobs.length === 0) return '';

  const header = `🚀 *JobPulse BD \\- New Job Alerts* \\(${jobs.length} new\\)\n\n`;

  const jobBlocks = jobs.slice(0, 8).map((job, idx) => {
    const title = escapeTelegramMarkdown(job.title);
    const company = escapeTelegramMarkdown(job.company);
    const location = escapeTelegramMarkdown(job.location);
    const category = escapeTelegramMarkdown(job.category.replace('_', ' '));
    const salary = job.salary ? escapeTelegramMarkdown(job.salary) : 'Negotiable';
    const applyUrl = escapeTelegramUrl(job.applyUrl);

    return (
      `*${idx + 1}\\. ${title}*\n` +
      `🏢 ${company} \\| 📁 ${category}\n` +
      `📍 ${location}\n` +
      `💰 ${salary}\n` +
      `🔗 [Apply Now](${applyUrl})`
    );
  });

  const footer = jobs.length > 8 ? `\n\n_\\+ ${jobs.length - 8} more jobs posted on your dashboard\\._` : '';

  return header + jobBlocks.join('\n\n') + footer;
}

/**
 * Dispatches a Telegram notification using Telegram Bot API.
 * Gracefully no-ops if environment variables are not provided.
 */
export async function sendTelegramAlert(
  jobs: Job[]
): Promise<{ success: boolean; sentCount: number; error?: string }> {
  if (jobs.length === 0) {
    return { success: true, sentCount: 0 };
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.log('Telegram credentials not set (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID). Skipping message dispatch.');
    return { success: false, sentCount: 0, error: 'Credentials not configured' };
  }

  try {
    const text = formatTelegramMessage(jobs);
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'MarkdownV2',
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('Telegram API error:', errBody);
      return { success: false, sentCount: 0, error: errBody };
    }

    console.log(`Successfully dispatched Telegram alert for ${jobs.length} new jobs.`);
    return { success: true, sentCount: jobs.length };
  } catch (err: any) {
    console.error('Failed to dispatch Telegram alert:', err);
    return { success: false, sentCount: 0, error: err.message };
  }
}
