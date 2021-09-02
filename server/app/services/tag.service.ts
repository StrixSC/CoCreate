import { inject, injectable } from 'inversify';
import { Collection, Db, } from 'mongodb';
import 'reflect-metadata';
import { Tag } from '../../../common/communication/drawing';
import { TAG_COLLECTION } from '../res/environement';
import Types from '../types';
import { MongoDbConnectionService } from './mongodb-connection.service';
import { TimestampLogService } from './timestamp-log.service';

/// Service pour interagir avec les tag dans la base de donnée
@injectable()
export class TagService {

    constructor(
        @inject(Types.MongoDbConnectionService) private mongoDbConnection: MongoDbConnectionService,
        @inject(Types.TimestampLogService) private console: TimestampLogService, ) { }

    get tagCollection(): Collection<Tag> {
        const db: Db = this.mongoDbConnection.getMongoDatabase();
        return db.collection(TAG_COLLECTION);
    }

    /// Retourne tous les tags dans la base de données
    async getAllTags(): Promise<Tag[]> {
        const tags = this.tagCollection;
        this.console.log('Request for all the tags');
        return tags.find().toArray().then((arr) => {
            return arr;
        }).catch((reason) => {
            throw reason;
        });
    }
}
