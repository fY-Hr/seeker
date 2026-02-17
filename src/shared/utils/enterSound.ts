import bipSoundSrc from "../../assets/sounds/bip-scanner-3.mp3";

const bipSound = new Audio(bipSoundSrc)
  bipSound.preload = "auto";
  bipSound.volume = 1.0;

export function playBipSound(){
  bipSound.pause();
  bipSound.currentTime = 0;
  bipSound.play().catch(() => {})
}