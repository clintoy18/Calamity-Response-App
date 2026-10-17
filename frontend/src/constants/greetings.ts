export type Lang = "ceb" | "en";
export type DayPart = "morning" | "afternoon" | "evening" | "night";

export interface Greeting {
  hello: string;
  ask: string;
}

type Pool = Record<Lang, Greeting[]>;

// Any time of day, normal mode
const anytime: Pool = {
  ceb: [
    { hello: "Musta bai?", ask: "Unsay matabang nako nimo karon?" },
    { hello: "Oy, unsay balita?", ask: "Naa ba koy ikatabang?" },
    { hello: "Kumusta ka?", ask: "Unsa may atong buhaton karon?" },
  ],
  en: [
    { hello: "Hey, how are you?", ask: "What can I help you with today?" },
    { hello: "What's up?", ask: "Anything I can help with?" },
  ],
};

const byDayPart: Record<DayPart, Pool> = {
  morning: {
    ceb: [{ hello: "Maayong buntag!", ask: "Unsay ato karon?" }],
    en: [{ hello: "Good morning!", ask: "What's the plan today?" }],
  },
  afternoon: {
    ceb: [{ hello: "Maayong hapon!", ask: "Kumusta ang adlaw?" }],
    en: [{ hello: "Good afternoon!", ask: "How's the day going?" }],
  },
  evening: {
    ceb: [{ hello: "Maayong gabii!", ask: "Naa pa bay kinahanglan nimo?" }],
    en: [{ hello: "Good evening!", ask: "Need anything else today?" }],
  },
  night: {
    ceb: [{ hello: "Gabii na, bai.", ask: "Naa ba kay kinahanglan karon?" }],
    en: [{ hello: "It's late.", ask: "Do you need anything right now?" }],
  },
};

// Crisis mode: no jokes, one clear question
export const crisisGreeting: Record<Lang, Greeting> = {
  ceb: { hello: "Amping mo tanan.", ask: "Nanginahanglan ka ba og tabang karon?" },
  en: { hello: "Stay safe.", ask: "Do you need help right now?" },
};

export const getDayPart = (date = new Date()): DayPart => {
  const h = date.getHours();
  if (h >= 4 && h < 12) return "morning";
  if (h >= 12 && h < 18) return "afternoon";
  if (h >= 18 && h < 22) return "evening";
  return "night";
};

export const getGreetingPool = (lang: Lang, dayPart: DayPart): Greeting[] => [
  ...anytime[lang],
  ...byDayPart[dayPart][lang],
];

// UI strings for the home screen
export const homeCopy = {
  ceb: {
    needHelp: "Mangayo og tabang",
    needHelpSub: "Ipadala ang imong lokasyon ug kinahanglan",
    map: "Tan-awa ang mapa",
    report: "Mag-report og ashfall",
    water: "Naa bay tubig?",
    advisories: "Mga abiso",
    soon: "Hapit na",
    nearby: "Sa imong lugar",
    nearbyEmpty: "Walay bag-ong report karon. Maayo kana.",
    retry: "Sulayi pag-usab",
    loadError: "Wala ma-load ang mga report.",
    heatTitle: "Init karon",
    heatEstimated: "Gibanabana gikan sa Open-Meteo",
    heatError: "Wala ma-load ang heat index.",
    feels: "Pamati sa lawas",
    activeAdvisory: "Aktibo nga abiso",
    source: "Gikan sa",
    openAdvisory: "Basaha",
    requests: "mga hangyo sa tabang",
    responded: "natabangan na",
    ashfallReport: "Ashfall report",
    helpRequest: "Hangyo sa tabang",
    verified: "Napamatud-an",
  },
  en: {
    needHelp: "Request help",
    needHelpSub: "Send your location and what you need",
    map: "Open the map",
    report: "Report ashfall",
    water: "Is there water?",
    advisories: "Advisories",
    soon: "Soon",
    nearby: "Around you",
    nearbyEmpty: "No new reports right now. That's good news.",
    retry: "Try again",
    loadError: "Couldn't load reports.",
    heatTitle: "Heat right now",
    heatEstimated: "Estimated from Open-Meteo",
    heatError: "Couldn't load the heat index.",
    feels: "Feels like",
    activeAdvisory: "Active advisory",
    source: "Source",
    openAdvisory: "Read",
    requests: "help requests",
    responded: "responded",
    ashfallReport: "Ashfall report",
    helpRequest: "Help request",
    verified: "Verified",
  },
} as const;

export type HomeCopy = (typeof homeCopy)[Lang];
