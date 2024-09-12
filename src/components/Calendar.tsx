import React from 'react';

interface CalendarProps {
  events: { date: Date; description: string }[];
}

export default function Calendar({ events }: CalendarProps) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-2">Calendar Events</h2>
      {events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <ul className="space-y-2">
          {events.map((event, index) => (
            <li key={index} className="border-b pb-2 last:border-b-0">
              <span className="font-semibold">{event.date.toDateString()}: </span>
              {event.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}