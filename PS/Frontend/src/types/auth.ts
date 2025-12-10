export interface LoginRequest {
  UserName: string;
  Password: string;
}

export interface Line {
  id: string;
  name: string;
  description: string | null;
  idCompany: string;
  company: any;
  status: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
  line: Line[];
}

export interface User {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: any;
  idCompany: string;
  password: string;
  rol: boolean; // true = administrador, false = usuario
}

export interface AuthContextType {
  user: User | null;
  lines: Line[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

