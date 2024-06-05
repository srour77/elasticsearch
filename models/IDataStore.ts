import { MailBox, Message, User } from "../types/types";

interface IDataStore {
    createUser(user: User): Promise<void>;
    getUserById(userId: string): Promise<Pick<User, 'id'>>;
    userExists(userId: string): Promise<boolean>;
    accountExists(subId: string): Promise<boolean>;
    syncUserMessages(userId: string, platform: string, data: Message[]): Promise<void>;
    syncUserMailbox(userId: string, platform: string, data: MailBox): Promise<void>;
}

export default IDataStore