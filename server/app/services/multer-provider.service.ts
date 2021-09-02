import { injectable } from 'inversify';
import * as multer from 'multer';
import 'reflect-metadata';

const FILE_SIZE_LIMIT = 5 * 1024 * 1024;

/// Classe pour fournir le service d'instance du module multer
@injectable()
export class MulterProviderService {

    readonly upload: multer.Instance;
    constructor() {
        this.upload = multer({
            storage: multer.memoryStorage(),
            limits: {
                fileSize: FILE_SIZE_LIMIT,
            },
        });
    }
}
