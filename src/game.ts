import { fromEvent, Observable, Subject, timer } from "rxjs";
import {
  filter,
  map,
  scan,
  startWith,
  takeUntil,
  takeWhile,
  withLatestFrom,
} from "rxjs/operators";

var GAME_TICK = 100; // time in milliseconds between updates
const CELL_SIZE = 20; // pixels

let currentGame: Game;

export function saveHighScore() {
  const username = <HTMLInputElement>document.getElementById("username");
  const mostRecentScore = localStorage.getItem("mostRecentScore");
  const highscore = JSON.parse(localStorage.getItem("highscore")) || [];
  const MAX_HIGH_SCORES = 5;

  console.log("mostrecentscore:", mostRecentScore);
  console.log("username:", username.value);
  const score = {
    score: mostRecentScore,
    name: username.value,
  };
  highscore.push(score);
  highscore.sort((a: any, b: any) => b.score - a.score);
  highscore.splice(MAX_HIGH_SCORES);

  localStorage.setItem("highscore", JSON.stringify(highscore));
  (<HTMLInputElement>document.getElementById("username")).value = "";
  document.getElementById("id01").style.display = "none";

  console.log("Current score board", highscore);

  highscore.map((score: any) => {
    document.getElementById("scorelist").insertAdjacentHTML(
      "afterbegin",
      `
          <ion-row>
              <ion-col size="8">${score.name}</ion-col>
              <ion-col>${score.score}</ion-col>
          </ion-row>
          `
    );
  });
}

export function changeSpeed() {
  const speed = <HTMLInputElement>document.getElementById("gameSpeed");
  GAME_TICK = parseInt(speed.value);
}

export function closeModal() {
  document.getElementById("id01").style.display = "none";
}

export function gameOn(svg: SVGSVGElement) {
  if (currentGame) {
    currentGame.abandon();
  } else {
    document.getElementById(
      "highscore"
    ).innerHTML = `High Score: ${localStorage.highscore}`;
    currentGame = new Game(svg, CELL_SIZE);
  }

  currentGame.gameOn();
}

type Heading = "N" | "E" | "S" | "W";

function isOpposite(heading1: Heading, heading2: Heading): boolean {
  switch (heading1) {
    case "N":
      return heading2 == "S";
    case "E":
      return heading2 == "W";
    case "S":
      return heading2 == "N";
    case "W":
      return heading2 == "E";
    default:
      return false;
  }
}

// Where Snake is Moving towards
class CellLocation {
  constructor(public readonly x: number, public readonly y: number) {}

  next(heading: Heading): CellLocation {
    switch (heading) {
      case "N":
        return new CellLocation(this.x, this.y - 1);
      case "E":
        return new CellLocation(this.x + 1, this.y);
      case "S":
        return new CellLocation(this.x, this.y + 1);
      case "W":
        return new CellLocation(this.x - 1, this.y);
      default:
        return this;
    }
  }

  get id() {
    return this.x + "_" + this.y;
  }
}

class Board {
  public readonly width: number;
  public readonly height: number;

  constructor(domRect: DOMRect, public readonly cellSize: number) {
    this.width = Math.floor(domRect.width / cellSize);
    this.height = Math.floor(domRect.height / cellSize);
  }

  startSnake(size: number, heading: Heading): CellLocation[] {
    const centre = new CellLocation(
      Math.floor(this.width / 2),
      Math.floor(this.height / 2)
    );
    return [centre, centre.next(heading)];
  }

  isWithinBounds(location: CellLocation) {
    return (
      location.x >= 0 &&
      location.x < this.width &&
      location.y >= 0 &&
      location.y < this.height
    );
  }

  getRect(
    cellLocation: CellLocation
  ): { x: number; y: number; width: number; height: number } {
    return {
      x: cellLocation.x * this.cellSize,
      y: cellLocation.y * this.cellSize,
      width: this.cellSize,
      height: this.cellSize,
    };
  }

  random(): CellLocation {
    return new CellLocation(
      Math.floor(Math.random() * this.width),
      Math.floor(Math.random() * this.height)
    );
  }
}

interface GameState {
  isAlive: boolean;
  snake: {
    body: CellLocation[];
    heading: Heading;
  };
  snakeEvolution: {
    newHead: CellLocation[]; // Snake parts to be added
    oldTail: CellLocation[]; // Snake parts to be removed
  };
  foodLocation?: CellLocation;
}

class Game {
  private readonly board: Board;
  private readonly destroyed$ = new Subject();

  constructor(
    private readonly svg: SVGSVGElement,
    private readonly cellSize: number
  ) {
    this.board = new Board(svg.getBoundingClientRect(), cellSize);
  }

  gameOn() {
    let startScore = 0;

    const keyDowns$: Observable<KeyboardEvent> = fromEvent(
      document,
      "keydown"
    ) as Observable<KeyboardEvent>;
    const timer$ = timer(0, GAME_TICK);

    const heading$: Observable<Heading> = keyDowns$.pipe(
      filter(
        (curr: KeyboardEvent) =>
          ["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"].indexOf(
            curr.key
          ) !== -1
      ),
      map((curr: KeyboardEvent) => {
        switch (curr.key) {
          case "ArrowUp":
            return "N";
          case "ArrowRight":
            return "E";
          case "ArrowDown":
            return "S";
          case "ArrowLeft":
            return "W";
        }
      }),
      startWith("E")
    ) as Observable<Heading>;

    const startSnake = this.board.startSnake(2, "E");
    const state0: GameState = {
      isAlive: true,
      snake: { body: startSnake, heading: "E" },
      snakeEvolution: { newHead: startSnake, oldTail: [] },
      foodLocation: undefined,
    };

    timer$
      .pipe(
        withLatestFrom(heading$),
        scan((acc: GameState, curr: [number, Heading]) => {
          document.getElementById(
            "highscore"
          ).innerHTML = `High Score: ${localStorage.highscore}`;
          const newHeading = isOpposite(acc.snake.heading, curr[1])
            ? acc.snake.heading
            : curr[1];
          const newHead: CellLocation = acc.snake.body[
            acc.snake.body.length - 1
          ].next(newHeading);
          const didDie =
            !this.board.isWithinBounds(newHead) ||
            acc.snake.body.find((x) => x.id === newHead.id) !== undefined;
          if (didDie) {
            console.log("endscore: " + startScore);
            localStorage.setItem("score", `${startScore}`);
            document.getElementById("score").innerHTML = `Current Score: 0`;

            localStorage.setItem("mostRecentScore", `${startScore}`);
            startScore = 0;
            document.getElementById("id01").style.display = "block";
            document.getElementById(
              "lastscore"
            ).innerHTML = `Score: ${localStorage.getItem("mostRecentScore")}`;
            return { ...acc, isAlive: false };
          }

          const didEat = acc.foodLocation && acc.foodLocation.id === newHead.id;
          if (didEat) {
            startScore++;
            document.getElementById(
              "score"
            ).innerHTML = `Current Score: ${startScore}`;
          }

          return {
            isAlive: true,
            snake: {
              body: didEat
                ? [...acc.snake.body, newHead]
                : [...acc.snake.body.slice(1), newHead],
              heading: newHeading,
            },
            snakeEvolution: {
              newHead: [newHead],
              oldTail: didEat ? [] : [acc.snake.body[0]],
            },
            foodLocation:
              didEat || !acc.foodLocation
                ? this.board.random()
                : acc.foodLocation,
          };
        }, state0),
        startWith(state0),
        takeWhile((gameState) => gameState.isAlive),
        takeUntil(this.destroyed$)
      )
      .subscribe((gameState: GameState) => {
        gameState.snakeEvolution.newHead.forEach((cellLocation) => {
          const rect: {
            x: number;
            y: number;
            width: number;
            height: number;
          } = this.board.getRect(cellLocation);
          const svgRect: SVGRectElement = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect"
          );
          svgRect.setAttribute("x", rect.x.toString());
          svgRect.setAttribute("y", rect.y.toString());
          svgRect.setAttribute("rx", "4");
          svgRect.setAttribute("ry", "4");
          svgRect.setAttribute("width", rect.width.toString());
          svgRect.setAttribute("height", rect.height.toString());
          svgRect.setAttribute("id", cellLocation.id);
          svgRect.setAttribute("class", "snake");

          this.svg.appendChild(svgRect);
        });

        gameState.snakeEvolution.oldTail.forEach((cellLocation) => {
          this.svg.getElementById(cellLocation.id).remove();
        });

        const food: SVGRectElement = this.svg.getElementById(
          "food"
        ) as SVGRectElement;
        if (food) {
          if (
            !gameState.foodLocation ||
            gameState.foodLocation.id !== food.getAttribute("id")
          ) {
            food.remove();
          }
        }

        if (gameState.foodLocation) {
          const rect: {
            x: number;
            y: number;
            width: number;
            height: number;
          } = this.board.getRect(gameState.foodLocation);
          const svgRect: SVGRectElement = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect"
          );
          svgRect.setAttribute("x", rect.x.toString());
          svgRect.setAttribute("y", rect.y.toString());
          svgRect.setAttribute("rx", "500");
          svgRect.setAttribute("ry", "500");
          svgRect.setAttribute("width", rect.width.toString());
          svgRect.setAttribute("height", rect.height.toString());
          svgRect.setAttribute("id", "food");

          this.svg.appendChild(svgRect);
        }
      });
  }

  abandon() {
    this.destroyed$.next();
    while (this.svg.childNodes.length > 0) {
      this.svg.childNodes[0].remove();
    }
  }
}
