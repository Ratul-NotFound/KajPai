import { describe, it, expect } from 'vitest';
import { formatTelegramMessage, escapeTelegramMarkdown } from '../src/notifications/telegram';
import { getMockJobs } from '../src/lib/mockData';

describe('Telegram Notification Formatter', () => {
  it('correctly escapes reserved markdown characters', () => {
    const raw = 'Title [Special] (Test) & More_Symbols *Bold* ~Strike~';
    const escaped = escapeTelegramMarkdown(raw);
    expect(escaped).toContain('\\[Special\\]');
    expect(escaped).toContain('\\(Test\\)');
    expect(escaped).toContain('\\*Bold\\*');
    expect(escaped).toContain('\\~Strike\\~');
  });

  it('formats telegram job alert message cleanly with headers and details', () => {
    const mockJobs = getMockJobs().slice(0, 2);
    const message = formatTelegramMessage(mockJobs);

    expect(message).toContain('JobPulse BD');
    expect(message).toContain(escapeTelegramMarkdown(mockJobs[0].title));
    expect(message).toContain(escapeTelegramMarkdown(mockJobs[0].company));
    expect(message).toContain(mockJobs[0].applyUrl);
  });
});
