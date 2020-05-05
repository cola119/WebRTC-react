export const requestUserMedia = async (): Promise<MediaStream | null> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    return stream;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const DEFAULT_RTC_CONFIG = {
  iceServers: [
    {
      // urls: ['stun:10.231.163.164:3478'],
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};
