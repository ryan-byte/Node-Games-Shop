

addFooter();
async function addFooter(){
    let footer = await fetch("/html/footer.html");
    let footerHtml = await footer.text();

    document.body.insertAdjacentHTML("afterend",footerHtml);
    document.body.style.minHeight = "100vh"
}