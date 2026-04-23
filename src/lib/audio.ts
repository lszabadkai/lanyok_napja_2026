let chimeAudio: HTMLAudioElement | null = null;

export function playChime() {
  try {
    if (!chimeAudio) {
      chimeAudio = new Audio("/sounds/chime.mp3");
    }
    chimeAudio.currentTime = 0;
    chimeAudio.play().catch(() => {
      // Silently fail — browser may block autoplay
    });
  } catch {
    // Audio not supported
  }
}
