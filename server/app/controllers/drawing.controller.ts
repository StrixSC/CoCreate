import { NextFunction, Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';
import { Drawing } from '../../../common/communication/drawing';
import { DrawingService } from '../services/drawing.service';
import { MulterProviderService } from '../services/multer-provider.service';
import Types from '../types';

@injectable()
export class DrawingController {

    router: Router;

    constructor(
        @inject(Types.DrawingService) private drawingService: DrawingService,
        @inject(Types.MulterProviderService) private multerProviderService: MulterProviderService,
    ) {
        this.configureRouter();
    }

    private configureRouter() {
        this.router = Router();

        /// Suprimer un dessin
        this.router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
            this.drawingService.getOneDrawing(req.params.id).then((drawing) => {
                if (drawing) {
                    this.drawingService.deleteDrawing(drawing.fileName)
                        .then(() => { res.status(200).send({ success: true }); })
                        .catch(() => { res.status(500).send({ success: false }); });
                } else {
                    res.status(500).send({ success: false });
                }
            }).catch(() => { res.status(500).send({ success: false }); });
        });

        /// Retourne tous les dessins
        this.router.get('/',
            (req: Request, res: Response, next: NextFunction) => {
                this.drawingService.getAllDrawings().then((drawings: Drawing[]) => {
                    res.json(drawings);
                }).catch(() => {
                    res.sendStatus(500);
                });
            });

        /// Ajoute un dessin
        this.router.post('/', this.multerProviderService.upload.single('svg'), async (req, res) => {
            if (req.file) {
                console.log(`Uploading file ${req.file.filename}...`);
                this.drawingService.setDrawing(JSON.parse(req.body.tags), req.body.name, req.file).then(() => {
                    res.send({ success: true });
                });
            } else {
                console.log('No File Uploaded');
                res.sendStatus(500);
            }
        });
    }
}
