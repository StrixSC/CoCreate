import { NextFunction, Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';
// import { Message } from '../../../common/communication/message';
import { IndexService } from '../services/index.service';
import Types from '../types';

@injectable()
export class IndexController {

    router: Router;

    constructor(@inject(Types.IndexService) private indexService: IndexService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();
        // Retourner le text de bienvenu avec une requete HTTP Get
        this.router.get('/text',
            (req: Request, res: Response, next: NextFunction) => {
                res.json(this.indexService.getTextRessource('/../../../../app/res/text/welcome_text2.json'));
            });
    }
}
