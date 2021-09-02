import { Container } from 'inversify';
import { Application } from './app';
import { ApiEndpointController } from './controllers/api-endpoint.controller';
import { DrawingController } from './controllers/drawing.controller';
import { IndexController } from './controllers/index.controller';
import { TagController } from './controllers/tag.controller';
import { Server } from './server';
import { ApiEndpointService } from './services/api-endpoint.service';
import { CloudStorageService } from './services/cloud-storage.service';
import { DrawingService } from './services/drawing.service';
import { IndexService } from './services/index.service';
import { MongoDbConnectionService } from './services/mongodb-connection.service';
import { MulterProviderService } from './services/multer-provider.service';
import { TagService } from './services/tag.service';
import { TimestampLogService } from './services/timestamp-log.service';
import Types from './types';

const container: Container = new Container();

container.bind(Types.Server).to(Server);
container.bind(Types.Application).to(Application);
container.bind(Types.IndexController).to(IndexController);
container.bind(Types.IndexService).to(IndexService);
container.bind(Types.DrawingService).to(DrawingService);
container.bind(Types.TagService).to(TagService);
container.bind(Types.TagController).to(TagController);
container.bind(Types.DrawingController).to(DrawingController);
container.bind(Types.ApiEndpointController).to(ApiEndpointController);
container.bind(Types.ApiEndpointService).to(ApiEndpointService);
container.bind(Types.MongoDbConnectionService).to(MongoDbConnectionService);
container.bind(Types.MulterProviderService).to(MulterProviderService);
container.bind(Types.CloudStorageService).to(CloudStorageService);
container.bind(Types.TimestampLogService).to(TimestampLogService);

export { container };
