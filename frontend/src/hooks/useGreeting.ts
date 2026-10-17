import { useState } from "react";
import {
  crisisGreeting,
  getDayPart,
  getGreetingPool,
  type Greeting,
  type Lang,
} from "../constants/greetings";

const LAST_KEY = "aidvocate:lastGreeting";

const readLast = (): string | null => {
  try {
    return localStorage.getItem(LAST_KEY);
  } catch {
    return null;
  }
};

const writeLast = (value: string) => {
  try {
    localStorage.setItem(LAST_KEY, value);
  } catch {
    // storage blocked: repeats are acceptable
  }
};

// Picks one greeting per visit and avoids repeating the previous visit's greeting.
// The index is stable across language switches so toggling doesn't reshuffle.
export const useGreeting = (lang: Lang, isCrisis: boolean): Greeting => {
  const [pick] = useState(() => {
    const dayPart = getDayPart();
    const size = getGreetingPool("ceb", dayPart).length;
    const last = readLast();
    let index = Math.floor(Math.random() * size);
    if (size > 1 && String(index) === last) index = (index + 1) % size;
    writeLast(String(index));
    return { dayPart, index };
  });

  if (isCrisis) return crisisGreeting[lang];

  const pool = getGreetingPool(lang, pick.dayPart);
  return pool[pick.index % pool.length];
};
