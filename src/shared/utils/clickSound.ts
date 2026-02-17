import clickSoundsrc from "../../assets/sounds/button-click.mp3";
import errorSoundsrc from "../../assets/sounds/error-notification.mp3";

const clickSound = new Audio(clickSoundsrc)
clickSound.preload = "auto";
clickSound.volume = 1.0;
clickSound.playbackRate = 1.25;

const errorSound = new Audio(errorSoundsrc)
errorSound.preload = "auto";
errorSound.volume = 1.0;
errorSound.playbackRate = 1.25;

export function playClickSound() {
  clickSound.pause();
  clickSound.currentTime = 0;
  clickSound.play().catch(() => {}) ;
}

export function playErrorSound() {
  errorSound.pause();
  errorSound.currentTime = 0;
  errorSound.play().catch(() => {}) ;
}