interface EmailInfo {
  address: string;
  subject: string;
  content: string;
}

interface EmailResponse {
  response: string;
  sentEmail?: EmailInfo;
  wonPhase: boolean;
}

export type { EmailInfo, EmailResponse };
