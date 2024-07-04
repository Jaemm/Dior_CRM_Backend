import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Consultants } from '@/src/common/entities/crmEntities/Consultants.entity';
import { Repository } from 'typeorm';
import { Customers } from '@/src/common/entities/crmEntities/Customers.entity';
import { AnalysisDataReplicationService } from '../analysisDataReplication/analysisDataReplication.service';
import { ErrorStatus } from '@/src/common/constants/error-status';
import { ResponseMessages } from '@/src/common/constants/response-messages';

@Injectable()
export class CrmDataReplicationService {
    constructor(
        @InjectRepository(Consultants)
        private readonly globalConsultantsRepository: Repository<Consultants>,

        @InjectRepository(Consultants, 'secondDB')
        private readonly ConsultantsRepository: Repository<Consultants>,

        @InjectRepository(Customers)
        private readonly globalCustomersRepository: Repository<Customers>,

        @InjectRepository(Customers, 'secondDB')
        private readonly customersRepository: Repository<Customers>,

        private readonly analysisData: AnalysisDataReplicationService,
    ) {}

    // Hande message
    async handleMessage(channel: string, message: string) {
        // Process the message received from the Redis Pub/Sub channel
        // For example, save data to the database
        console.log('Received message:', channel, message);
        // Save data to the database here
    }

    async userExists(email: string, appId: number) {
        // Check if user exists in cache
        const cachedUser = await this.ConsultantsRepository.findOne({
            where: {
                email,
            },
        });

        if (cachedUser !== null) {
            return cachedUser;
        }

        throw new BadRequestException({
            result_code: ErrorStatus.LOGIN_FAILED,
            error: ResponseMessages.LoginFailed,
        });
    }

    async consultantReplication(user: any): Promise<Consultants> {
        const values = [
            user.consultant_company_id,
            user.consultant_branch_id,
            user.consultant_shop_id,
            user.consultant_position_id,
            user.token,
            user.email,
            user.password_digest,
            user.recovery_password_digest,
            user.social,
            user.social_id,
            user.name,
            user.phone,
            user.address,
            user.note,
            user.push_token,
            user.approved,
            user.surname,
            user.gender_id,
            user.birthdate,
            user.city,
            user.country_name,
            user.app_id,
            user.country_id,
            user.consultant_store_id,
            user.email_confirmed,
            user.confirm_token,
            user.os,
            user.language,
            user.created_at,
            user.updated_at,
            user.memo,
            user.company_name,
            user.company_address,
            user.position,
            user.branch,
            user.zip_code,
            user.state,
            user.skin_color_group_id,
            user.ethnicity_id,
            user.status,
            user.callback_url,
            user.is_active,
            user.code,
            user.tp_token,
            user.otp_valid_til,
            user.countries,
            user.confirmation_sent_at,
            user.confirmed_at,
            user.unconfirmed_email,
            user.register_for_crm,
            user.phone_country_code,
            user.email_subscription,
        ];
        const result = await this.globalConsultantsRepository.query(
            `INSERT INTO consultants (
                consultant_company_id, consultant_branch_id, consultant_shop_id, 
                consultant_position_id, token, email, password_digest, recovery_password_digest, 
                social, social_id, name, phone, address, note, push_token, approved, 
                surname, gender_id, birthdate, city, country_name, app_id, country_id, 
                consultant_store_id, email_confirmed, confirm_token, os, language, created_at, 
                updated_at, memo, company_name, company_address, position, branch, zip_code, state, 
                skin_color_group_id, ethnicity_id, status, callback_url, is_active, code, otp_token, otp_valid_til, 
                countries, confirmation_sent_at, confirmed_at, unconfirmed_email, register_for_crm, phone_country_code, email_subscription
            ) 
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, 
                $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52
            ) RETURNING *;`,
            values,
        );

        return result[0];
    }

    async replicateUserToMasterOperation(email: string, appId: number) {
        // Parallelize user existence check and replication
        const [userExists] = await Promise.all([this.userExists(email, appId)]);

        if (!userExists) {
            throw new BadRequestException({
                result_code: ErrorStatus.LOGIN_FAILED,
                error: ResponseMessages.LoginFailed,
            });
        }

        const replicatedCustomer = await this.consultantReplication(userExists);

        this.customerReplication(Number(userExists.id), Number(replicatedCustomer.id), appId)
            .then(() => {
                console.log(`Success`);
            })
            .catch((error) => {
                console.log(error);
                // Handle errors that occurred during promise execution
                // fs.appendFile('error.log', this.getErrorLog(data.batch_id), 'utf8', (err) => {
                //     if (err) throw err;
                // });
            });

        return replicatedCustomer;
    }

    /* 
        Save data in backgroud
    */
    async findCustomers(consultantId: number) {
        const data = await this.customersRepository.find({
            where: {
                consultant_id: consultantId,
            },
        });
        return data;
    }

    async customerReplication(oldConsultantId: number, newConsultantId: number, appId: number): Promise<any> {
        const oldCustomersInfo: Customers[] = await this.findCustomers(oldConsultantId);

        if (oldCustomersInfo.length === 0) {
            return [];
        }

        // Prepare batch values for insertion
        const customersData = oldCustomersInfo.map((customer) => ({
            ...customer,
            consultantId: newConsultantId,
            id: undefined,
        }));

        const customers = await this.globalCustomersRepository.save(customersData);

        // Construct a mapping between old and new customer IDs
        const customerIdMap: any = {};
        customers.forEach((newCustomer, index) => {
            customerIdMap[oldCustomersInfo[index].id] = newCustomer.id;
        });

        await this.analysisData.AnalysisReplication(customerIdMap, appId);
        return customerIdMap;
    }
}
