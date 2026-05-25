import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential, UserCredential } from 'firebase/auth';

import { auth } from './firebase';

const WEB_CLIENT_ID = '445050648801-piib6f9t9ooi0u23q7g757asduvgto6n.apps.googleusercontent.com';

let configured = false;

function ensureConfigured() {
  if (configured) return;
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    offlineAccess: false,
  });
  configured = true;
}

export class GoogleSignInCancelled extends Error {
  constructor() {
    super('Google sign-in cancelled by user');
    this.name = 'GoogleSignInCancelled';
  }
}

export async function signInWithGoogle(): Promise<UserCredential> {
  ensureConfigured();

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  try {
    const result = await GoogleSignin.signIn();
    const idToken = result.data?.idToken ?? (result as any).idToken;

    if (!idToken) {
      throw new Error('No se recibio idToken de Google');
    }

    const credential = GoogleAuthProvider.credential(idToken);
    return await signInWithCredential(auth, credential);
  } catch (error: any) {
    if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new GoogleSignInCancelled();
    }
    throw error;
  }
}

export async function signOutFromGoogle() {
  try {
    await GoogleSignin.signOut();
  } catch {
    // ignore
  }
}
