import React from 'react';

interface CalendarProps {
  events: { date: Date; description: string }[];
}

export default function Calendar({ events }: CalendarProps) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Calendar</h2>
      <ul>
        {events.map((event, index) => (
          <li key={index}>
            {event.date.toDateString()}: {event.description}
          </li>
        ))}
      </ul>
    </div>
  );
}