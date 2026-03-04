// src/types/auth.types.ts
export type LoginFormData = {
    email: string;
    password: string;
    rememberMe: boolean;
  };
  
  export type RegisterFormData = {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    agreeTerms: boolean;
  };
  
  export type AuthErrors = {
    [key in keyof LoginFormData | keyof RegisterFormData]?: string;
  };
  
  export type LoginProps = {
    onLogin: (data: LoginFormData) => void;
    onToggleForm: () => void;
  };
  
  export type RegisterProps = {
    onRegister: (data: RegisterFormData) => void;
    onToggleForm: () => void;
  };