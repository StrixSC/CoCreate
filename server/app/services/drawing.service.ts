import { inject, injectable } from 'inversify';
import { Collection, Db } from 'mongodb';
import 'reflect-metadata';
import { Drawing, Tag } from '../../../common/communication/drawing';
import { DRAWING_COLLECTION } from '../res/environement';
import Types from '../types';
import { CloudStorageService } from './cloud-storage.service';
import { MongoDbConnectionService } from './mongodb-connection.service';
import { TagService } from './tag.service';
import { TimestampLogService } from './timestamp-log.service';

/// Service pour offrir l'interaction avec la base de donnée de dessins
@injectable()
export class DrawingService {

    constructor(
        @inject(Types.MongoDbConnectionService) private mongoDbConnection: MongoDbConnectionService,
        @inject(Types.TagService) private tagService: TagService,
        @inject(Types.CloudStorageService) private cloudStorage: CloudStorageService,
        @inject(Types.TimestampLogService) private console: TimestampLogService,
    ) {
    }

    get drawingCollection(): Collection<Drawing> {
        const db: Db = this.mongoDbConnection.getMongoDatabase();
        return db.collection(DRAWING_COLLECTION);
    }

    /// Retourne un seul dessin de la base de donnée
    async getOneDrawing(fileName: string): Promise<Drawing | null> {
        this.console.log(`Looking for drawing with fileName : ${fileName}`);
        return this.drawingCollection.findOne({ fileName: { $eq: fileName } });
    }

    /// Retourne tous les dessins sur la base de donnée de mongodb
    async getAllDrawings(): Promise<Drawing[]> {
        this.console.log('Retrieving all the drawings...');
        return this.drawingCollection.find().toArray().then(async (arr) => {
            const resultArray: Drawing[] = [];
            for (const drawing of arr) {
                const fileExist = await this.cloudStorage.fileExist(drawing.fileName);
                if (fileExist[0]) {
                    this.console.log(`${TimestampLogService.GREEN}${drawing.path}${TimestampLogService.WHITE} will be sent`);
                    resultArray.push(drawing);
                } else {
                    this.console.log(
                        `Drawing ${TimestampLogService.RED}${drawing.fileName}${TimestampLogService.WHITE} doesnt exist in cloud`);
                }
            }
            return resultArray;
        });
    }

    /// Suprimer un dessin et tous les tags qui ne sont plus utilisés
    async deleteDrawing(fileName: string): Promise<void> {
        this.console.log(`Deleting : ${TimestampLogService.BLUE}${fileName}${TimestampLogService.WHITE}`);
        return new Promise<void>(async (resolve, rej) => {
            await this.cloudStorage.deleteFile(fileName).catch((err) => {
                rej(err);
            });
            const tagCollection: Collection<Tag> = this.tagService.tagCollection;
            const drawingsCollection: Collection<Drawing> = this.drawingCollection;
            const drawing = await drawingsCollection.findOne({ fileName: { $eq: fileName } });
            if (drawing) {
                for (const tag of drawing.tags) {
                    this.console.log(`Verifying tag with name : ${TimestampLogService.BLUE}${tag}${TimestampLogService.WHITE}`);
                    const databaseTag: Tag | null = await tagCollection.findOne<Tag>({ name: { $eq: tag } });
                    if (databaseTag) {
                        this.console.log(`${TimestampLogService.BLUE}${databaseTag.name}${TimestampLogService.WHITE} exist`);
                        try {
                            tagCollection.updateOne({ name: { $eq: tag } }, { $inc: { numberOfUses: -1 } });
                            this.console.log(
                                `Tag ${TimestampLogService.GREEN}${tag}${TimestampLogService.WHITE} has been decremented`);

                        } catch (error) {
                            this.console.log(`Updating error ${TimestampLogService.RED}${tag}${TimestampLogService.WHITE}`);
                            rej(error);
                            return;
                        }
                    } else {
                        this.console.log(tag + ' does not exist in the database');
                    }
                    this.console.log('Verifying tag with 0 uses ...');
                    await tagCollection.find({ numberOfUses: { $lte: 0 } }).forEach((zeroUsesTag) => {
                        try {
                            tagCollection.findOneAndDelete(zeroUsesTag);
                            this.console.log(`Tag ${TimestampLogService.GREEN}${zeroUsesTag.name}${TimestampLogService.WHITE} deleted`);
                        } catch (error) {
                            this.console.log(`${TimestampLogService.RED}Deleting error :${error.message}${TimestampLogService.WHITE}`);
                        }
                    });
                    this.console.log('End of tag verification');
                }
                this.console.log(`Deleting drawing ${TimestampLogService.BLUE}${drawing.name}${TimestampLogService.WHITE}`);
                try {
                    drawingsCollection.deleteOne({ fileName: { $eq: drawing.fileName } });
                    this.console.log(`Drawing ${TimestampLogService.GREEN}${drawing.name}${TimestampLogService.WHITE} deleted`);
                } catch (error) {
                    this.console.log(`${TimestampLogService.RED}Deleting error : ${error.message}${TimestampLogService.WHITE}`);
                    rej(error);
                    return;
                }
            } else {
                this.console.log(`${TimestampLogService.RED}Drawing cant be find${TimestampLogService.WHITE}`);
                rej('Drawing cant be find');
                return;
            }
            resolve();
        });

    }

    /// Ajoute un drawing dans la base de donnée et ajuste les tag en conséquence
    async setDrawing(tags: string[], name: string, file: Express.Multer.File): Promise<void> {
        return new Promise<void>(async (res, rej) => {
            this.console.log(`Saving : ${TimestampLogService.BLUE}${name}${TimestampLogService.WHITE}`);
            let uploadResult = ['', ''];
            try {
                uploadResult = await this.cloudStorage.uploadFile(file);
            } catch (error) {
                rej(error);
                return;
            }
            const filePath: string = uploadResult[0];
            const fileName: string = uploadResult[1];
            const tagCollection: Collection<Tag> = this.tagService.tagCollection;
            for (const tag of tags) {
                this.console.log(`Verifying tag with name : ${TimestampLogService.BLUE}${tag}${TimestampLogService.WHITE}`);
                const databaseTag: Tag | null = await tagCollection.findOne<Tag>({ name: { $eq: tag } });
                if (databaseTag) {
                    this.console.log(`${TimestampLogService.GREEN}${databaseTag.name}${TimestampLogService.WHITE} exist`);
                    try {
                        tagCollection.updateOne({ name: { $eq: tag } }, { $inc: { numberOfUses: 1 } });
                        this.console.log(`Tag ${TimestampLogService.GREEN}${tag}${TimestampLogService.WHITE} has been incremented`);
                    } catch (error) {
                        this.console.log(`${TimestampLogService.RED}${tag}${TimestampLogService.WHITE}`);
                        rej(error);
                        return;
                    }
                } else {
                    this.console.log(TimestampLogService.YELLOW + tag + ' does not exist in the database' + TimestampLogService.WHITE);
                    const newTag: Tag = { name: tag, numberOfUses: 1 };
                    this.console.log(`Initialising ${TimestampLogService.BLUE}${tag}${TimestampLogService.WHITE} in the database`);
                    try {
                        tagCollection.insertOne(newTag);
                        this.console.log(`Tag ${TimestampLogService.GREEN}${tag}${TimestampLogService.WHITE} is now in the database`);
                    } catch (error) {
                        this.console.log(`${TimestampLogService.RED}Inserting error : ${newTag.name}${TimestampLogService.WHITE}`);
                        rej(error);
                        return;
                    }
                }
            }
            this.console.log(`Inserting the drawing : ${TimestampLogService.BLUE}${name}${TimestampLogService.WHITE}`);
            const valueToInsert: Drawing = { name, createdAt: new Date(), path: filePath, tags, fileName };
            try {
                this.drawingCollection.insertOne(valueToInsert);
                this.console.log(
                    `Drawing id ${TimestampLogService.GREEN}${(valueToInsert as any)._id}${TimestampLogService.WHITE} inserted`);
                res();
            } catch (error) {
                this.console.log(`${TimestampLogService.RED}Inserting error : ${name}${TimestampLogService.WHITE}`);
                rej(error);
                return;
            }
        });

    }
}
