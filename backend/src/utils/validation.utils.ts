/**
 * Validation utilities for bot inputs
 */

/**
 * Validate name input
 */
export function validateName(name: string): { valid: boolean; cleaned?: string; error?: string } {
  const trimmed = name.trim().replace(/\s+/g, " ");

  // Minimum length
  if (trimmed.length < 4) {
    return { valid: false, error: "Please enter your full name (at least 4 characters)." };
  }

  // Must contain at least 2 words (First + Last)
  const parts = trimmed.split(" ");
  if (parts.length < 2) {
    return { valid: false, error: "Please enter your full name (first and last name)." };
  }

  // Each part must be >= 2 letters
  if (parts.some(p => p.length < 2)) {
    return { valid: false, error: "Each name part must have at least 2 characters." };
  }

  // Allowed characters: letters, spaces, hyphens, apostrophes
  if (!/^[A-Za-z\s\-']+$/.test(trimmed)) {
    return { valid: false, error: "Names must contain letters only (no numbers or symbols)." };
  }

  // Require vowels to prevent random typing
  if (!/[aeiouAEIOU]/.test(trimmed)) {
    return { valid: false, error: "Please enter a valid full name." };
  }

  // Reject dummy/fake patterns
  const dummyPatterns = [
    /^test/i, /^dummy/i, /^fake/i, /^sample/i, /^[a-z]{4,}$/i, /^qwerty/i, /^asdf/i,
    /^xxx+$/i, /^aaa+$/i, /^no name$/i
  ];
  if (dummyPatterns.some(p => p.test(trimmed))) {
    return { valid: false, error: "Please enter your real full name to assist you properly." };
  }

  // Auto proper-case (Juan Dela Cruz -> Juan Dela Cruz)
  const cleaned = trimmed
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return { valid: true, cleaned };
}


/**
 * Validate location input
 */
export function validateLocation(location: string): { valid: boolean; cleaned?: string; error?: string } {
  const trimmed = location.trim();

  // Too short
  if (trimmed.length < 3) {
    return { valid: false, error: "Please provide a more specific location (Barangay, City, Province)." };
  }

  // Numbers only
  if (/^\d+$/.test(trimmed)) {
    return { valid: false, error: "Location cannot be only numbers. Include place names." };
  }

  // Emoji or symbol spam
  if (/^[^a-zA-Z0-9]+$/.test(trimmed)) {
    return { valid: false, error: "Please enter a readable location." };
  }

  // Reject random keyboard smash (letters but no vowels)
  if (!/[a-zA-Z]/.test(trimmed) || (/^[a-zA-Z]{3,}$/.test(trimmed) && !/[aeiouAEIOU]/.test(trimmed))) {
    return { valid: false, error: "That doesn't look like a real location. Please use valid words." };
  }

  // Require at least two meaningful parts
  const parts = trimmed.split(/[, ]+/).filter(p => p.length > 2);
  if (parts.length < 2) {
    return { 
      valid: false, 
      error: "Include more details like Barangay and City (e.g., Brgy San Roque, Cebu City)."
    };
  }

  // Reject placeholders / dummy text
  const dummyPatterns = [
    /^test$/i, /^dummy$/i, /^asdf/i, /^qwerty/i, /^xxx+$/i, /^aaa+$/i,
    /^none$/i, /^here$/i, /^there$/i, /^unknown$/i, /^na$/i, /^wala$/i
  ];
  if (dummyPatterns.some(p => p.test(trimmed))) {
    return { valid: false, error: "Please provide your actual location." };
  }

  // Normalize PH-style place terms
  let cleaned = trimmed
    .replace(/\bbrgy\b/gi, "Barangay")
    .replace(/\bbrg\b/gi, "Barangay")
    .replace(/\bbarangy\b/gi, "Barangay")
    .replace(/\bsitio\b/gi, "Sitio")
    .replace(/\bph\b/gi, "Philippines");

  // Auto-add Philippines if missing
  if (!/philippines/i.test(cleaned)) {
    cleaned += ", Philippines";
  }

  return { valid: true, cleaned };
}



/**
 * Validate contact number
 */
export function validateContactNumber(contact: string): { valid: boolean; error?: string } {
  const trimmed = contact.trim();

  // Reject letters
  if (/[a-zA-Z]/.test(trimmed)) {
    return { valid: false, error: "Phone numbers must contain digits only." };
  }

  // Normalize by removing spaces & symbols
  const normalized = trimmed.replace(/[\s\-().]/g, '');

  // Philippine number patterns
  const phPatterns = [
    /^09\d{9}$/,     // 09171234567
    /^(\+639)\d{9}$/, // +639171234567
    /^639\d{9}$/     // 639171234567
  ];

  const isValidPH = phPatterns.some(pattern => pattern.test(normalized));

  if (!isValidPH) {
    return { 
      valid: false, 
      error: "Please enter a valid Philippine number (e.g., 09171234567 or +639171234567)." 
    };
  }

  // Reject fake sequences
  const digitsOnly = normalized.replace(/\D/g, '');

  const fakePatterns = [
    /^0+$/, /^1+$/, /^9+$/, /^123+$/, /^111+$/, /^999+$/, /^000+$/
  ];

  if (fakePatterns.some(p => p.test(digitsOnly))) {
    return {
      valid: false,
      error: "Please enter a real contact number we can reach."
    };
  }

  return { valid: true };
}


/**
 * Validate people count
 */
export function validatePeopleCount(input: string): { valid: boolean; value?: number; error?: string } {
  const trimmed = input.trim();
  const count = parseInt(trimmed);

  if (isNaN(count)) {
    return { valid: false, error: "Please enter a valid number." };
  }

  if (count <= 0) {
    return { valid: false, error: "Please enter a number greater than 0." };
  }

  if (count > 10000) {
    return { 
      valid: false, 
      error: "That's a very large number. If you have a mass casualty event, please call emergency services immediately at 911." 
    };
  }

  return { valid: true, value: count };
}

/**
 * Validate needs input
 */
export function validateNeeds(input: string): { valid: boolean; needs?: string[]; error?: string } {
  const trimmed = input.trim();

  if (trimmed.length < 2) {
    return { 
      valid: false, 
      error: "Please describe what help you need (e.g., food, water, medical, shelter)." 
    };
  }

  const needs = trimmed
    .split(",")
    .map((need) => need.trim())
    .filter((need) => need.length > 0);

  if (needs.length === 0) {
    return { 
      valid: false, 
      error: "Please list at least one type of assistance you need." 
    };
  }

  // Check for dummy inputs
  const dummyPatterns = [
    /^test$/i,
    /^dummy$/i,
    /^fake$/i,
    /^asdf/i,
    /^qwerty/i,
    /^123+$/,
    /^aaa+$/i,
    /^xxx+$/i,
    /^none$/i,
    /^nothing$/i,
  ];

  const hasDummyInput = needs.some(need => 
    dummyPatterns.some(pattern => pattern.test(need))
  );

  if (hasDummyInput) {
    return { 
      valid: false, 
      error: "Please provide real information about what help you need. This ensures appropriate assistance is provided." 
    };
  }

  // Filter out very short or invalid entries
  const validNeeds = needs.filter(need => need.length >= 2);

  if (validNeeds.length === 0) {
    return { 
      valid: false, 
      error: "Please provide specific needs (e.g., food, water, medical supplies)." 
    };
  }

  return { valid: true, needs: validNeeds };
}

/**
 * Validate additional notes
 */
export function validateNotes(notes: string): { valid: boolean; error?: string } {
  const trimmed = notes.trim();

  if (trimmed.length > 1000) {
    return { 
      valid: false, 
      error: "Your message is too long. Please keep it under 1000 characters." 
    };
  }

  // Allow empty notes (optional field)
  if (trimmed.length === 0) {
    return { valid: true };
  }

  // Check for very short dummy inputs
  if (trimmed.length < 3) {
    return { 
      valid: false, 
      error: "Please provide more details or type 'none' if you have nothing to add." 
    };
  }

  return { valid: true };
}

/**
 * Check if submission looks suspicious
 */
export function checkSuspiciousSubmission(session: {
  contactName?: string;
  placename?: string;
  contactno?: string;
  needs: string[];
  additionalNotes?: string;
}): { suspicious: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // Check for very short inputs across the board
  const allInputs = [
    session.contactName,
    session.placename,
    session.contactno,
    session.additionalNotes,
  ].filter(Boolean);

  const shortInputCount = allInputs.filter(input => input && input.length < 3).length;

  if (shortInputCount >= 2) {
    reasons.push("Multiple very short inputs detected");
  }

  // Check if all text inputs are the same
  const textInputs = [
    session.contactName,
    session.placename,
    session.additionalNotes,
  ].filter(Boolean).map(s => s?.toLowerCase().trim());

  if (textInputs.length >= 2 && textInputs.every(input => input === textInputs[0])) {
    reasons.push("Repeated identical inputs");
  }

  // Check for single character repeated
  const hasSingleCharRepeated = allInputs.some(input => {
    if (!input || input.length < 3) return false;
    const chars = new Set(input.toLowerCase().replace(/\s/g, ''));
    return chars.size === 1;
  });

  if (hasSingleCharRepeated) {
    reasons.push("Single character repeated");
  }

  return {
    suspicious: reasons.length > 0,
    reasons,
  };
}