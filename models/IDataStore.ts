import { MailBox, Message, User } from "../types/models";
import { LinkedAccount } from "../types/models";

interface IDataStore {
  createUser(user: User): Promise<void>;
  getUserById(userId: string): Promise<Pick<User, 'id'>>;
  getUserByUserName(userName: string): Promise<Pick<User, 'id' | 'userName'>>;
  userExists(userId: string): Promise<boolean>;
  updateLinkedAccount(userName: string, linkedAccount: Pick<LinkedAccount, 'platform' | 'accessToken' | 'emailAddress' | 'subId'>): Promise<void>;
  accountExists(subId: string): Promise<boolean>;
  syncUserMessages(userId: string,platform: string,data: Message[]): Promise<void>;
  syncUserMailbox(userId: string,platform: string,data: MailBox): Promise<void>;
}

export default IDataStore;