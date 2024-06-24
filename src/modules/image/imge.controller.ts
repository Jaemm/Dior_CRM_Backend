import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AwsS3Service } from 'src/common/awsS3/awsS3.service';

// @UseGuards(JwtAuthGuard)
@ApiTags('Image')
@Controller('image')
export class ImageController {
  constructor(
    private readonly imageRead: AwsS3Service
  ) { }


  @Get(':hash')
  async getproductById(@Param('hash') hash: string, @Res() res: Response) {
    const image = await this.imageRead.getImagesFromCloud(hash)
    res.writeHead(200, { "Content-Type": "image/jpeg" });
    res.write(image.Body, "binary");
    res.end(null, "binary");
  }
}