export type User = {
    id: string;
    linkedAccounts: LinkedAccount[];
}
  
export type LinkedAccount = {
    platform: string;
    secret: string;
    address: string;
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