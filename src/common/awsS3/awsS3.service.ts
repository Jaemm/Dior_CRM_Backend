import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3, Credentials } from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import { GetObjectOutput, ManagedUpload } from 'aws-sdk/clients/s3';
import * as path from 'path';
import fs from 'fs';
import { NotFoundException } from '@nestjs/common/exceptions';


@Injectable()
export class AwsS3Service {
    constructor(private readonly configService: ConfigService) {}

    async uploadFileToS3(fileContent: Buffer, hash: string, prefix: string) {
        if (this.configService.get('REGION') === 'CHINA') {
        }

        const key = `${prefix}/${hash}`;

        const s3 = new S3();
        const params = {
            Bucket: this.configService.get('AWS_BUCKET_NAME'),
            Key: key,
            Body: fileContent,
        };

        return new Promise((resolve, reject) => {
            s3.upload(params, (err: unknown, data: ManagedUpload.SendData) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }

    async uploadFile(fileContent: Buffer, fileName: string) {
        if (this.configService.get('REGION') === 'CHINA') {
        }
        const s3 = new S3();
        const params = {
            Bucket: this.configService.get('AWS_BUCKET_NAME'),
            Key: `${fileName}.jpg`,
            Body: fileContent,
        };

        return new Promise((resolve, reject) => {
            s3.upload(params, (err: unknown, data: ManagedUpload.SendData) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }

    async getImageCloudS3(key: string): Promise<GetObjectOutput> {
        try {
            if (this.configService.get('REGION') === 'CHINA') {
            }
            const params = { Bucket: this.configService.get('AWS_BUCKET_NAME'), Key: key };
            const s3 = new S3();
            return new Promise((resolve, reject) => {
                s3.getObject(params, function (err, data) {
                    if (err) {
                        reject(err);
                    }
                    resolve(data);
                });
            });
        } catch (e) {
        }
    }

    getImageArgs(fileUsage: string | null = null, route: string) {
        const hash = uuid();
        let host: any = '';
        if (this.configService.get('SSL') === 'false' && this.configService.get('ENV') === 'production') {
            host = 'https://' + this.configService.get('HOSTNAME');
        } else {
            host = this.configService.get('HOSTNAME') + ':' + this.configService.get('PORT');
        }
        const url = host + route + hash;
        const filename = `${hash}_${fileUsage}.jpg`;
        const sys_url = `${fileUsage}_${hash}`;

        return { hash, url, filename, sys_url };
    }

    pngFileFilter(fileName: string) {
        const ext = path.extname(fileName);
        if (ext !== '.png') {
            throw new Error('Invalid file type');
        }
        return true;
    }

    async getImagesFromCloud(sysUrl: string) {
        if (!sysUrl) throw new NotFoundException('product image was not found');
        const image = await this.getImageCloudS3(`${sysUrl}`);
        return image;
    }

    async uploadBrochure(fileContent: Buffer, fileName: string) {
        const s3 = new S3();
        const params = {
            Bucket: this.configService.get('AWS_BUCKET_NAME'),
            Key: `${fileName}.pdf`,
            Body: fileContent,
        };

        return new Promise((resolve, reject) => {
            s3.upload(params, (err: unknown, data: ManagedUpload.SendData) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }

    getFileArgs(fileUsage: string | null = null, route: string) {
        const hash = uuid();
        let host: any = '';
        if ((this.configService.get('SSL') === 'false', this.configService.get('ENV') === 'production')) {
            host = 'https://' + this.configService.get('HOSTNAME');
        } else {
            host = this.configService.get('HOSTNAME') + ':' + this.configService.get('PORT');
        }
        const url = host + route + hash;
        const filename = `${hash}_${fileUsage}.pdf`;
        const sys_url = `${fileUsage}_${hash}`;
        return { hash, url, filename, sys_url };
    }

    async getFileFromS3(sysUrl: string) {
        if (!sysUrl) throw new NotFoundException('product brochure was not found');

        const image = await this.getImageCloudS3(`${sysUrl}.pdf`);
        return image;
    }

    async anyFileUpload(fileContent: Buffer, fileName: string, ext: string, realFileName: string) {
        const s3 = new S3();
        const params = {
            Bucket: this.configService.get('AWS_BUCKET_NAME'),
            Key: `${fileName + ext}`,
            Body: fileContent,
            Metadata: {
                'original-filename': realFileName,
            },
        };
        return new Promise((resolve, reject) => {
            s3.upload(params, (err: unknown, data: ManagedUpload.SendData) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }

    getAnyFileArgs(fileUsage: string | null = null, ext: string, route: string) {
        const hash = uuid();
        let host: any = '';
        if ((this.configService.get('SSL') === 'false', this.configService.get('ENV') === 'production')) {
            host = 'https://' + this.configService.get('HOSTNAME');
        } else {
            host = this.configService.get('HOSTNAME') + ':' + this.configService.get('PORT');
        }
        const url = host + route + hash;
        const filename = `${hash}_${fileUsage + ext}`;
        const sys_url = `${fileUsage}_${hash}`;

        return { hash, url, filename, sys_url };
    }

    async getAnyFileFromS3(sysUrl: string, ext: string) {
        if (!sysUrl) throw new NotFoundException('File was not found');
        const file = await this.getImageCloudS3(`${sysUrl}${ext}`);
        return file;
    }
}
