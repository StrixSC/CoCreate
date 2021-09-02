import { NextFunction, Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';
import { Tag } from '../../../common/communication/drawing';
import { TagService } from '../services/tag.service';
import Types from '../types';

@injectable()
export class TagController {

    router: Router;

    constructor(@inject(Types.TagService) private tagService: TagService) {
        this.configureRouter();
    }

    private configureRouter() {
        this.router = Router();

        // Retourner tout les tags sous une demande HTTP Get
        this.router.get('/',
            (req: Request, res: Response, next: NextFunction) => {
                this.tagService.getAllTags().then((tag: Tag[]) => {
                    res.json(tag);
                }).catch((reason: unknown) => {
                    res.sendStatus(500);
                });
            });
    }
}
