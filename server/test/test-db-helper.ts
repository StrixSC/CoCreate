import { Db, MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';

export class TestDbHelper {

    db: Db | null;
    server: MongoMemoryServer;
    connection: MongoClient | null;

    constructor() {
        this.db = null;
        this.server = new MongoMemoryServer();
        this.connection = null;
    }

    /**
     * Start the server and establish a connection
     */
    async start() {
        const url = await this.server.getConnectionString();
        this.connection = await MongoClient.connect(
            url,
            { useNewUrlParser: true, useUnifiedTopology: true },
        );
        this.db = this.connection.db(await this.server.getDbName());
    }

    /**
     * Close the connection and stop the server
     */
    async stop() {
        await (this.connection as MongoClient).close();
        return this.server.stop();
    }

    /**
     * Delete all collections and indexes
     */
    async cleanup() {
        const collections = await (this.db as Db).listCollections().toArray();
        return Promise.all(
            collections
                .map(({ name }) => name)
                .map((collection) => (this.db as Db).collection(collection).drop())
        );
    }

    async createDoc(collectionName: string, document: any) {
        const { ops } = await (this.db as Db)
            .collection(collectionName)
            .insertOne(document);
        return ops[0];
    }

    async deleteDoc(collectionName: string, document: any) {
        const res = await (this.db as Db)
            .collection(collectionName)
            .deleteOne(document);
        return res;
    }
}