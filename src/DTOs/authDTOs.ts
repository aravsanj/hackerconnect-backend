export interface RegisterDTO {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  email: string;
  username: string;
  password: string;
  phone: string;
}

export interface LoginDTO {
  username: string;
  password: string;
}

export interface UpdatePasswordDTO {
  password: string;
  _id: string;
}

export interface ValidateUsernameDTO {
  username: string;
}

export interface validatePhoneDTO {
  phone: string;
}

export interface validateEmailDTO {
  email: string;
}

export interface VerifyOTPDTO {
  phone: string;
  enteredOTP: string;
  email: string;
}
