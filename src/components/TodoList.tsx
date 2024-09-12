import React from 'react';

interface TodoListProps {
  todos: string[];
}

export default function TodoList({ todos }: TodoListProps) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-2">Todo List</h2>
      {todos.length === 0 ? (
        <p>No todos found.</p>
      ) : (
        <ul className="list-disc pl-5">
          {todos.map((todo, index) => (
            <li key={index} className="mb-1">{todo}</li>
          ))}
        </ul>
      )}
    </div>
  );
}