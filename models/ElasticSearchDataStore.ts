import { LinkedAccount, MailBox, Message, User } from "../types/models"
import IDataStore from "./IDataStore"
import { Client } from '@elastic/elasticsearch'

class ElasticSearchDataStore implements IDataStore {
    private client: Client

    constructor() {
        this.client = new Client({ node: process.env.ELASTIC_URL })
        this.client.indices.delete({index: 'users'}).then((response) => {console.log('index deleted')})
        this.client.indices.exists({index: 'users'}).then((response) => {
            if(!response) {
                this.client.indices.create({
                    index: 'users',
                    body: {
                        mappings: {
                        properties: {
                            id: { type: 'text' },
                            userName: { type: 'text' },
                            linkedAccounts: {
                            type: 'nested',
                            properties: {
                                subId: { type: 'keyword' },
                                platform: { type: 'keyword' },
                                secret: { type: 'text' },
                                address: { type: 'text' },
                                messages: {
                                type: 'nested',
                                properties: {
                                    from: { type: 'keyword' },
                                    to: { type: 'keyword' },
                                    subject: { type: 'text' },
                                    time: { type: 'date' }
                                }
                                },
                                mailbox: {
                                properties: {
                                    folders: { type: 'keyword' },
                                    quota: { type: 'object' }
                                }
                                }
                            }
                            }
                        }
                        }
                    }
                }).then((data) => console.log('index created'))
            }
        })
    }

    async createUser(user: Pick<User, 'id' | 'userName'>): Promise<void> {
        await this.client.index({ index: 'users', document: user })
    }

    async getUserById(userId: string): Promise<Pick<User, 'id'>> {
        const response = await this.client.search({ index: 'users', body: { query: { match: { id: userId } } } })
        const user = response?.hits?.hits?.[0]?._source as Pick<User, 'id'>
        return user
    }

    async getUserByUserName(userName: string): Promise<Pick<User, 'id' | 'userName'>> {
        const response = await this.client.search({index: 'users', body: {query: {match: { userName }}}})
        const user = response?.hits?.hits?.[0]?._source as Pick<User, 'id' | 'userName'>
        return user
    }

    async userExists(userId: string): Promise<boolean> {
        const response = await this.client.count({ index: 'users', body: { query: { match: { id: userId } } } })
        
        return response.count == 0 ? false : true
    }

    async accountExists(subId: string): Promise<boolean> {
        const response = await this.client.count({index: 'users',body: {query: {nested: {path: 'linkedAccounts',query: {bool: {must: [{match: {'linkedAccounts.subId': subId}}]}}}}}})
        
        return response.count == 0 ? false : true
    }

    async updateLinkedAccount(userName: string, linkedAccount: Pick<LinkedAccount, 'platform' | 'accessToken' | 'emailAddress' | 'subId'>): Promise<void> {
        const updateQuery = {
            script: {
                source: `
                    if (ctx._source.linkedAccounts == null) {
                        ctx._source.linkedAccounts = [params.linkedAccount];
                    } else {
                        def accountIndex = -1;
                        for (int i = 0; i < ctx._source.linkedAccounts.size(); i++) {
                            if (ctx._source.linkedAccounts[i].subId == params.linkedAccount.subId) {
                                accountIndex = i;
                                break;
                            }
                        }
                        if (accountIndex >= 0) {
                            ctx._source.linkedAccounts[accountIndex] = params.linkedAccount;
                        } else {
                            ctx._source.linkedAccounts.add(params.linkedAccount);
                        }
                    }
                `,lang: 'painless',params: {linkedAccount: linkedAccount}
            }, query: {match: {userName: userName}}
        };

        await this.client.updateByQuery({index: 'users', body: updateQuery});
    }

    async syncUserMessages(userId: string, platform: string, data: Message[]): Promise<void> {
        const script = {
            source: `
                for (int i = 0; i < ctx._source.linkedAccounts.length; i++) {
                    if (ctx._source.linkedAccounts[i].platform == params.platform) {
                        ctx._source.linkedAccounts[i].messages = params.messages;
                    }
                }`,
            params: { platform, messages: data }
          }
      
        await this.client.update({ index: 'users', id: userId, body: { script } })
    }

    async syncUserMailbox(userId: string, platform: string, data: MailBox): Promise<void> {
        const script = {
            source: `
                for (int i = 0; i < ctx._source.linkedAccounts.length; i++) {
                    if (ctx._source.linkedAccounts[i].platform == params.platform) {
                        ctx._source.linkedAccounts[i].mailbox = params.mailbox;
                    }
                }`,
            params: { platform, mailbox: data }
          }
      
        await this.client.update({ index: 'users', id: userId, body: { script } })
    }
}

export default ElasticSearchDataStore