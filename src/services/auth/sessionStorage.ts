import { File, Paths } from "expo-file-system";
import { User } from "./types";

const CURRENT_USER_FILE_NAME = "currentUser.json";
const TOKEN_FILE_NAME = "authToken.txt";

const currentUserFile = new File(Paths.document, CURRENT_USER_FILE_NAME);
const tokenFile = new File(Paths.document, TOKEN_FILE_NAME);

let cachedToken: string | null = null;
let cachedUser: User | null = null;
let hydrationPromise: Promise<void> | null = null;

const writeFile = async (file: File, value: string) => {
   if (!(await file.exists)) {
      await file.create();
   }

   await file.write(value);
};

const hydrateSessionFromFiles = async (): Promise<void> => {
   if (await tokenFile.exists) {
      try {
         const token = await tokenFile.text();
         cachedToken = token || null;
      } catch {
         cachedToken = null;
      }
   } else {
      cachedToken = null;
   }

   if (await currentUserFile.exists) {
      try {
         const raw = await currentUserFile.text();
         cachedUser = raw ? (JSON.parse(raw) as User) : null;
      } catch {
         cachedUser = null;
      }
   } else {
      cachedUser = null;
   }
};

export async function hydrateSession(): Promise<void> {
   if (!hydrationPromise) {
      hydrationPromise = hydrateSessionFromFiles().catch((error) => {
         hydrationPromise = null;
         throw error;
      });
   }

   await hydrationPromise;
}

export async function storeSession(token: string, user: User): Promise<void> {
   cachedToken = token;
   cachedUser = user;
   hydrationPromise = Promise.resolve();

   await Promise.all([
      writeFile(tokenFile, token),
      writeFile(currentUserFile, JSON.stringify(user)),
   ]);
}

export async function getStoredToken(): Promise<string | null> {
   await hydrateSession();
   return cachedToken;
}

export async function getStoredUser(): Promise<User | null> {
   await hydrateSession();
   return cachedUser;
}

export async function clearSession(): Promise<void> {
   console.log("CLEAR SESSION CALLED");
   console.log("TOKEN BEFORE CLEAR:", cachedToken);
   console.log("USER BEFORE CLEAR:", cachedUser);

   cachedToken = null;
   cachedUser = null;
   hydrationPromise = Promise.resolve();

   console.log("TOKEN AFTER CLEAR:", cachedToken);
   console.log("USER AFTER CLEAR:", cachedUser);

   if (await tokenFile.exists) {
      await tokenFile.delete();
   }

   if (await currentUserFile.exists) {
      await currentUserFile.delete();
   }
}
