"use client";

import React from "react";
import Link from "next/link";
import { Calendar, Clock, Video } from "lucide-react"; // example icons

interface MeetingCardProps {
  id: string;
  title: string;
  date?: string;
  type: "ended" | "upcoming" | "recordings";
  icon: string;
  link: string;
}

const MeetingCard: React.FC<MeetingCardProps> = ({
  id,
  title,
  date,
  type,
  icon,
  link,
}) => {
  return (
    <Link href={link}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition duration-200 cursor-pointer">
        <div className="flex items-center space-x-3">
          <img src={icon} alt={${type} icon} className="w-8 h-8" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title || "Untitled Meeting"}
          </h3>
        </div>

        {date && (
          <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center mt-2">
            <Clock className="mr-1 w-4 h-4" />
            {new Date(date).toLocaleString()}
          </p>
        )}

        <div className="flex items-center justify-between mt-3">
          <span className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
            {type}
          </span>

          {type === "ended" && (
            <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
              Replay
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default MeetingCard;