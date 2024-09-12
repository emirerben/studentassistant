import React from 'react';

interface TodoListProps {
  todos: string[];
}

export default function TodoList({ todos }: TodoListProps) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Todo List</h2>
      <ul>
        {todos.map((todo, index) => (
          <li key={index}>{todo}</li>
        ))}
      </ul>
    </div>
  );
}