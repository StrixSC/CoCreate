import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';
import { inject, injectable } from 'inversify';
import * as logger from 'morgan';
import { ApiEndpointController } from './controllers/api-endpoint.controller';
import { DrawingController } from './controllers/drawing.controller';
import { IndexController } from './controllers/index.controller';
import { TagController } from './controllers/tag.controller';
import { BASE_ROUTE, CONFIG_API_DEF, SVG_PATH } from './res/environement';
import Types from './types';

@injectable()
export class Application {

    private readonly internalError: number = 500;
    app: express.Application;

    constructor(
        @inject(Types.IndexController) private indexController: IndexController,
        @inject(Types.DrawingController) private drawingController: DrawingController,
        @inject(Types.TagController) private tagController: TagController,
        @inject(Types.ApiEndpointController) private apiEndpointController: ApiEndpointController,
    ) {
        this.app = express();
        this.config();

        this.bindRoutes();
    }

    private config(): void {
        // Middlewares configuration
        this.app.use(logger('dev'));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(cookieParser());
        this.app.use(cors());
    }

    bindRoutes(): void {
        // Notre application utilise le routeur de notre API `Index`
        this.app.use(`${BASE_ROUTE}`, this.apiEndpointController.router);
        this.app.use(`${BASE_ROUTE}/${CONFIG_API_DEF.index}`, this.indexController.router);
        this.app.use(`${BASE_ROUTE}/${CONFIG_API_DEF.drawing}`, this.drawingController.router);
        this.app.use(`${BASE_ROUTE}/${CONFIG_API_DEF.tag}`, this.tagController.router);
        this.app.use(`/${SVG_PATH}`, express.static(SVG_PATH));
        this.errorHandling();
    }

    private errorHandling(): void {
        // When previous handlers have not served a request: path wasn't found
        this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            const err: Error = new Error('Not Found');
            next(err);
        });

        // development error handler
        // will print stacktrace
        if (this.app.get('env') === 'development') {
            // tslint:disable-next-line:no-any
            this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
                res.status(err.status || this.internalError);
                res.send({
                    message: err.message,
                    error: err,
                });
            });
        }

        // production error handler
        // no stacktraces leaked to user (in production env only)
        // tslint:disable-next-line:no-any
        this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            res.status(err.status || this.internalError);
            res.send({
                message: err.message,
                error: {},
            });
        });
    }
}
