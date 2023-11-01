interface EmailInfo {
  address: string;
  subject: string;
  body: string;
}

interface EmailResponse {
  response: string;
  sentEmail?: EmailInfo;
  wonLevel: boolean;
}

export type { EmailInfo, EmailResponse };
