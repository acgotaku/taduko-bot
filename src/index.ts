import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { GoogleGenerativeAI } from '@google/generative-ai';

const bot = new Telegraf(process.env.BOT_TOKEN);

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  systemInstruction: {
    role: 'system',
    parts: [
      {
        text: 'You will be provided with a sentence in English or Chinese, and you will need to translate it into the other language.'
      }
    ]
  }
});

bot.command('quit', async ctx => {
  // Explicit usage
  await ctx.telegram.leaveChat(ctx.message.chat.id);

  // Using context shortcut
  await ctx.leaveChat();
});

bot.on(message('text'), async ctx => {
  model
    .generateContent(ctx.message.text)
    .then(async result => {
      await ctx.reply(result.response.text());
    })
    .catch(async error => {
      await ctx.reply(error.message);
    });
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
