'use client';

import { useState } from 'react';
import FileUpload from '../components/FileUpload';
import TodoList from '../components/TodoList';
import Calendar from '../components/Calendar';

export default function Home() {
  const [todos, setTodos] = useState<string[]>([]);
  const [events, setEvents] = useState<{ date: Date; description: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (text: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/process-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process document');
      }

      const result = await response.json();
      console.log('API Response:', result); // Log the API response

      if (result.todos.length === 0 && result.events.length === 0) {
        setError('No todos or events were extracted from the text. Please try a different input.');
      } else {
        setTodos(result.todos);
        setEvents(result.events.map((event: any) => ({
          ...event,
          date: new Date(event.date)
        })));
      }
    } catch (error) {
      console.error('Error processing document:', error);
      setError(`An error occurred while processing the document: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Student Assistant</h1>
      <FileUpload onUpload={handleUpload} />
      {isLoading && <p className="mt-4">Processing your text...</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {!isLoading && !error && (todos.length > 0 || events.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <TodoList todos={todos} />
          <Calendar events={events} />
        </div>
      )}
    </main>
  );
}