interface EmailInfo {
  address: string;
  subject: string;
  content: string;
}

interface EmailResponse {
  response: string;
  sentEmail?: EmailInfo;
  wonLevel: boolean;
}

export type { EmailInfo, EmailResponse };
