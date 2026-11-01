// src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getDatabase,
  ref,
  set,
  push,
  serverTimestamp,
  onValue,
  off,
  remove,
  get,
  query,
  orderByChild,
  orderByKey,
  limitToLast,
  limitToFirst,
  startAt,
  endAt,
  equalTo,
  child,
  update,
  onDisconnect,
  goOffline,
  goOnline
} from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  uploadBytesResumable,
  getMetadata
} from "firebase/storage";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
  TwitterAuthProvider
} from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD01rIB71Mn08nzyLy9uPmg_SU6gLePLjU",
  authDomain: "chatbot-c090a.firebaseapp.com",
  databaseURL: "https://chatbot-c090a-default-rtdb.asia-southeast1.firebasedatabase.app", // ✅ Correct region
  projectId: "chatbot-c090a",
  storageBucket: "chatbot-c090a.firebasestorage.app",
  messagingSenderId: "91646649116",
  appId: "1:91646649116:web:9d850e098afb1441a290d9",
  measurementId: "G-PE8ZSY5SH3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = getAnalytics(app);
const database = getDatabase(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Auth providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const twitterProvider = new TwitterAuthProvider();

// Configure providers
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

facebookProvider.setCustomParameters({
  'display': 'popup'
});

// Database helper functions
export const dbHelpers = {
  // CREATE REFERENCE
  createRef: (path: string) => ref(database, path),

  // WRITE DATA
  writeData: async (path: string, data: any) => {
    try {
      await set(ref(database, path), data);
      return { success: true };
    } catch (error) {
      console.error('Error writing data:', error);
      return { success: false, error };
    }
  },

  // PUSH DATA (AUTO-GENERATED KEY)
  pushData: async (path: string, data: any) => {
    try {
      const newRef = push(ref(database, path));
      await set(newRef, data);
      return { success: true, key: newRef.key };
    } catch (error) {
      console.error('Error pushing data:', error);
      return { success: false, error };
    }
  },

  // READ DATA ONCE
  readData: async (path: string) => {
    try {
      const snapshot = await get(ref(database, path));
      return {
        success: true,
        data: snapshot.val(),
        exists: snapshot.exists()
      };
    } catch (error) {
      console.error('Error reading data:', error);
      return { success: false, error };
    }
  },

  // UPDATE DATA
  updateData: async (path: string, updates: any) => {
    try {
      await update(ref(database, path), updates);
      return { success: true };
    } catch (error) {
      console.error('Error updating data:', error);
      return { success: false, error };
    }
  },

  // DELETE DATA
  deleteData: async (path: string) => {
    try {
      await remove(ref(database, path));
      return { success: true };
    } catch (error) {
      console.error('Error deleting data:', error);
      return { success: false, error };
    }
  },

  // LISTEN TO DATA CHANGES
  listenToData: (path: string, callback: (data: any) => void) => {
    const dataRef = ref(database, path);
    onValue(dataRef, (snapshot) => {
      callback(snapshot.val());
    });
    return dataRef; // Return reference for cleanup
  },

  // STOP LISTENING
  stopListening: (dataRef: any, callback?: any) => {
    off(dataRef, callback);
  },

  // QUERY HELPERS
  createQuery: {
    orderByChild: (path: string, childKey: string) =>
      query(ref(database, path), orderByChild(childKey)),

    orderByKey: (path: string) =>
      query(ref(database, path), orderByKey()),

    limitToLast: (path: string, limit: number) =>
      query(ref(database, path), limitToLast(limit)),

    limitToFirst: (path: string, limit: number) =>
      query(ref(database, path), limitToFirst(limit)),

    equalTo: (path: string, childKey: string, value: any) =>
      query(ref(database, path), orderByChild(childKey), equalTo(value)),

    range: (path: string, childKey: string, start: any, end: any) =>
      query(ref(database, path), orderByChild(childKey), startAt(start), endAt(end))
  }
};

// Storage helper functions
export const storageHelpers = {
  // UPLOAD FILE
  uploadFile: async (file: File, path: string, onProgress?: (progress: number) => void) => {
    try {
      const fileRef = storageRef(storage, path);

      if (onProgress) {
        const uploadTask = uploadBytesResumable(fileRef, file);

        return new Promise((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress(progress);
            },
            (error) => {
              console.error('Upload error:', error);
              reject({ success: false, error });
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve({
                  success: true,
                  downloadURL,
                  fullPath: uploadTask.snapshot.ref.fullPath
                });
              } catch (error) {
                reject({ success: false, error });
              }
            }
          );
        });
      } else {
        const snapshot = await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return {
          success: true,
          downloadURL,
          fullPath: snapshot.ref.fullPath
        };
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      return { success: false, error };
    }
  },

  // DELETE FILE
  deleteFile: async (path: string) => {
    try {
      const fileRef = storageRef(storage, path);
      await deleteObject(fileRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting file:', error);
      return { success: false, error };
    }
  },

  // GET DOWNLOAD URL
  getDownloadURL: async (path: string) => {
    try {
      const fileRef = storageRef(storage, path);
      const url = await getDownloadURL(fileRef);
      return { success: true, url };
    } catch (error) {
      console.error('Error getting download URL:', error);
      return { success: false, error };
    }
  },

  // GET FILE METADATA
  getMetadata: async (path: string) => {
    try {
      const fileRef = storageRef(storage, path);
      const metadata = await getMetadata(fileRef);
      return { success: true, metadata };
    } catch (error) {
      console.error('Error getting metadata:', error);
      return { success: false, error };
    }
  }
};

// Auth helper functions
export const authHelpers = {
  // SIGN IN WITH EMAIL AND PASSWORD
  signIn: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  },

  // SIGN UP WITH EMAIL AND PASSWORD
  signUp: async (email: string, password: string, displayName?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }

      return { success: true, user: userCredential.user };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  },

  // SIGN OUT
  signOut: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  },

  // SIGN IN WITH GOOGLE
  signInWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return { success: true, user: result.user };
    } catch (error: any) {
      console.error('Google sign in error:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  },

  // SIGN IN WITH FACEBOOK
  signInWithFacebook: async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      return { success: true, user: result.user };
    } catch (error: any) {
      console.error('Facebook sign in error:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  },

  // RESET PASSWORD
  resetPassword: async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  },

  // SEND EMAIL VERIFICATION
  sendEmailVerification: async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        return { success: true };
      }
      return { success: false, error: 'No user signed in' };
    } catch (error: any) {
      console.error('Email verification error:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  },

  // UPDATE PROFILE
  updateUserProfile: async (updates: { displayName?: string; photoURL?: string }) => {
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, updates);
        return { success: true };
      }
      return { success: false, error: 'No user signed in' };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  },

  // GET CURRENT USER
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // LISTEN TO AUTH STATE CHANGES
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  }
};

// Connection helper functions
export const connectionHelpers = {
  // GO OFFLINE
  goOffline: () => {
    goOffline(database);
  },

  // GO ONLINE
  goOnline: () => {
    goOnline(database);
  },

  // SET UP PRESENCE SYSTEM
  setupPresence: (userId: string) => {
    const userStatusRef = ref(database, `users/${userId}/status`);
    const userLastSeenRef = ref(database, `users/${userId}/lastSeen`);

    // Set up offline actions
    onDisconnect(userStatusRef).set('offline');
    onDisconnect(userLastSeenRef).set(serverTimestamp());

    // Set online when connected
    const connectedRef = ref(database, '.info/connected');
    onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === true) {
        set(userStatusRef, 'online');
      }
    });

    return { userStatusRef, userLastSeenRef, connectedRef };
  },

  // LISTEN TO CONNECTION STATUS
  listenToConnection: (callback: (isConnected: boolean) => void) => {
    const connectedRef = ref(database, '.info/connected');
    onValue(connectedRef, (snapshot) => {
      callback(snapshot.val() === true);
    });
    return connectedRef;
  }
};

// Chat specific helper functions
export const chatHelpers = {
  // SEND MESSAGE
  sendMessage: async (chatId: string, message: any) => {
    return dbHelpers.pushData(`chats/${chatId}/messages`, {
      ...message,
      timestamp: serverTimestamp()
    });
  },

  // GET CHAT MESSAGES
  getChatMessages: (chatId: string, limit: number = 50) => {
    return dbHelpers.createQuery.limitToLast(`chats/${chatId}/messages`, limit);
  },

  // CREATE CHAT
  createChat: async (participants: string[], type: 'private' | 'group', name?: string) => {
    const chatData = {
      participants,
      type,
      name: name || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    return dbHelpers.pushData('chats', chatData);
  },

  // UPDATE TYPING STATUS
  setTypingStatus: async (chatId: string, userId: string, isTyping: boolean) => {
    return dbHelpers.writeData(`chats/${chatId}/typing/${userId}`, isTyping);
  },

  // GET USER CHATS
  getUserChats: async (userId: string) => {
    const { data } = await dbHelpers.readData('chats');
    if (!data) return [];

    return Object.keys(data)
      .filter(chatId => {
        const chat = data[chatId];
        return chat.participants && chat.participants.includes(userId);
      })
      .map(chatId => ({
        id: chatId,
        ...data[chatId]
      }));
  }
};

// Export Firebase instances and helpers
export {
  app,
  analytics,
  database,
  storage,
  auth,
  // Realtime Database exports
  ref,
  set,
  push,
  serverTimestamp,
  onValue,
  off,
  remove,
  get,
  query,
  orderByChild,
  orderByKey,
  limitToLast,
  limitToFirst,
  startAt,
  endAt,
  equalTo,
  child,
  update,
  onDisconnect,
  goOffline,
  goOnline,
  // Storage exports
  storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  uploadBytesResumable,
  getMetadata,
  // Auth exports
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
  TwitterAuthProvider,
  // Auth providers
  googleProvider,
  facebookProvider,
  twitterProvider,
  // Types
  type User
};

// Default export with all helpers
export default {
  app,
  database,
  storage,
  auth,
  dbHelpers,
  storageHelpers,
  authHelpers,
  connectionHelpers,
  chatHelpers
};