const searchButton = document.getElementById("search");
const itemContainer = document.getElementById("itemContainer");

searchButton.addEventListener("click",(ev)=>{
    spinnerStatus(false);
    getAllgames();
})

async function getAllgames(){
    const request = await fetch("/api/games");
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

