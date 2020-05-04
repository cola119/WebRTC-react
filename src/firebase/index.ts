import * as firebase from 'firebase/app';
import 'firebase/firestore';
import { env } from './config';

if (!firebase.apps.length) {
  firebase.initializeApp(env);
}

export const db = firebase.firestore();
export const roomsRef = db.collection('rooms');
