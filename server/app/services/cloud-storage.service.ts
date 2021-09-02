import { Bucket, DeleteFileResponse, File, FileExistsResponse, Storage } from '@google-cloud/storage';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { CLOUD_CONSTANT } from '../res/environement';
import Types from '../types';
import { TimestampLogService } from './timestamp-log.service';

/// Service permettant les interactions avec le cloud storage
@injectable()
export class CloudStorageService {

    private storage: Storage;
    private bucket: Bucket;

    constructor(@inject(Types.TimestampLogService) private console: TimestampLogService, ) {
        this.storage = new Storage({
            projectId: CLOUD_CONSTANT.CLOUD_PROJECT_ID,
            keyFilename: CLOUD_CONSTANT.CLOUD_API_KEY_FILE_LOCATION,
        });
        this.bucket = this.storage.bucket(CLOUD_CONSTANT.CLOUD_BUCKET_URL);
    }

    async deleteFile(fileName: string): Promise<DeleteFileResponse> {
        this.console.log(`Deleting ${TimestampLogService.BLUE}${fileName}${TimestampLogService.WHITE} on cloud storage...`);
        const fileLink: File = this.bucket.file(fileName);
        return fileLink.delete();
    }

    async fileExist(fileName: string): Promise<FileExistsResponse> {
        this.console.log(`Verifying if ${TimestampLogService.BLUE}${fileName}${TimestampLogService.WHITE} exist on cloud storage...`);
        const fileLink: File = this.bucket.file(fileName);
        return fileLink.exists();
    }

    async uploadFile(file: any): Promise<[string, string]> {
        return new Promise<[string, string]>((res, reject) => {
            if (!file) {
                reject('No image file');
                return;
            }
            const newFileName = `${file.fieldname}-${Date.now()}.svg`;

            const fileUpload = this.bucket.file(newFileName);

            const blobStream = fileUpload.createWriteStream({
                metadata: {
                    contentType: file.mimetype,
                },
            });

            blobStream.on('error', (error) => {
                this.console.log(`Uploading ${TimestampLogService.RED}${newFileName}${TimestampLogService.WHITE} has failed...`);
                reject('Something is wrong! Unable to upload at the moment.');
            });

            blobStream.on('finish', () => {
                // The public URL can be used to directly access the file via HTTP.
                const url = `https://storage.googleapis.com/${this.bucket.name}/${fileUpload.name}`;
                fileUpload.makePublic().then(() => {
                    this.console.log(`${TimestampLogService.GREEN}${newFileName}${TimestampLogService.WHITE} is now on cloud storage...`);
                    res([url, newFileName]);
                });
            });
            blobStream.end(file.buffer);

        });
    }
}
