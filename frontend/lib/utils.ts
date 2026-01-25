import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { AUTH_URL } from "./config"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  if (path.startsWith('data:')) return path;

  // Clean the path and ensure it's absolute from the root
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // List of paths that should definitely be served from the API Gateway
  if (cleanPath.startsWith('/uploads/') || cleanPath.startsWith('/api/')) {
    return `${AUTH_URL}${cleanPath}`;
  }

  // Default fallback for any other relative path
  return `${AUTH_URL}${cleanPath}`;
}
