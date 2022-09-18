const searchButton = document.getElementById("search");
const itemContainer = document.getElementById("itemContainer");
const titleInput = document.getElementById("title");

titleInput.addEventListener("keypress",(ev)=>{
    if (ev.key === "Enter"){
        searchButton.click();
    }
})
searchButton.addEventListener("click",(ev)=>{
    spinnerStatus(false);
    getAllgames(titleInput.value);
})

async function getAllgames(title = ""){
    const request = await fetch(`/api/games/${title}`);
    if (request.status === 404){
        spinnerStatus(true);
        itemContainer.innerHTML = "Not Found";
        return;
    }else if (request.status === 204){
        spinnerStatus(true);
        itemContainer.innerHTML = "";
        return;
    }
    const jsonData = await request.json();
    spinnerStatus(true);
    itemContainer.innerHTML = "";
    jsonData.forEach(data => {
        let div = document.createElement("div");
        div.classList.add("p-5");
        div.innerHTML = `
        <b>Title:</b> ${data.title}<br>
        <b>price:</b> ${data.price}DT<br>
        `
        itemContainer.appendChild(div)
    });
}
function spinnerStatus(hide = true){
    const button = document.getElementById("spinner");
    if (hide){
        button.style.display = "none";
    }else{
        button.style.display = "block";
    }
}

