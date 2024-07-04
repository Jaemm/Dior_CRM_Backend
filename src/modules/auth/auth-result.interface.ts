/*
  Free and Open Source - GNU LGPLv3
  Copyright © 2023
  Paul Kapuku
*/

// import { IUser } from '../../users/interfaces/user.interface';

export interface IAuthResult {
    user: any;
    accessToken: string;
    refreshToken: string;
}
