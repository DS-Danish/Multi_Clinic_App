import { File, Paths } from "expo-file-system";
import { LoginCredentials, RegisterData, User } from "./types";

const USERS_FILE_NAME = "users.json";
const CURRENT_USER_FILE_NAME = "currentUser.json";
const INITIAL_USERS = require("../../data/initialUsers.json").users;

const generateId = () =>
   Date.now().toString() + Math.random().toString(36).substr(2, 6);

class FileSystemAuthService {
   private users: User[] = [];
   private usersFile: File;
   private currentUserFile: File;

   constructor() {
      const documentDir = Paths.document; // Directory instance
      this.usersFile = new File(documentDir, USERS_FILE_NAME);
      this.currentUserFile = new File(documentDir, CURRENT_USER_FILE_NAME);
   }

   async initialize() {
      try {
         if (!(await this.usersFile.exists)) {
            // Create file and write initial users
            await this.usersFile.create();
            await this.usersFile.write(JSON.stringify(INITIAL_USERS));
            this.users = [...INITIAL_USERS];
         } else {
            const content = await this.usersFile.text();
            this.users = JSON.parse(content);
         }
      } catch (error) {
         console.error("Failed to initialize auth storage:", error);
         this.users = [];
      }
   }

   private async persistUsers() {
      if (!(await this.usersFile.exists)) {
         await this.usersFile.create();
      }
      await this.usersFile.write(JSON.stringify(this.users));
   }

   async register(data: RegisterData): Promise<User> {
      if (this.users.some((u) => u.email === data.email)) {
         throw new Error("Email already registered");
      }
      const newUser: User = {
         id: generateId(),
         name: data.name,
         email: data.email,
         password: data.password,
         role: data.role,
         createdAt: new Date().toISOString(),
      };
      this.users.push(newUser);
      await this.persistUsers();
      return newUser;
   }

   async login(credentials: LoginCredentials): Promise<User> {
      const { email, password, role } = credentials;
      const user = this.users.find(
         (u) => u.email === email && u.password === password,
      );
      if (!user) throw new Error("Invalid email or password");
      if (role && user.role !== role)
         throw new Error(`Invalid role: expected ${role}, got ${user.role}`);
      const sessionUser = { ...user };
      // write current user (creates file if not exists)
      await this.currentUserFile.write(JSON.stringify(sessionUser));
      return sessionUser;
   }

   async logout() {
      if (await this.currentUserFile.exists) {
         await this.currentUserFile.delete();
      }
   }

   async getCurrentUser(): Promise<User | null> {
      if (!(await this.currentUserFile.exists)) return null;
      try {
         const content = await this.currentUserFile.text();
         return JSON.parse(content);
      } catch {
         return null;
      }
   }

   async updateUser(id: string, updates: Partial<User>): Promise<User> {
      const index = this.users.findIndex((u) => u.id === id);
      if (index === -1) throw new Error("User not found");
      const updated = { ...this.users[index], ...updates };
      this.users[index] = updated;
      await this.persistUsers();
      const current = await this.getCurrentUser();
      if (current && current.id === id) {
         await this.currentUserFile.write(JSON.stringify(updated));
      }
      return updated;
   }

   async getAllUsers(): Promise<User[]> {
      return [...this.users];
   }
}

export const authService = new FileSystemAuthService();
