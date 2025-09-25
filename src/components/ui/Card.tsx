import React from 'react';
import { CalendarSVG } from '../icons';

interface CardProps {
  icon?: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function Card({
  icon = <CalendarSVG size={64} />,
  title = "20",
  subtitle = "Events completed",
}: CardProps) {
  return (
    <div className="flex justify-start items-center border border-gray-500 rounded-xl gap-4 p-4 pr-[clamp(1rem,5vw,12rem)] w-full max-w-[300px]">
      <div className="shrink-0">{icon}</div>
      <div className="text-xl">
        <div>{title}</div>
        <div>{subtitle}</div>
      </div>
    </div>
  );
}