import { Redis } from '@upstash/redis';
import TelegramBot from 'node-telegram-bot-api';

const redis = Redis.fromEnv();

const messages = [
  "💖 USD / BRL OTC 💖\n\n😍 1 MINUTES 💗",
  "🌸 USD / MXN OTC 🌸\n\n💞 1 MINUTES 😘",
  "✨ USD / NGN OTC ✨\n\n🤍 1 MINUTES 😍",
  "💫 USD / ZAR OTC 💫\n\n💕 1 MINUTES 😍",
  "🌸 USD / INR OTC 🌸\n\n💞 1 MINUTES 😘",
  "🌸 USD / PKR OTC 🌸\n\n💞 1 MINUTES 😘",
  "🌸 NZD / CHF OTC 🌸\n\n💞 1 MINUTES 😘",
  "🌸 USD / ARS OTC 🌸\n\n💞 1 MINUTES 😘",
  "🌸 USD / COP OTC 🌸\n\n💞 1 MINUTES 😘",
  "🌸 CAD / CHF OTC 🌸\n\n💞 1 MINUTES 😘",
  "🌸 USD / BDT OTC 🌸\n\n💞 1 MINUTES 😘",
];

export default async function handler(req, res) {
  try {
    const config = await redis.get('bot_config');

    // Agar bot OFF hai ya config setup nahi hai
    if (!config || !config.enabled) {
      return res.status(200).json({ status: "Bot is OFF or Not Configured" });
    }

    let count = (await redis.get('signal_count')) || 0;

    if (count >= 100) {
      const bot = new TelegramBot(config.token);
      const summaryMsg = 
        "❤️ RQA AI SIGNALS BOT ❤️\n\n" +
        "      TODAY TOTAL SIGNALS = 100\n\n" +
        "      ALL SIGNALS COMPLETED SUCCESSFULLY! ✨";

      await bot.sendMessage(config.channelId, summaryMsg);
      
      // Stop bot after 100 signals
      config.enabled = false;
      await redis.set('bot_config', config);

      return res.status(200).json({ status: "Daily 100 Signals Completed" });
    }

    count += 1;
    await redis.set('signal_count', count);

    // Trade time: exact 30 seconds in future
    const tradeTime = new Date(Date.now() + 30 * 1000);
    const hours = String(tradeTime.getHours()).padStart(2, '0');
    const minutes = String(tradeTime.getMinutes()).padStart(2, '0');
    const timeFormatted = `${hours}:${minutes}`;

    const pairMessage = messages[Math.floor(Math.random() * messages.length)];
    const direction = Math.random() > 0.5 ? "🔼 UP / CALL" : "🔽 DOWN / PUT";

    const fullMsg = 
      `${pairMessage}\n\n` +
      `${direction}\n\n` +
      `⏰ TIME = ${timeFormatted}\n` +
      `📊 SIGNAL = ${count} / 100`;

    const bot = new TelegramBot(config.token);
    await bot.sendMessage(config.channelId, fullMsg);

    return res.status(200).json({ success: true, signalSent: count, tradeTime: timeFormatted });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
