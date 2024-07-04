export enum ResponseMessages {
    InternalServerError = 'Internal server error',

    Unauthorized = 'You are unauthorized to use this service',

    LicenseNotUpdated = 'Error updating Licence, please contact admin',
    VersionNotUpdated = 'Version not updated!',

    CustomerNotDeleted = 'Customer not deleted',
    NotificationNotDeleted = 'Notification not deleted',
    StoreNotDeleted = 'Store not deleted',

    CustomerNotCreated = 'Customer not created',
    ConsultantNotCreated = 'Consultant not created',

    IdRequired = 'Id is required',
    EmailOrPhoneRequired = 'Email or phone is required',
    AppIdRequired = 'App id is required',
    ProductCredsRequired = 'Product credentials are required.',
    DurationAndTimeTypeRequired = 'Duration & time type are required.',

    RecordNotFound = 'Record not found, contact admin',
    CustomerNotFound = 'Customer not found, contact admin',
    ProductNotFound = 'Check your product information or contact admin',
    LicenseNotFound = 'Licence for this application could not be found, please retry or contact admin',
    LicenseHistoryNotFound = 'License history not found',
    CrmCustomerNotFound = 'Customer record not found for this counselor',

    DeviceAlreadyInUse = 'Device with this optic number is already registered.',
    DataAlreadyExist = 'Data already exist',
    DeviceAlreadyRegistered = 'Device already registered by another user, please contact admin.',
    DeviceReachedMaximumRegistration = 'Device reached maximum registration, please contact admin.',

    DeviceNotBelong = 'Sorry! This Device does not belong to this User!',
    EmailExist = 'Email is already in use',
    EmailAlreadyExist = 'Email already exist',
    EmailAlreadyConfirmed = 'Email already confirmed',
    CustomerExist = 'Customer already exist',

    LoginFailed = 'Please check your ID and password.',
    ProductLoginFailed = 'Login failled, wrong password or optic number',
    PasswordChangeFailed = 'Password change failled, please try again',

    EmailNotConfirmed = 'Please confirm your email',

    TokenExpired = 'Token expired',
    InvalidCountryCode = 'Invalid country code',
    InvalidTimeType = 'Invalid time type',
    InvalidPassword = 'Invalid password',
    InvalidToken = 'Invalid token',
    InvalidRefreshToken = 'Invalid refresh token',
    InvalidSelectionTyoe = 'Invalid selection type! It can be change or extend!',
    InvalidInitialDays = 'Invalid initial days',
    InvalidExtendedType = 'Invalid extended type',
    InvalidLicensePeriod = 'Invalid license period',
    InvalidAnalysisType = 'Invalid analysis type',
    InvalidConsentType = 'Only consent_type ipos_consent or without_ipos_consent accepted',
    InvalidHashAlogorithm = 'Invalid hash algorithm',

    LicenseCanNotExtend = "License can't be extend for more then 3 years",
    LicenseExpired = 'Access is denied due to license expiration. Please renew your license to regain access.',

    AccountDeleted = 'Successfully remove account',
    RecordDeleted = 'Record deleted successfully',
    NotificationDelete = 'Success delete notification',
}
