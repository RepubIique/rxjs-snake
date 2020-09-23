export function highList() {
  // to put in loop
  document.getElementById("scorelist").insertAdjacentHTML(
    "afterbegin",
    `
    <ion-row>
        <ion-col size="8">Dummy Score</ion-col>
        <ion-col>53</ion-col>
    </ion-row>
    `
  );
}

export function endGame() {
  document.getElementById("id01").style.display = "block";
  document.getElementById(
    "lastscore"
  ).innerHTML = `Score: ${localStorage.getItem("mostRecentScore")}`;

  console.log("Dead");
}
