interface EmailInfo {
  address: string;
  subject: string;
  content: string;
}

interface EmailResponse {
  response: string;
  wonPhase: boolean;
}

export type { EmailInfo, EmailResponse };
