import { File, Paths } from "expo-file-system";
import { User } from "./types";

const CURRENT_USER_FILE_NAME = "currentUser.json";
const TOKEN_FILE_NAME = "authToken.txt";

const currentUserFile = new File(Paths.document, CURRENT_USER_FILE_NAME);
const tokenFile = new File(Paths.document, TOKEN_FILE_NAME);

const writeFile = async (file: File, value: string) => {
   if (!(await file.exists)) {
      await file.create();
   }

   await file.write(value);
};

export async function storeSession(token: string, user: User): Promise<void> {
   await Promise.all([
      writeFile(tokenFile, token),
      writeFile(currentUserFile, JSON.stringify(user)),
   ]);
}

export async function getStoredToken(): Promise<string | null> {
   if (!(await tokenFile.exists)) return null;

   try {
      const token = await tokenFile.text();
      return token || null;
   } catch {
      return null;
   }
}

export async function getStoredUser(): Promise<User | null> {
   if (!(await currentUserFile.exists)) return null;

   try {
      const raw = await currentUserFile.text();
      return raw ? (JSON.parse(raw) as User) : null;
   } catch {
      return null;
   }
}

export async function clearSession(): Promise<void> {
   if (await tokenFile.exists) {
      await tokenFile.delete();
   }

   if (await currentUserFile.exists) {
      await currentUserFile.delete();
   }
}
