import { roomsRef } from '.';

export const createRoomWihtOffer = async (
  offer: RTCSessionDescriptionInit,
): Promise<string> => {
  const offerObj: Room['offer'] = {
    sdp: offer.sdp,
    type: offer.type,
  };
  const ref = await roomsRef.add({ offer: offerObj });
  return ref.id;
};
