export type User = {
    id: string;
    userName: string;
    linkedAccounts: LinkedAccount[];
}
  
export type LinkedAccount = {
    subId: string;
    platform: string;
    accessToken: string;
    emailAddress: string;
    messages: Message[];
    mailbox: MailBox;
}

export type Message = {
    from: string;
    to: string;
    subject: string;
    time: Date;
}

export type MailBox = {
    folders: string[];
    quota: Record<string, any>;
}