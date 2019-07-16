const DRAW_ATTENUATE=5;
var kValue=0;
var namesArray = [];
var nameIndexNumberClicked;
var currentlyChangeingName = false;
var tables;
var playerList=[];
var playerListSortState={row:"",reversed:false};
var selectedWinner=[];
var roundNumber=1;
var tableCount;
var savedPageState={tables:null};
var playerToSwap=null;
var oldTables=null;
var hadStratifiedRound=false;


function init() {
    document.getElementById("nameToAdd").addEventListener("keyup", function(event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            document.getElementById("submitName").click();
        }
    });
    document.getElementById("nameToAdd").select();
    return;
}

function checkName(name) {
    var i;
    do {
        i=0
        while((i<namesArray.length)&&(namesArray[i]!=name.value))i++;
        if (i<namesArray.length) name.value+=" copy"
    } while (i<namesArray.length);
    return name;
}

function addName(nameInput) {

    nameInput=checkName(nameInput);

    namesArray.push(nameInput.value);
    printNamesList(document.getElementById("namesList"),namesArray,true);
    drawButton();
    document.getElementById("nameToAdd").select();
    return;    
}

function printNamesList(whereToPrint,whatToPrint,isEditable){
    var text="<ol type ='1'>";

    if(isEditable){
        for (var i=0;i<whatToPrint.length;i++) {
            text+=
            ("<li id=\"ListItem"+
             i +
             "\"><div onclick=\"changeName("+
             i +
             ", document.getElementById('nameToChange'))\">"+
             whatToPrint[i] +
             "</div></li>");
        }
    } else {
        for (var i=0;i<whatToPrint.length;i++) {
            text+=
            ("<li>"+
             whatToPrint[i] +
             "</li>");
        }
    }
    
    text+="</ol>"
    whereToPrint.innerHTML = text;
    return;
}

function drawButton() {
    if (namesArray.length>=3 && namesArray.length!=5){
         document.getElementById("namesList").innerHTML+=
         "<button onclick=\"kValue=document.getElementById('kValue').value;createPlayerList();drawNavigation();drawPlayerList();\" type=\"button\">Submit List</button>";
    }
    return;
}

function changeName(nameIndex, newName) {
    if (newName!=null) {
        if(newName.value==""){
            namesArray.splice(nameIndexNumberClicked,1);
            if (nameIndex>nameIndexNumberClicked) {
                nameIndex--;
                nameIndexNumberClicked--;
            }
        } else {
            namesArray[nameIndexNumberClicked]="";
            newName=checkName(newName);
            namesArray[nameIndexNumberClicked]=newName.value;
        }

        printNamesList(document.getElementById("namesList"),namesArray,true);
        drawButton();

        if (nameIndex==nameIndexNumberClicked) {
            document.getElementById("nameToAdd").select();
        } else {
            nameIndexNumberClicked=nameIndex;
            changeName(nameIndex,null);
            return;
        }
    } else {
        document.getElementById("ListItem" + nameIndex).innerHTML=
        "<input id=\"nameToChange\" type=\"text\" value=\"" +
        namesArray[nameIndex] +
        "\"><button id=\"changeNameButton\" type=\"button\" onclick=\"changeName(" +
        nameIndex +
        ", document.getElementById('nameToChange'))\">Change Name</button>";
        document.getElementById("nameToChange").addEventListener("keyup", function(event) {
            event.preventDefault();
            if (event.keyCode === 13) {
                document.getElementById("changeNameButton").click();
            }
        });
        document.getElementById('nameToChange').select();
    }
    nameIndexNumberClicked = nameIndex;
    return;
}

function getTableCount(playerCount) {
    var tables = {
    fourPlayerTables : 0,
    threePlayerTables : 0
    }
    var text = "";
    if(isNaN(playerCount)) text = "Invalid input";
    else if (playerCount%1 != 0) text = "The are no fractions of tables - duh!";
    else if (playerCount < 3) {
        text = "Playercount too small";
    } else if (playerCount == 5) {
        text = "please no";
    } else {
        switch(playerCount%4)
        {
            case 0: tables.fourPlayerTables = playerCount/4; break;
            case 1: tables.fourPlayerTables = (((playerCount-1)/4)-2); break;
            case 2: tables.fourPlayerTables = (((playerCount-2)/4)-1); break;
            case 3: tables.fourPlayerTables = ((playerCount-3)/4); break;
        }
        tables.threePlayerTables = (playerCount-(tables.fourPlayerTables*4))/3;
        text = "4 player tables: " + tables.fourPlayerTables + "<br>3 player tables:" + tables.threePlayerTables;
    }
    if(tables.fourPlayerTables==0&&tables.threePlayerTables==0) document.getElementById("pageBody").innerHTML += (text);
    return tables;
}

function drawNavigation() {
    document.getElementById("pageHeader").innerHTML=
    "<button onclick=\"drawPlayerList('init')\";>Playerlist</button onclick=\"drawTables()\";>" +
    "<button onclick=\"drawTables();\">Tables</button><div id='roundNumber'>Round Number: " + roundNumber + "</div><br>";
}

function updateRoundNumber(){
    document.getElementById("roundNumber").innerHTML="Round Number: " + roundNumber;
    return;
}

function loadPageSavedState(page){
    switch(page) {
        case "tables":
            if (savedPageState.tables!=null)
                document.getElementById("pageBody").innerHTML=savedPageState.tables;
            break;

    }
    return;
}

function drawTablesSwap(){
    if (savedPageState.tables!=null){
        loadPageSavedState("tables");
        return;
    } else {
        let text="<button onclick='commitTables()'>Done</button><br><br>Swap Players if needed:<br>";
        text+="<table class=\"woB\">"
        //for (let i=0;i<tables.length;i++) {
        tables.forEach(function(table,index){
            //swap selector
            text+="<tr class='woB'><td class='woB'>" + // tables+players
            "<table width=\"500\"><tr><th style='background-color:rgb(30,30,30);' colspan=\"" + table.seats + "\">Table #" + (index+1) + "</th></tr><tr>";
            //for (let j=0;j<tables[i].players.length;j++) {
            table.players.forEach(function(player,i){
                text+="<td class='NotSelected' id='player" + player.id + "' onclick='selectSwap("+ index + "," + player.id + ")' style=\"width:" + Math.floor(100/(table.players.length)) + "%;\">" + player.name + "</td>";
            });
            text+="</tr></table></td></tr>";
        });
        text+="</table>";
        text+="<br>-------------------------------------------------------------            <br>"+oldTables;
        savedPageState.tables=text;
        document.getElementById("pageBody").innerHTML=text;
    }
}

function selectSwap(tableNumber,playerID){
    if (playerToSwap==null) {
        playerToSwap={table:tableNumber,id:playerID};
        document.getElementById("player"+playerToSwap.id).setAttribute("class", "Selected");
        savedPageState.tables=document.getElementById("pageBody").innerHTML;
    }
 /*   else if (playerToSwap.table==tableNumber) {
        if(playerToSwap.id!=playerID){
            document.getElementById("player"+playerToSwap.id).setAttribute("class", "NotSelected");
            playerToSwap={table:tableNumber,id:playerID};
            document.getElementById("player"+playerToSwap.id).setAttribute("class", "Selected");
            savedPageState.tables=document.getElementById("pageBody").innerHTML;
        }
    }*/
    else {
        let tNewIndex=tables[tableNumber].players.findIndex(function(a){return a.id==playerID});
        let tOldIndex=tables[playerToSwap.table].players.findIndex(function(a){return a.id==playerToSwap.id});
        let temp=tables[tableNumber].players[tNewIndex];
        //console.log(tables[tableNumber].players[tNewIndex].name+" will be overwritten with: "+tables[playerToSwap.table].players[tOldIndex].name);
        tables[tableNumber].players[tNewIndex]=tables[playerToSwap.table].players[tOldIndex];
        //console.log("after overwrite: "+tables[tableNumber].players[tNewIndex].name);
        tables[playerToSwap.table].players[tOldIndex]=temp;
        savedPageState.tables=null;
        playerToSwap=null;
        drawTablesSwap();
    }
}

function commitTables(){
    savedPageState.tables=null;
    playerToSwap=null;
    roundNumber++;
    updateRoundNumber();
    tables.forEach(function(table,index){
        table.players.forEach(function(player,i){
            player.table=index;
        });
        setPlayedAgainst(table.players);
    });
    drawTables();
}

function drawTables() {
    if (savedPageState.tables!=null){
        loadPageSavedState("tables");
        return;
    }

    if(tables==null){
        if(tableCount==null) tableCount=getTableCount(namesArray.length);
        document.getElementById("pageBody").innerHTML="No Tables created yet.<br>" +
        "The following will be created:<br>"+
        "4-player-tables: " + tableCount.fourPlayerTables + "<br>" +
        "3-player-tables: " + tableCount.threePlayerTables + "<br><br>" +
        "<button onclick='createTables();drawTables();'>Create Tables</button>";
        return;
    }

    let text="# of Tables: " + tables.length + "<br><br><div id='commitButton'>Select Winners:</div>";
    text+="<table class=\"woB\">"
    tables.forEach(function(table,index){
        //winner selector
        text+="<tr class='woB'><td class='woB'>" + // tables+players
        "<table width=\"500\"><tr><th style='background-color:rgb(30,30,30);' colspan=\"" + table.seats + "\">Table #" + (index+1) + "</th></tr><tr>";
        table.players.forEach(function(player,i){
            text+="<td class='NotSelected' id='player" + player.id + "' onclick='selectWinner("+ index + "," + player.id + ")' style=\"width:" + Math.floor(100/(table.players.length)) + "%;\">" + player.name + "</td>";
        });
        text+="</tr>"+"</table></td>"+
        "<td class='woB'><button style='padding: 16px; font-size: 16px; border: none;' class='NotSelected' id='table"+index+"' onclick='selectWinner("+index+",-1)'>draw</button></td></tr>";
    });
    text+="</table>";
    savedPageState.tables=text;
    document.getElementById("pageBody").innerHTML=text;
}

/*
function drawTables() {
    if (savedPageState.tables!=null){
        loadPageSavedState("tables");
        return;
    }

    if(tables==null){
        if(tableCount==null) tableCount=getTableCount(namesArray.length);
        document.getElementById("pageBody").innerHTML="No Tables created yet.<br>" +
        "The following will be created:<br>"+
        "4-player-tables: " + tableCount.fourPlayerTables + "<br>" +
        "3-player-tables: " + tableCount.threePlayerTables + "<br><br>" +
        "<button onclick='createTables();drawTables();'>Create Tables</button>";
        return;
    }

    var text="# of Tables: " + tables.length + "<br><br><div id='commitButton'><br></div>";

    text+="<table class=\"woB\">"
    for (var i=0;i<tables.length;i++) {
        //winner selector
        text+="<tr class='woB'><td style='width:250px;' class=\"woB\">" +
        "<div class=\"dropdown\">" +
        "<button id=\"winSel" + i + "\" class=\"dropbtn\">Select winner</button>" +
        "<div class=\"dropdown-content\">";

        for (var j=0;j<tables[i].players.length;j++) {
            text+="<a href=\"javascript:selectWinner(" + i + "," +tables[i].players[j].id + ")\">" + tables[i].players[j].name + "</a>";
        }
        text+="<a style=\"background-color:#585858;color:#ddd\" href=\"javascript:selectWinner(" + i + ",-1)\" id=\"\">*DRAW*</a>"
        text+="</div></div></td><td class='woB'>" + 
        "<table width=\"500\"><tr><th style='background-color:rgb(30,30,30);' colspan=\"" + tables[i].seats + "\">Table #" + (i+1) + "</th></tr><tr>";

        for (var j=0;j<tables[i].players.length;j++) {
            text+="<td style=\"width:" + Math.floor(100/(tables[i].players.length)) + "%;\">" + tables[i].players[j].name + "</td>";
        }
        text+="</tr></table></td></tr>";
    }
    text+="</table>";
    document.getElementById("pageBody").innerHTML=text;
//    if(selectedWinner!=null) selectedWinner.forEach(updateWinnerButton);
    savedPageState.tables=text;
}
*/
function drawPlayerList(sortBy) {
    if (sortBy==null) sortBy="init";
    var text="Total players: " + playerList.length + "<br>";

    if ((sortBy==playerListSortState.row)&&(sortBy!="init")) playerListSortState.reversed=!playerListSortState.reversed;
    else playerListSortState.reversed=false;
    if (sortBy=="init") sortBy="points";

    playerListSortState.row=sortBy;

    text+="<table class='playerlist' width=\"100%\"><thead style=\"cursor:pointer;background-color:rgb(30,30,30);\"><tr>" +
    "<th onclick=\"drawPlayerList('id')\">id</th>" +
    "<th onclick=\"drawPlayerList('name')\">Name</th>" +
    "<th onclick=\"drawPlayerList('roundsWon')\">Won rounds</th>" +
    "<th onclick=\"drawPlayerList('roundsLost')\">Lost rounds</th>" +
    "<th onclick=\"drawPlayerList('points')\">Points</th>" +
    "<th onclick=\"drawPlayerList('table')\">Table#</th>" +
    "<th onclick=\"drawPlayerList('drop')\">Drop</th>" +
    "<th onclick=\"drawPlayerList('playedAgainst')\">Played Against</th>" +
    "</tr></thead><tbody>";

    switch(sortBy){
        case "id":
            playerList.sort(function(a,b){
                if (playerListSortState.reversed) return (b.id-a.id);
                else return (a.id-b.id);
            });
            break;
        case "name":
            playerList.sort(function(a, b){
                var x = a.name.toLowerCase();
                var y = b.name.toLowerCase();
                if (x < y) {
                    if (playerListSortState.reversed) return 1;
                    else return -1;
                }
                if (x > y) {
                    if (playerListSortState.reversed) return -1;
                    else return 1;
                }
                return (a.id-b.id);
            });
            break;
        case "roundsWon":
            playerList.sort(function(b,a){
                if (a.roundsWon.length==b.roundsWon.length) return(a.id-b.id);
                else { 
                    if (playerListSortState.reversed) return (b.roundsWon.length-a.roundsWon.length);
                    else return (a.roundsWon.length-b.roundsWon.length);
                }
            });
            break;
        case "roundsLost":
                playerList.sort(function(b,a){
                    if (a.roundsLost.length==b.roundsLost.length) return(a.id-b.id);
                    else { 
                        if (playerListSortState.reversed) return (b.roundsLost.length-a.roundsLost.length);
                        else return (a.roundsLost.length-b.roundsLost.length);
                    }
                });
                break;
        case "points":
            playerList.sort(function(b,a){
                if (a.points==b.points) return(a.id-b.id);
                else {
                    if (playerListSortState.reversed) return (b.points-a.points);
                    else return (a.points-b.points);
                }
            });
            break;
        case "drop":
                playerList.sort(function(a,b){
                    if (a.dropped==b.dropped) return(a.id-b.id);
                    else if (a.dropped) {
                        if (playerListSortState.reversed) return -1;
                        else return 1;
                    }
                    else {
                        if (playerListSortState.reversed) return 1;
                        else return -1;
                    } 
                });
            break;
        case "playedAgainst":
            break;
        case "table":
            if (tables==null)break;
            playerList.sort(function(a,b){
                if(a.table==b.table)return (tables[a.table].players.findIndex(function(q){return q.id==a.id})-tables[b.table].players.findIndex(function(q){return q.id==b.id}));
                else if(playerListSortState.reversed) return b.table-a.table;
                else return a.table-b.table;
            });
            break;
    }

    for (var i=0; i<playerList.length;i++) {
        text+=
        ("<tr class='playerlist'><td>" + playerList[i].id +
        "</td><td>" + playerList[i].name +
        "</td><td>" + playerList[i].roundsWon +
        "</td><td>" + playerList[i].roundsLost +
        "</td><td>" + Math.round(playerList[i].points) +
        "</td><td>");
        if(tables==null) text+="N/A";
        else text+=(playerList[i].table+1);
        text+=
        "</td><td>" + playerList[i].dropped +
        "</td><td>";
        "</td>";
        for(let j=0;j<playerList[i].playedAgainst.length;j++) {
            if (playerList[i].playedAgainst[j].countPlayed>0) text+="ID: "+playerList[i].playedAgainst[j].opponentID+"; count: "+playerList[i].playedAgainst[j].countPlayed+"<br>";
        }
        text+="</td>";
        
        text+="</tr>";
    }
    text+="</tbody></table>"
    document.getElementById("pageBody").innerHTML=text;
    //document.getElementById(sortBy).outerHTML="<th onclick=\"\" id=\"" + sortBy + "\">"+document.getElementById(sortBy).innerHTML+"</th>";
}

function createPlayerList() {
    for (let i=0;i<namesArray.length;i++) {
        let x = playerList.push({name:namesArray[i],id:i+1,roundsWon:[],roundsLost:[],points:1000,dropped:false,playedAgainst:[],table:null});
        for (let j=1;j<=namesArray.length;j++) {
            /* if (j!=(i+1)) */ playerList[x-1].playedAgainst.push({opponentID:j,countPlayed:0});
        }
    }
}

function setPlayedAgainst(tablePlayers) {
    for(let k=0;k<tablePlayers.length;k++) {
        for(let l=0;l<tablePlayers.length;l++) {
            if (tablePlayers[k].id!=tablePlayers[l].id) {
                tablePlayers[k].playedAgainst[(tablePlayers[l].id-1)].countPlayed++;
            } 
        }
    }
}
/*
function optimizePairings() {
    let collisions=[];
    let counter=0;
    let sane=true;

    tables.forEach(function(table,tableIndex){
        table.players.forEach(function(player1){
            table.players.forEach(function(player2){
                if(player1.id!=player2.id){
                    let opponent=player1.playedAgainst.find(function(x){
                        return ((x.opponentID==player2.id)&&(x.countPlayed>0));
                    });
                    if (opponent!=undefined){
                        console.log("duplicate pair found!");
                        if(player1.id<player2.id){
                            let collIndex=collisions.findIndex(function(x){
                                return ((x.id==player1.id)&&(x.collWith==player2.id));
                            });
                            if(collIndex==-1){
                                console.log("no prior collision found for "+player1.id+" vs "+player2.id+" | pushing");
                                collisions.push({id:player1.id,collWith:player2.id,count:opponent.countPlayed+1,tableIndex:tableIndex});
                            }
                        }else{
                            let collIndex=collisions.findIndex(function(x){
                                return ((x.id==player2.id)&&(x.collWith==player1.id));
                            });
                            if(collIndex==-1){
                                console.log("no prior collision found for "+player2.id+" vs "+player1.id+" | pushing");
                                collisions.push({id:player2.id,collWith:player1.id,count:opponent.countPlayed+1,tableIndex:tableIndex});
                            }
                        }
                    }
                }
            });
            counter++;
        });
    });

    collisions.sort(function(a,b){
        if(a.id==b.id) return a.collWith-b.collWith;
        return a.id-b.id;
    });

    collisions.forEach(function(player){
        console.log("collision player#"+player.id+" vs. "+ player.collWith +" | count: "+player.count+" | on tableIndex: "+player.tableIndex);
    });

    while ((collisions.length>0)&&(sane)){
        sane=false;
        let i=0;
        let j=0;
        do {
            j=collisions.findIndex(function(x,index){
                return((x.tableIndex!=collisions[i].tableIndex)&&(index>j)&&(checkSwapCollision(x,collisions[j])));
            });
        } while(j!=-1);
    }

    return;
}

function checkSwapCollision(a,b){
    let tableA=tables[a.tableIndex];
    let tableB=tables[b.tableIndex];
    let newCollA=0;
    let newCollB=0;

    tableA.players.forEach(function(player){
        if (player.id!=a.id){
            let opponent=player.playedAgainst.find(function(x){
                return ((x.opponentID==player2.id)&&(x.countPlayed>0));
            });
            if (opponent!=undefined){
                console.log("duplicate pair found!");
                if(player1.id<player2.id){
                    let collIndex=collisions.findIndex(function(x){
                        return ((x.id==player1.id)&&(x.collWith==player2.id));
                    });
                    if(collIndex==-1){
                        console.log("no prior collision found for "+player1.id+" vs "+player2.id+" | pushing");
                        collisions.push({id:player1.id,collWith:player2.id,count:opponent.countPlayed+1,tableIndex:tableIndex});
                    }
                }else{
                    let collIndex=collisions.findIndex(function(x){
                        return ((x.id==player2.id)&&(x.collWith==player1.id));
                    });
                    if(collIndex==-1){
                        console.log("no prior collision found for "+player2.id+" vs "+player1.id+" | pushing");
                        collisions.push({id:player2.id,collWith:player1.id,count:opponent.countPlayed+1,tableIndex:tableIndex});
                    }
                }
            }

        }
    });
}
*/
function assignPlayersToTables(method) {
    let checkList;
    switch (method)
    {
        case "random":
            break;
        case "balanced":
            let text="";
            let tableValue;
            let target;
            checkList=Array.from(playerList);
            
            let average=0;
            checkList.forEach(function(x){
                average+=x.points;
            });
            average=average/checkList.length;
            console.log("Average points: "+average);

            checkList.sort(function(b,a){
                 let aWon=false;
                 let bWon=false;
                // if((a.roundsLost.length>0)&&(a.roundsLost[a.roundsLost.length-1]==roundNumber))aLost=true;
                // if((b.roundsLost.length>0)&&(b.roundsLost[b.roundsLost.length-1]==roundNumber))bLost=true;
                if((a.roundsWon.length>0)&&(a.roundsWon[a.roundsWon.length-1]==roundNumber))aWon=true;
                if((b.roundsWon.length>0)&&(b.roundsWon[b.roundsWon.length-1]==roundNumber))bWon=true;
                // if((!aLost)&&(!aWon)){
                //     if((!bLost)&&(!bWon))return(0.5 - Math.random());
                //         else return 1;
                // } else if((!bLost)&&(!bWon)) return -1;
                if((!aWon)&&(!bWon)&&(a.points==b.points))return(0.5 - Math.random());
                return(a.points-b.points);
            });
//
/* SWAP 3/4 table winners!
//
            let threeWinner=0;
            let fourWinner=0;
            let c=0;
            while ((checkList[c].roundsWon.length>0)&&(checkList[c].roundsWon[checkList[c].roundsWon.length-1]==roundNumber)){
                if(tables[checkList[c].table].seats==3) threeWinner++;
                else fourWinner++;
                c++
            }

            if ((threeWinner>0)&&(fourWinner>0)){
                let i=0;
                let j=threeWinner+fourWinner-1;
                let swapsNeeded;
                let swaps=0;
                if(threeWinner<fourWinner)swapsNeeded=threeWinner;
                else swapsNeeded=fourWinner;
                while (swaps<swapsNeeded){
                    [checkList[i],checkList[j]]=[checkList[j],checkList[i]];
                    swaps++;
                    i++;
                    j--;
                }
            }

*/
/*
            checkList.forEach(function(p){
                console.log(p.name+" "+p.points);
            });
*/
            tables.forEach(function(table){
                tableValue=0;
                table.players=[];
                for(let i=1;i<=table.seats;i++){
                    if(i==1) {
                        tableValue+=checkList[0].points;
                        table.players.push(checkList.shift());
                        //console.log("removing "+table.players[0].name+" from checklist FIRST");
                    } else {
                        target=Number.MAX_SAFE_INTEGER;
                        let rIndex;
                        let placeholder;
                        checkList.forEach(function(lookup,lIndex){
                            let x=tableValue+lookup.points;
                            let y=0;
                            let coll=0;
                            let newerColl;
                            let didCalcFor=-1;

                            y=x/i;
                            x=y-average;
                            x=Math.abs(x);
                            if(x<target)
                            {
                                target=x;
                                rIndex=lIndex;
                                //console.log("New best: "+lookup.name+" div to avg: "+ x +" (" +y+"-"+average+")");
                            } else if(Math.round(Math.round(x)/10)==Math.round(Math.round(target)/10)) {
                                if (didCalcFor==rIndex){
                                    coll=newerColl;
                                    //console.log("already did coll calc");
                                } else {
                                    coll=getCollisions(table,checkList[rIndex].id);
                                    //console.log("Didn't calc for "+checkList[rIndex].name+". Checking now...");
                                }
                                newerColl=getCollisions(table,lookup.id);
                                //console.log("Found equal: "+lookup.name+" div to avg: "+ x +" (" +y+"-"+average+")");
                                if(newerColl<coll){
                                    console.log("Better fit! old coll:" +coll+"; new coll: "+newerColl);
                                    rIndex=lIndex;
                                    didCalcFor=lIndex;
                                }
                            }
                        });
                        placeholder=checkList.splice(rIndex,1);
                        table.players.push(placeholder[0]);
                        tableValue+=placeholder[0].points;
                        //console.log("removing "+placeholder[0].name+" from checklist");
                        //console.log("checklist length:"+checkList.length);
                    }
                }
                console.log("Final table average = " + (tableValue/table.players.length) + "/"+average);
            });
            //optimizePairings();
            break;
        case "stratified":
            let diff=0;
            checkList=Array.from(playerList);
            checkList.sort(function(a,b){
                if(b.points==a.points) return (0.5-Math.random()); // wenn punkte gleich -> random
                else return b.points-a.points;
            });

            tables.forEach(function(table){
                table.players=[];
                for(let i=0;i<=(table.seats-1);i++){
                    let best=0;
                    let placeholder;
                    let k=0;
                    let didCalcFor=-1;
                    let coll=0;
                    let newerColl=0;
                    diff=0;
                    if(k<checkList.length-2){
                        do {
                            k++;
                            diff=Math.round(Math.round(checkList[best].points)/10)-Math.round(Math.round(checkList[k].points)/10);
                            if(diff==0){
                                console.log("similar points found: "+checkList[best].points+ ", "+checkList[k].points);
                                if(didCalcFor==best){
                                    coll=newerColl;
                                }
                                else if(didCalcFor==-1) {
                                    coll=getCollisions(table,checkList[best].id);
                                }
                                newerColl=getCollisions(table,checkList[k].id);
                                didCalcFor=k;
                                if(newerColl<coll){
                                    console.log("Better fit! old coll:" +coll+"; new coll: "+newerColl);
                                    console.log(checkList[k].name+" is better than "+checkList[best].name);
                                    best=k;
                                }
                            }
                        } while(k<(checkList.length-2)&&(diff==0));
                    }
                    placeholder=checkList.splice(best,1);
                    table.players.push(placeholder[0]);
                }
            });
            break;
            
    }
    tables.forEach(function(table){
        table.players.sort(function(p){return (0.5 - Math.random())});
    });
    savedPageState.tables=null;
    drawTablesSwap();
    return;
}

function getCollisions(table, id){
    let collisions=0;
    let checkPlayer=findPlayerByID(id);
    let index=-1;
    table.players.forEach(function(player){
        index=checkPlayer.playedAgainst.findIndex(function(against){
            return against.opponentID==player.id;
        });
        if(index!=-1){
            //console.log(checkPlayer.name+" already played against "+player.name+" "+checkPlayer.playedAgainst[index].countPlayed+" times before.");
            collisions+=checkPlayer.playedAgainst[index].countPlayed;
        }
    });
    //console.log(checkPlayer.name+" has " +collisions+ " collisions on this table");
    return collisions;
}

function createTables() {
    let j=0;
    let i=0;
    let tablePlayers;
    if (tableCount==null) tableCount=getTableCount(namesArray.length);
    tables = [];
    playerList.sort(function(a,b){return 0.5 - Math.random()});
    while (tableCount.fourPlayerTables>i){
        tablePlayers=[];
        for(j;j<(i*4)+4;j++) {
            playerList[j].table=i;
            tablePlayers.push(playerList[j]);
        }
        setPlayedAgainst(tablePlayers);
        tables.push({seats:4,players:Array.from(tablePlayers)});
        i++;
    }
    i=0;
    while (tableCount.threePlayerTables>i){
        tablePlayers=[];
        for(j;j<((i*3)+(tableCount.fourPlayerTables*4))+3;j++) {
            playerList[j].table=tableCount.fourPlayerTables+i;
            tablePlayers.push(playerList[j]);
        }
        setPlayedAgainst(tablePlayers);
        tables.push({seats:3,players:Array.from(tablePlayers)});
        i++;
    }
    savedPageState.tables=null;
    return;
};

function selectWinner(tableNumber, playerID) {
    if (selectedWinner.length==0) {
        for (let i=0;i<tables.length;i++) selectedWinner.push(null);
    }
    if(selectedWinner[tableNumber]!=null){
        if(selectedWinner[tableNumber]==-1) document.getElementById("table"+tableNumber).setAttribute("class", "NotSelected");
        else document.getElementById("player"+selectedWinner[tableNumber]).setAttribute("class", "NotSelected");
    }
    selectedWinner[tableNumber]=playerID;
    if(playerID==-1)document.getElementById("table"+tableNumber).setAttribute("class", "Selected");
    else document.getElementById("player"+playerID).setAttribute("class", "Selected");
    if(!selectedWinner.some(function(a){return a==null;}))
        document.getElementById("commitButton").innerHTML="<button onclick='commitWinners();'>Commit Winners</button>"
    savedPageState.tables=document.getElementById("pageBody").innerHTML;
}

function parseArray(array,index,direction) {
    if((isNaN(direction))||(isNaN(index))) return null;
    direction=Math.floor(direction);
    if((array==null)||(array==undefined)) return null;
    if((index>=array.length)||(index<0)) return null;
    while(direction>0) {
        if((index+1)==array.length) index=0;
        else index++;
        direction--;
    }
    while(direction<0) {
        if(index==0) index=array.length-1;
        else index--;
        direction++;
    }
    return array[index];
}

function findPlayerByID(id){
    return playerList.find(function (player,index){
        return player.id==id;
    });
}

function commitWinners() {
    let newPoints=0;
    let text="Next round should be: "+
    "<button onclick='assignPlayersToTables(\"balanced\")'>balanced</button>"+
    "<button onclick='assignPlayersToTables(\"stratified\")'>stratified</button><br><br>";
    tables.forEach(function(table,index){
        text+="Table #"+(index+1)+":<br>";
        let winnerIndex=table.players.findIndex(function(a){return a.id==selectedWinner[index];});
        //let tableAverage=null;
        let storeNewPoints=[];
        table.players.forEach(function(player,i){
            newPoints=0;
            switch(selectedWinner[index]){
                case -1:
                    /*if (tableAverage==null){
                        tableAverage=0;
                        table.players.forEach(function(p){tableAverage+=p.points});
                        tableAverage/=table.seats;
                        console.log("tableAverage="+tableAverage);
                    }*/
                    newPoints=0;
                    table.players.forEach(function(otherP){
                        if(otherP.id!=player.id){
                            let e=(1/(1+(10**((otherP.points-player.points)/400))));
                            newPoints+=player.points+(kValue*(0.5-e)/DRAW_ATTENUATE);
                            console.log("newPoints="+newPoints);
                        }
                    });
                    newPoints/=(table.seats-1);
                    text+=player.name+" drew. Points: "+player.points;
                    if((player.points-newPoints)<=0) text+=" + ";
                    else text+=" - ";
                    text+=(Math.abs(player.points-newPoints));
                    storeNewPoints[i]=newPoints;
                    text+=" = "+storeNewPoints[i]+"<br>";
                    break;
                case player.id:
                    newPoints=0;
                    table.players.forEach(function(loser){
                        if(loser.id!=player.id){
                            let e=(1/(1+(10**((loser.points-player.points)/400))));
                            //console.log(player.name+" vs. "+loser.name+": E="+e);
                            newPoints+=player.points+(kValue*(1-e));
                        }
                    });
                    newPoints/=(table.seats-1);
                    text+=player.name+" won. Points: "+player.points+" + "+(newPoints-player.points);
                    storeNewPoints[i]=newPoints;
                    text+=" = "+storeNewPoints[i]+"<br>";
                    player.roundsWon.push(roundNumber);
                    break;
                default:
                    let e=(1/(1+(10**((table.players[winnerIndex].points-player.points)/400))));
                    newPoints=player.points+(kValue*(0-e)/3);
                    text+=player.name+" lost. Points: "+player.points+" - "+(player.points-newPoints);
                    storeNewPoints[i]=newPoints;
                    text+=" = "+storeNewPoints[i]+"<br>";
                    player.roundsLost.push(roundNumber);
            }
        });
        storeNewPoints.forEach(function(points,i){
            table.players[i].points=points;
        });
        text+="<br>";
    });

    oldTables="<p>Old tables:</p><br>";
    tables.forEach(function(table,index){
        oldTables+="<p>Table# "+(index+1)+":</p><p>| ";
        table.players.forEach(function(player,i){
            oldTables+=player.name;
            if((player.roundsWon!=null)&&(player.roundsWon[player.roundsWon.length-1]==roundNumber))oldTables+="*";
            oldTables+=" | ";
        });
        oldTables+="</p><p>----------</p>";
    });

    savedPageState.tables=text;
    document.getElementById("pageBody").innerHTML=text;
    selectedWinner=[];
    return; 
}