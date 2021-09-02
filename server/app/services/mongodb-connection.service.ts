import { injectable } from 'inversify';
import { Db, MongoClient } from 'mongodb';
import 'reflect-metadata';
import { DATABASE_NAME, MONGODB_URL } from '../res/environement';

/// Factory de connection vers la base de donnée mongodb
@injectable()
export class MongoDbConnectionService {
    private mongoClient: MongoClient | undefined;

    constructor(private databaseName = DATABASE_NAME) {
        this.openConnectionWithMongoServer();
    }

    /// Retourne une connection vers l'instance monngoDb
    getMongoClient(): MongoClient {
        if (!this.mongoClient) {
            throw Error('No mongo client connection...');
        } else {
            return this.mongoClient;
        }
    }

    /// Retourne la base de donne par default pour l'instance de mongoDB
    getMongoDatabase(): Db {
        return this.getMongoClient().db(this.databaseName);
    }

    /// Ouvrir la connection avec le serveur de base de données MongoDB
    async openConnectionWithMongoServer(): Promise<void> {
        this.mongoClient = await MongoClient.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    }

    /// Fermer la connection avec le serveur de base de données MongoDB
    async closeConnectionWithMongoServer(): Promise<void> {
        if (this.mongoClient) {
            await this.mongoClient.close();
            this.mongoClient = undefined;
            return;
        }
        return;
    }
}
