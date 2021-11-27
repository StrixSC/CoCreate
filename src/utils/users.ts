import moment from "moment";
import create from 'http-errors';
import { bucket } from "../firebase";

export const uploadToBucket = async (userId: string, file: Express.Multer.File) => {
    const timestamp = moment().toDate().toISOString();
    const type = file.originalname.split('.')[1];

    if (!type) {
        throw new create.BadRequest('Invalid type associated with filename. Please ensure the filename has a valid name, followed by a "." and a valid type.')
    }

    const fileName = `${userId}_${timestamp}.${type}`;
    const bucketFile = bucket.file(`${userId}/` + fileName);

    await bucketFile.save(file.buffer, {
        contentType: file.mimetype,
        gzip: true
    });

    const [url] = await bucketFile.getSignedUrl({
        action: "read",
        expires: "01-01-2050"
    });

    return { url: url, bucketFile: bucketFile };
}