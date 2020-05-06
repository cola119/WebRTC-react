import * as firebase from 'firebase/app';
import { roomsRef } from '.';

export const createRoom = async (): Promise<string> => {
  console.log('createRoom');
  const ref = await roomsRef.add({
    createdDate: firebase.firestore.FieldValue.serverTimestamp(),
  });
  return ref.id;
};

export const createRoomWihtOffer = async (
  offer: RTCSessionDescriptionInit,
): Promise<string> => {
  console.log('createRoomWihtOffer');
  const offerObj: Room['offer'] = {
    sdp: offer.sdp,
    type: offer.type,
  };
  const ref = await roomsRef.add({ offer: offerObj });
  return ref.id;
};

export const setOffer = async (
  roomId: string,
  offer: RTCSessionDescriptionInit,
): Promise<void> => {
  console.log('setOffer');
  const offerObj: Room['offer'] = {
    sdp: offer.sdp,
    type: offer.type,
  };
  roomsRef.doc(roomId).update({ offer: offerObj });
};

export const setAnswer = async (
  roomId: string,
  answer: RTCSessionDescriptionInit,
): Promise<void> => {
  console.log('setAnswer');
  const answerObj: Room['answer'] = {
    sdp: answer.sdp,
    type: answer.type,
  };
  roomsRef.doc(roomId).update({ answer: answerObj });
};

export const fetchRoomById = async (id: string): Promise<Room | undefined> => {
  console.log('fetchRoomById');
  const snapshot = await roomsRef.doc(id).get();
  const room = snapshot.data() as Room | undefined;
  return room;
};
