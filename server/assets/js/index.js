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
    if (request.status === 502){
        spinnerStatus(true);
        itemContainer.innerHTML = "Bad Gateway";
        return;
    }else if (request.status === 204){
        spinnerStatus(true);
        itemContainer.innerHTML = "No Content";
        return;
    }
    const jsonData = await request.json();
    spinnerStatus(true);
    itemContainer.innerHTML = "";
    jsonData.forEach(data => {
        let div = document.createElement("div");
        div.classList.add("border");
        div.classList.add("w-25");
        div.classList.add("p-3");
        renderGame(div,data);
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

function renderGame(div,data){
    div.dataset.title = data.title;
    div.dataset.type = data.type;
    div.dataset.stock = data.stock;
    div.dataset.price = data.price;
    div.innerHTML = `
    <b>Title:</b> ${data.title}<br>
    <b>Type:</b> ${data.type}<br>
    <b>Price:</b> ${data.price}DT<br>
    <b>Stock:</b> ${data.stock}<br>
    `;
}