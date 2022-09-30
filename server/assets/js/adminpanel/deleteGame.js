async function deleteGame(elem){
    //confirm alert function
    let confirmation = confirm("Are you sure?");
    if (confirmation){
        //get the object id
        let gameElem = elem.parentElement.parentElement;
        let objectId = gameElem.dataset.objectId;
        //call the delete api 
        let statusCode = await deleteGameApi(objectId);
        //wait for a response then depending on the status code show an alert
        deleteGame_statusCode(statusCode,gameElem);
    }
}
async function deleteGameApi(objectId){
    let request = await fetch(`/api/games/${objectId}`,{
        method:"DELETE"
    })
    return request.status;
}
function deleteGame_statusCode(statusCode,gameElem){
    if (statusCode === 200){
        //delete the elem
        gameElem.remove();
    }else if (statusCode === 400){
        alert("Bad Request");
    }else if (statusCode === 404){
        alert("Not Found");
    }else if (statusCode === 401){
        alert("unauthorized (reload the page)")
    }else{
        alert("unknown error");
    }
}