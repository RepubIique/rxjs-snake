import { fromEvent } from "rxjs";
import { gameOn, saveHighScore, closeModal, changeSpeed } from "./game"; // <- rxjs from NPM

const svg: SVGSVGElement = (document.getElementById(
  "board"
) as unknown) as SVGSVGElement;
const startButton: HTMLButtonElement = document.getElementById(
  "start"
) as HTMLButtonElement;
const saveHighScoreButton: HTMLButtonElement = document.getElementById(
  "saveScoreBtn"
) as HTMLButtonElement;
const cancelHighScoreButton: HTMLButtonElement = document.getElementById(
  "cancelScoreBtn"
) as HTMLButtonElement;
const gameSpeedScroller: HTMLButtonElement = document.getElementById(
  "gameSpeed"
) as HTMLButtonElement;

fromEvent(startButton, "click").subscribe(() => gameOn(svg));
fromEvent(saveHighScoreButton, "click").subscribe(() => saveHighScore());
fromEvent(cancelHighScoreButton, "click").subscribe(() => closeModal());
fromEvent(gameSpeedScroller, "ionChange").subscribe(() => changeSpeed());
