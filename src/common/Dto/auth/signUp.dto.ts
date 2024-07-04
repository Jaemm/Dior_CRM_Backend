import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MinLength } from 'class-validator';

// import { IsNotEmpty, IsString, MinLength } from "class-validator/types/decorator/decorators";
export enum Role {
    Admin = 'Admin',
    Manager = 'Manager',
    Sales = 'Sales',
    Agent = 'Agent',
    SuperAdmin = 'Super Admin',
    User = 'User',
    Production = 'Production',
}
export class SignUpDto {
    @IsEmail()
    @IsString()
    email: string;

    @IsString()
    domain: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(7)
    //   @MaxLength(65)
    @Matches(/^(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).*$/, { message: 'Password must contain a special character' })
    password: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(7)
    confirmationPassword: string;

    @IsString()
    @IsNotEmpty()
    name: string | null;

    @IsString()
    @IsNotEmpty()
    role: Role;

    @IsNumber()
    @IsNotEmpty()
    adminGroupId: number | null;

    @IsOptional()
    adminToken: string | null;

    @IsOptional()
    userConfirm: boolean;

    @IsOptional()
    adminTokenCreatedAt: Date | null;
}
