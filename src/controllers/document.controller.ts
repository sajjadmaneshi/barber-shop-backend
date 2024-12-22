import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Document } from '../common/controller-names';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuardJwt } from '../common/guards/auth-guard.jwt';
import { FileInterceptor } from '@nestjs/platform-express';
import { saveFileToStorage } from '../common/file.storage';
import { DocumentService } from '../services/document.service';

@ApiTags(Document)
@Controller(Document)
@ApiBearerAuth()
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get(':id')
  async seeUploadFile(@Param('id') documentId:string, @Res() res): Promise<any> {
    try {
      const document = await this.documentService.findOne(documentId);
      if (!document) {
        throw new NotFoundException('Document not found');
      }
      return res.sendFile(document.fileName, { root: document.destination });
    } catch (err: any) {
      throw new InternalServerErrorException(err.message);
    }
  }

  @Post('upload')
  @ApiCreatedResponse()
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuardJwt)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', saveFileToStorage))
  async handleUpload(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<string | HttpException> {
    return this.documentService.create(file);
  }

  @Delete(':id')
  @ApiCreatedResponse()
  @UseGuards(AuthGuardJwt)
  async delete(@Param('id') id: string): Promise<void> {
    const result = await this.documentService.removeOne(id);
    if (result.affected == 0) throw new BadRequestException('no item removed');
  }
}
