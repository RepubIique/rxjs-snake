
export function highList(){
    let list = []
    let testObject = {}
    console.log('typeof testObject: ' + typeof testObject);
    localStorage.setItem('testObject', JSON.stringify(testObject));

    // Retrieve the object from storage
    let retrievedObject = localStorage.getItem('testObject');

    console.log('retrievedObject: ', JSON.parse(retrievedObject));

    // to put in loop
    document.getElementById("scorelist").insertAdjacentHTML('afterbegin', `
    <ion-row>
        <ion-col size="8">Dummy Score</ion-col>
        <ion-col>53</ion-col>
    </ion-row>
    `)
}




export function endGame(){
    document.getElementById('id01').style.display='block'
    console.log("Dead")
}

