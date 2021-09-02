import { ApiEndpoint } from '../../../common/communication/api-endpoint';

export const MONGODB_PASSWORD = 'pde16';

export const MONGODB_URL =
    `mongodb+srv://polydessin:${MONGODB_PASSWORD}@polydessin-rvndn.gcp.mongodb.net/test?retryWrites=true&w=majority`;

export const BASE_ROUTE = '/api';

export const DATABASE_NAME = 'polydessin-dev';

export const TAG_COLLECTION = 'tags';

export const DRAWING_COLLECTION = 'drawings';

export const SVG_PATH = 'svg';

export const CONFIG_API_DEF: ApiEndpoint = {
    date: 'date',
    drawing: 'drawings',
    index: 'index',
    tag: 'tags',
};

export const CLOUD_CONSTANT = {
    CLOUD_PROJECT_ID: 'projet2-e16',
    CLOUD_API_KEY_FILE_LOCATION: 'key.json',
    CLOUD_BUCKET_URL: 'gs://projet2-e16.appspot.com',
};
