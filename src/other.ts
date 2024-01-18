import {
  setData
} from './dataStore';

import { DataStoreInterface } from './types';
import fs from 'fs';
import path from 'path';

export const csvResultsPath = './src/public/csvResults/';

const timeouts: { [key: number]: boolean } = {};

// Function to set a new timeout
export function setNewTimeout(callback: () => void, delay: number): number {
  const timeoutId = setTimeout(callback, delay) as unknown as number; // Cast to number for indexing
  timeouts[timeoutId] = true;
  return timeoutId;
}

// Function to clear all timeouts
function clearAllTimeouts(): void {
  for (const timeoutId in timeouts) {
    if (Object.prototype.hasOwnProperty.call(timeouts, timeoutId)) {
      clearTimeout(Number(timeoutId));
      delete timeouts[timeoutId];
    }
  }
}

/**
 * @description Reset the state of the application back to the start.
 *
 * @returns {} Empty Parameter
 */
export function clear() {
  const clearedData: DataStoreInterface = {
    users: [],
    quizzes: [],
    trash: [],
    userSessions: [],
    quizSessions: [],
    maxId: 0
  };

  clearAllTimeouts();

  fs.readdir(csvResultsPath, (err, files) => {
    for (const file of files) {
      if (file === '.gitkeep') continue;
      fs.unlink(path.join(csvResultsPath, file), (err) => {
        console.log(err);
      });
    }
  });

  setData(clearedData);
  return {};
}
