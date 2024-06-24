import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Consultants } from '@/src/common/entities/crmEntities/Consultants.entity';
import { FindOptionsSelectByString, Repository } from 'typeorm';
import { Customers } from '@/src/common/entities/crmEntities/Customers.entity';
import { AnalysisDataReplicationService } from '../analysisDataReplication/analysisDataReplication.service';
import { ErrorStatus } from '@/src/common/constants/error-status';
import { ResponseMessages } from '@/src/common/constants/response-messages';

@Injectable()
export class CustomerDataReplicationService {
    constructor(
        @InjectRepository(Customers)
        private readonly globalCustomersRepository: Repository<Customers>,

        @InjectRepository(Customers, 'secondDB')
        private readonly secondCustomersRepository: Repository<Customers>,

        @InjectRepository(Customers, 'thirdDB')
        private readonly thirdCustomersRepository: Repository<Customers>,

        private readonly analysisData: AnalysisDataReplicationService,
    ) {}

    // Hande message
    async handleMessage(channel: string, message: string) {
        // Process the message received from the Redis Pub/Sub channel
        // For example, save data to the database
        console.log('Received message:', channel, message);
        // Save data to the database here
    }

    async userExists(email: string, app_id: number, selections: any, includes: any) {
        const cachedUser: any = await this.secondCustomersRepository.findOne({
            where: { email, app_id },
            // select: selections
            //     ? (selections as FindOptionsSelectByString<Customers>)
            //     : ['id', 'name', 'email', 'app_id'],
            relations: includes ? includes : [],
        });

        if (cachedUser !== null) {
            return cachedUser;
        } else if (cachedUser === null) {
            const cachedUser: any = await this.thirdCustomersRepository.findOne({
                where: { email, app_id },
                // select: selections
                //     ? (selections as FindOptionsSelectByString<Customers>)
                //     : ['id', 'name', 'email', 'app_id'],
                relations: includes ? includes : [],
            });
            if (cachedUser === null) {
                throw new BadRequestException({
                    result_code: ErrorStatus.LOGIN_FAILED,
                    error: ResponseMessages.LoginFailed,
                });
            }
            return cachedUser;
        }
    }

    async customReplication(user: any): Promise<Consultants> {
        const values = [
            user.token,
            user.email,
            user.password_digest,
            user.recovery_password_digest,
            user.social,
            user.social_id,
            user.name,
            user.os,
            user.language,
            user.phone,
            user.birth,
            user.address,
            user.note,
            user.push_token,
            user.app_id,
            user.email_confirmed,
            user.confirm_token,
            user.company_id,
            user.consultant_id,
            user.surname,
            user.age,
            user.register_date,
            user.skin_condition,
            user.skin_color_group_id,
            user.ethnicity_id,
            user.city,
            user.state,
            user.zip_code,
            user.notes,
            user.is_active,
            user.image_url,
            user.delete_token,
            user.status,
            user.sign_in_count,
            user.created_at,
            user.updated_at,
            user.phone_country_code,
            user.ipos_consent_url,
            user.without_ipos_consent_url,
            user.external_id,
            user.country_code,
            user.country_id,
            user.country_name,
            user.gender_id,
            user.register_for_crm,
            user.consultant_shop_id,
            user.email_subscription,
        ];
        const result = await this.globalCustomersRepository.query(
            `INSERT INTO customers (
                "token", "email", "password_digest", "recovery_password_digest", "social", "social_id", "name", "os", "language", "phone", "birth", "address", 
                "note", "push_token", "app_id", "email_confirmed", "confirm_token", "company_id", "consultant_id", "surname", "age", "register_date", 
                "skin_condition", "skin_color_group_id", "ethnicity_id", "city", "state", "zip_code", "notes", "is_active", "image_url", "delete_token", 
                "status", "sign_in_count", "created_at", "updated_at", "phone_country_code", "ipos_consent_url", "without_ipos_consent_url", "external_id", 
                "country_code", "country_id", "country_name", "gender_id", "register_for_crm", "consultant_shop_id", "email_subscription"
            ) 
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, 
                $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47
            ) RETURNING *;`,
            values,
        );

        return result[0];
    }

    async replicateUserToMasterOperation(email: string, appId: number, selections: any, includes: any) {
        // Parallelize user existence check and replication
        const [userExists] = await Promise.all([this.userExists(email, appId, selections, includes)]);

        if (!userExists) {
            throw new BadRequestException({
                result_code: ErrorStatus.LOGIN_FAILED,
                error: ResponseMessages.LoginFailed,
            });
        }

        const replicatedCustomer = await this.customReplication(userExists);

        return replicatedCustomer;
    }
}
