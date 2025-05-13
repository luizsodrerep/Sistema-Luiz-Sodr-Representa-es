export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  passwordHash: string; 
}

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface MenuItem {
  name: string;
  icon: React.ReactNode;
  href: string;
  permissions: string[];
}