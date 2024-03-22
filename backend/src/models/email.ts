type EmailInfo = {
	address: string;
	subject: string;
	body: string;
};

type EmailResponse = {
	response: string;
	sentEmail?: EmailInfo;
};

export type { EmailInfo, EmailResponse };
