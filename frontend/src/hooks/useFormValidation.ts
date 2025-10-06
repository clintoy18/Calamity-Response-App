export const isEmailValid = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isPasswordValid = (password: string) => password.length >= 6;

export const isPhoneValid = (phone: string) =>
  /^09\d{9}$/.test(phone);

export const isFileValid = (file: File | null, types: string[] = ["application/pdf", "image/jpeg", "image/png"]) =>
  file && types.includes(file.type);
