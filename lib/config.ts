const adminEmailsRaw = process.env.NEXT_PUBLIC_ADMIN_EMAILS || '';

export const adminEmails = adminEmailsRaw
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

