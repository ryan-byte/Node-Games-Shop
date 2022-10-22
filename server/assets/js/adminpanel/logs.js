const logsContainer = document.getElementById("logsContainer");
const viewLogsButton = document.getElementById("viewLogsButton");
const spinner = document.getElementById("spinner");
const limit = 20;

let currentLogDoc = 0;
let totalLogsDocs = 0;
let canLoad = true;

viewLogsButton.addEventListener("click",(ev)=>{
    logsContainer.innerHTML = "";
    currentLogDoc = 0;
    viewLogs(currentLogDoc);
})
viewLogsButton.click();

//detect when the user reached the bottom of the page
window.onscroll = function(ev) {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        if (canLoad){
            if (currentLogDoc < totalLogsDocs){
                currentLogDoc += limit;
                console.log("load more content currentlogdoc: "+currentLogDoc);
                viewLogs(currentLogDoc);
            }
        }
    }
};

//main function
async function viewLogs(start = 0){
    canLoad = false;
    spinnerStatus(false);
    disableViewLogsButton(true);
    try{

        const request = await fetch(`/api/logs?start=${start}&limit=${limit}`);
        requestLogs_statusCodeOutput(request.status);
        const jsonData = await request.json();

        totalLogsDocs = jsonData.counts;
        showLogs(jsonData.logs);
    }catch (err){
        if (! err instanceof SyntaxError){
            newAlert_danger("unknown error");
            console.error(err);
        }
    }
    spinnerStatus(true);
    disableViewLogsButton(false);
    canLoad = true;
}

//feedback functions
function requestLogs_statusCodeOutput(status){
    if (status === 502){
        newAlert_danger("bad gateway");
    }
}
function showLogs(logsList){
    logsList.forEach(logData => {
        let tr = document.createElement("tr");
        let date = new Date(logData.timeStamp * 1000);
        tr.innerHTML = `
        <td colspan="4">${logData.username}</td>
        <td colspan="4">${logData.action}</td>
        <td colspan="1">${date.toLocaleDateString("en-GB")} ${date.toLocaleTimeString("en-GB")} </td>
        `;
        logsContainer.append(tr);
    });
}

//utils functions
function disableViewLogsButton (bool){
    viewLogsButton.disabled = bool;
}
function spinnerStatus(hide = true){
    if (hide){
        spinner.style.display = "none";
    }else{
        spinner.style.display = "block";
    }
}