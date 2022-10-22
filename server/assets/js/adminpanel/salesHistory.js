const salesTableBody = document.getElementById("salesTableBody");
const totalMoneyElem = document.getElementById("totalSalesMoney")
const totalQuantityElem = document.getElementById("totalQuantityElem");
const salesHistoryModalSpinner = document.getElementById("spinner_salesHistory");


//fill Sales history modal
async function fillSalesHistoryModal(elem){
    //show a feedback to the user that the request is loading
    show_spinnerstatus_salesHistoryModal(true);
    //make a request to get all the product sales history
    let gameID = elem.dataset.id;
    let data = await requestSalesHistory(gameID);
    //update the html
    updateSalesHistoryHTML(data);
    //user feedback
    show_spinnerstatus_salesHistoryModal(false);
}
async function requestSalesHistory(gameID){
    const request = await fetch(`/api/games/sales/history/${gameID}`);
    const data = await request.json();
    return data;
}
function updateSalesHistoryHTML(data){
    salesTableBody.innerHTML = "";

    let totalGamesMoney = 0;
    let totalGamesQuantity = 0;

    data.forEach(saleData => {
        let tr = document.createElement("tr");
        let date = new Date(saleData.timeStamp * 1000);
        tr.innerHTML = `
        <td colspan="4">${saleData.unitPrice}DT</td>
        <td colspan="4">${saleData.quantity}</td>
        <td colspan="4">${saleData.total}DT</td>
        <td colspan="4">${date.toLocaleDateString("en-GB")} ${date.toLocaleTimeString("en-GB")}</td>
        `;
        salesTableBody.append(tr);

        totalGamesMoney += saleData.total;
        totalGamesQuantity += saleData.quantity;
    });
    totalQuantityElem.innerHTML = `${totalGamesQuantity}`;
    totalMoneyElem.innerText = `${totalGamesMoney}DT`;
}

function show_spinnerstatus_salesHistoryModal(show = true){
    if (show){
        salesHistoryModalSpinner.style.display = "block";
    }else{
        salesHistoryModalSpinner.style.display = "none";
    }
}