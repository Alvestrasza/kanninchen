// Meta
// Version: 0.1.1
// Created: 2026-06-08
// Updated: 2026-06-08
// Purpose: Shared type definitions for Kaninchen Quest rabbit data and UI.

export type RabbitTaskFrequency = "daily" | "weekly" | "monthly" | "asNeeded";

export type RabbitTask = {
  id: string;
  icon: string;
  title: string;
  type: string;
  frequency: RabbitTaskFrequency;
  description: string;
  weekly?: string;
  subtasks: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
};

export type RabbitMetric = {
  icon: string;
  label: string;
  value: number;
};

export type Achievement = {
  icon: string;
  title: string;
  description: string;
};