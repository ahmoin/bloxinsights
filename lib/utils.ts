import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const FILE_SIZE_UNITS = ["B", "KB", "MB", "GB", "TB"] as const;
const ONE_KILOBYTE = 1024;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let start = 0; start < items.length; start += size) {
    chunks.push(items.slice(start, start + size));
  }
  return chunks;
}

export function formatFileSize(bytes: number): string {
  let value = bytes;
  let unitIndex = 0;
  while (value >= ONE_KILOBYTE && unitIndex < FILE_SIZE_UNITS.length - 1) {
    value /= ONE_KILOBYTE;
    unitIndex += 1;
  }
  const rounded = unitIndex === 0 ? Math.round(value) : value.toFixed(1);
  return `${rounded} ${FILE_SIZE_UNITS[unitIndex]}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
