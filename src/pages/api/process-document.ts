import { NextApiRequest, NextApiResponse } from 'next';
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { content } = req.body;

      console.log("Received content:", content);
      console.log("Sending requests to Hugging Face API...");

      const todoResult = await hf.textGeneration({
        model: "emirerben/flan-t5-finetuning",
        inputs: `Convert to a simple todo list: ${content}.Including all the tasks with their time`,
        parameters: {
          max_new_tokens: 100,
          temperature: 0.7,
        },
      });

      console.log("Todo result:", todoResult.generated_text);

      const processedTodos = processTodoOutput(todoResult.generated_text);
      console.log("Processed todos:", processedTodos);

      res.status(200).json({ todos: processedTodos, events: [] });
    } catch (error) {
      console.error("Error processing document:", error);
      res.status(500).json({ error: "Error processing document" });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

function processTodoOutput(output: string): string[] {
  // Split the output into individual tasks
  const tasks = output.split(/,|\band\b/).map(task => task.trim());

  // Process each task to extract meaningful todo items
  const processedTasks = tasks.map(task => {
    // Remove common prefixes and time indicators
    task = task.replace(/^(i will|i'll|to|i need to|i have to|i must|i should|later)\s+/i, '');

    // Extract the main action and object
    const match = task.match(/^(be\s+)?(doing|going\s+to)?\s*(.+)/i);
    if (match && match[3]) {
      task = match[3];
    }

    // Extract time information
    const timeMatch = task.match(/\b(in the\s+)?(morning|afternoon|evening|night|today|tomorrow|later|tonight)\b/i);
    let timeInfo = timeMatch ? timeMatch[0] : '';

    // Remove the time information from the main task
    task = task.replace(timeInfo, '').trim();

    // Remove common verbs at the beginning
    task = task.replace(/^(eat|go|do|make|write|call|buy|prepare|get|have|attend|organize|plan|play|meet)\s+/i, '');

    // Handle specific cases
    if (task.toLowerCase().includes('math homework')) {
      task = 'Complete math homework';
    } else if (task.toLowerCase().includes('difficult')) {
      task = task.replace(/difficult\s+/i, '');
    } else if (task.toLowerCase().includes('party') || task.toLowerCase().includes('partying')) {
      task = task.replace(/go\s+to\s+/i, '');
      task = `Attend ${task}`;
    }

    // Remove unnecessary words
    task = task.replace(/\b(a|an|the|with|to|for)\b/gi, '').replace(/\s+/g, ' ').trim();

    // Capitalize the first letter
    task = task.charAt(0).toUpperCase() + task.slice(1);

    // Add the time information back if it exists
    if (timeInfo) {
      task += ` ${timeInfo.trim()}`;
    }

    return task;
  });

  // Remove any empty tasks and return
  return processedTasks.filter(task => task.length > 0);
}