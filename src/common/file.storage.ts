import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { BadRequestException } from '@nestjs/common';

export const saveFileToStorage = {
  storage: diskStorage({
    destination: './documents',
    filename: (req, file, callback) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = extname(file.originalname);
      const fileName = `${file.originalname}-${uniqueSuffix}${ext}`;
      callback(null, fileName);
    },
  }),
};

export const removeFile = (fullFilePath: string): void => {
  try {
    fs.unlinkSync(fullFilePath);
  } catch (err) {
    throw new BadRequestException(err);
  }
};
