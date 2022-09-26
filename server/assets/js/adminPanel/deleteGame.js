async function deleteGame(elem){
    //confirm alert function
    let confirmation = confirm("Are you sure?");
    if (confirmation){
        //get the object id
        let gameElem = elem.parentElement.parentElement;
        let objectId = gameElem.dataset.objectId;
        //call the delete api 
        let request = await fetch(`/api/games/${objectId}`,{
            method:"DELETE"
        })
        //wait for a response then depending on the status code show an alert
        if (request.status === 200){
            //delete the elem
            gameElem.remove();
        }else if (request.status === 400){
            alert("Bad Request");
        }else if (request.status === 404){
            alert("Not Found");
        }else if (request.status === 401){
            alert("unauthorized (reload the page)")
        }else{
            alert("unknown error");
        }

    }
}