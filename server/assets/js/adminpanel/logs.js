const logsContainer = document.getElementById("logsContainer");
const spinner = document.getElementById("spinner");
const username = document.getElementById("username");
const logType = document.getElementById("logType");
const showButton = document.getElementById("showButton");
const limit = 20;

let currentLogDoc = 0;
let totalLogsDocs = 0;
let canLoad = true;


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
//event
showButton.addEventListener("click",(ev)=>{
    logsContainer.innerHTML = "";
    currentLogDoc = 0;
    viewLogs(currentLogDoc,username.value,logType.value);
});
username.addEventListener("keydown",(ev)=>{
    if (ev.key === "Enter"){
        showButton.click();
    }
});
logType.addEventListener("change",(ev)=>{
    showButton.click();
})
showButton.click();

//main function
async function viewLogs(start,username,type){
    canLoad = false;
    disableSearchButton(true);
    spinnerStatus(false);
    try{

        const request = await fetch(`/api/logs?start=${start}&limit=${limit}&username=${username}&type=${type}`);
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
    disableSearchButton(false);
    spinnerStatus(true);
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
function spinnerStatus(hide = true){
    if (hide){
        spinner.style.display = "none";
    }else{
        spinner.style.display = "block";
    }
}
function disableSearchButton (bool){
    showButton.disabled = bool;
}