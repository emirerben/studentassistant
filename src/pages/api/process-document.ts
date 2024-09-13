import { NextApiRequest, NextApiResponse } from 'next';
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { content } = req.body;

    console.log('Received content:', content);

    const todoPrompt = `
Extract a list of todo items from the following text. Extract as many todo items as possible.

Text:
${content}

Todo items:`;

    const eventPrompt = `
Extract a list of events with dates from the following text. Format each event as "YYYY-MM-DD: Event description" on a new line.

Text:
${content}

Events:`;

    console.log('Sending requests to Hugging Face API...');

    const [todoResult, eventResult] = await Promise.all([
      hf.textGeneration({
        model: 'emirerben/flan-t5-finetuning',
        inputs: todoPrompt,
        parameters: { max_new_tokens: 250, temperature: 0.7 },
      }),
      hf.textGeneration({
        model: 'emirerben/flan-t5-finetuning',
        inputs: eventPrompt,
        parameters: { max_new_tokens: 250, temperature: 0.7 },
      }),
    ]);

    console.log('Todo result:', todoResult.generated_text);
    console.log('Event result:', eventResult.generated_text);

    // Updated parsing logic for todos
    const todos = todoResult.generated_text
      .replace(/Todo item \d+:/g, '•')
      .split(/[,]/)
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .map(item => item.replace(/^[cC]/, 'C').replace(/^[fF]/, 'F'));

    // Updated parsing logic for events
    const events = eventResult.generated_text
      .split('\n')
      .filter(item => /^\d{4}-\d{2}-\d{2}:/.test(item))
      .map(item => {
        const [dateStr, ...descParts] = item.split(':');
        const date = new Date(dateStr.trim());
        const description = descParts.join(':').trim();
        return { date, description };
      })
      .filter(event => !isNaN(event.date.getTime()));

    console.log('Processed todos:', todos);
    console.log('Processed events:', events);

    res.status(200).json({ todos, events });
  } catch (error) {
    console.error('Error processing document:', error);
    res.status(500).json({ error: 'Error processing document', details: error.message });
  }
}