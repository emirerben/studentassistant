'use client';

import { useState } from 'react';
import FileUpload from '../components/FileUpload';
import TodoList from '../components/TodoList';
import Calendar from '../components/Calendar';
import { processDocument } from '../lib/huggingface';

export default function Home() {
  const [todos, setTodos] = useState<string[]>([]);
  const [events, setEvents] = useState<{ date: Date; description: string }[]>([]);

  const handleUpload = async (text: string) => {
    const result = await processDocument(text);
    setTodos(result.todos);
    setEvents(result.events);
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Student Assistant</h1>
      <FileUpload onUpload={handleUpload} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <TodoList todos={todos} />
        <Calendar events={events} />
      </div>
    </main>
  );
}