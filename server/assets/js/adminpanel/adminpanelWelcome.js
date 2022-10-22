const leftColumn = document.getElementById("leftColumn");
const rightColumn = document.getElementById("rightColumn");
const centerColumn = document.getElementById("centerColumn");


window.addEventListener("resize",(ev)=>{
    if (window.innerWidth < 1000){
        leftColumn.classList.remove("col");
        rightColumn.classList.remove("col");
        centerColumn.classList.remove("col-5");
        centerColumn.classList.add("col");
    }else{
        leftColumn.classList.add("col");
        rightColumn.classList.add("col");
        centerColumn.classList.add("col-5");
        centerColumn.classList.remove("col");
    }
})