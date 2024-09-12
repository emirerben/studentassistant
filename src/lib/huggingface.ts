import { HfInference } from '@huggingface/inference';

// console.log("API Key:", process.env.HUGGINGFACE_API_KEY); // Add this line

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function processDocument(content: string): Promise<{ todos: string[], events: { date: Date, description: string }[] }> {
  const todos = await extractTodos(content);
  const events = await extractEvents(content);

  return { todos, events };
}

async function extractTodos(content: string): Promise<string[]> {
  const prompt = `
Extract a list of todo items from the following text. Each todo item should start with a dash (-).

Text:
${content}

Todo items:`;

  const result = await hf.textGeneration({
    model: 'google/flan-t5-large',
    inputs: prompt,
    parameters: {
      max_new_tokens: 256,
      temperature: 0.7,
    },
  });

  return result.generated_text
    .split('\n')
    .filter(item => item.trim().startsWith('-'))
    .map(item => item.trim().substring(1).trim());
}

async function extractEvents(content: string): Promise<{ date: Date, description: string }[]> {
  const prompt = `
Extract a list of events with dates from the following text. Format each event as "YYYY-MM-DD: Event description".

Text:
${content}

Events:`;

  const result = await hf.textGeneration({
    model: 'google/flan-t5-large',
    inputs: prompt,
    parameters: {
      max_new_tokens: 256,
      temperature: 0.7,
    },
  });

  return result.generated_text
    .split('\n')
    .filter(item => item.includes(':'))
    .map(item => {
      const [dateStr, ...descParts] = item.split(':');
      const date = new Date(dateStr.trim());
      const description = descParts.join(':').trim();
      return { date, description };
    })
    .filter(event => !isNaN(event.date.getTime()));
}