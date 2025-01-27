
window.onload = onloadFunction; 

const form = {
  container: document.querySelector(".form"), 
  type: document.querySelector("#type"), 
  h2: document.querySelector("#h2Form"),
  playerAmount: document.querySelector("#playerAmount"), 
  btn: document.querySelector("#selectBtn"),    
  bracket: document.querySelector(".bracketForm"), 
}

const range = document.querySelector("#rangeInput");
const textArea = document.querySelector("#playerNamesArea"); 
const main = document.querySelector("main"); 
const teamsContainer = document.querySelector(".teamsContainer");
const thumb = document.querySelector(".thumb"); 
const winnerCard = document.querySelector(".winnerCard"); 
const header = document.querySelector("header"); 

const rangeValue = document.querySelector("#rangeValue"); 
const rangeMessage = document.querySelector("#rangeMessage"); 
const container = document.getElementById('wheelContainer');
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
let wheelRadius = canvas.width / 2;
let centerX = canvas.width / 2;
let centerY = canvas.height / 2;
// for spinner 

// Wheel configuration
let playerTiers = {
  top: [] , 
  middle: [] , 
  bottom: [] , 
}

 


let checkTiers = () => {
  if (playerTiers.top.length > 0) return "top"; 
  else if (playerTiers.middle.length > 0) return "middle"; 
  else return "bottom"; 
}

// Set up the canvas
let step = sessionStorage.step || 1; 
const segmentColors = [' #106fd1',' #5bbcd8',' #227b9a', ' #0e52bb',]; 
 
let segments = checkSegment(null) ; 
let teamPicking = 0; 
let reSpin = false; 
const spinBtn = document.getElementById("spinBtn"); 
const winnerName = document.getElementById("winnerName"); 
const teamPickingH2 = document.getElementById("teamPicking"); 
let numSegments = segments.length;

let currentAngle = 0;
let spinning = false;
let spinVelocity = 0;





// store all the tournament information
let tournament = {
  type: Number(sessionStorage.tournamentType) || 0, 
  amountOfPlayers: Number(sessionStorage.playerAmount) ||0, 
  players:(sessionStorage.players) ? JSON.parse(sessionStorage.players):[], 
  teams: Number(sessionStorage.teams)||0, 
}

function tournamentType (element) {
  const pressedLabelValue = element.innerHTML;
  if (pressedLabelValue === "Duos") tournament.type = 2; 
  else if (pressedLabelValue === "Trios") tournament.type = 3; 
  else if (pressedLabelValue === "Quads") tournament.type = 4; 
  sessionStorage.setItem("tournamentType",tournament.type); 
}

function step1 () {
  // 1.2 check so the value is not 0; 
  if ( tournament.type === 0 ) {
    console.log("Need to chose a Tournament type!"); 
  } else {
  
  sessionStorage.setItem("step","2");   
  step = Number(sessionStorage.step); 
  createHeaderBtn(step); 
  // hide the type form and show amount of players form When next is pressed & remove this function as a click event. 
  form.type.style.display = "none"; 
  // remove event listener
  form.btn.removeEventListener("click", step1); 
  // add new event listerner step 2 
  form.playerAmount.style.display = "flex"; 
  range.setAttribute("step",tournament.type); 
  form.btn.addEventListener("click",step2); 
  
  }
  
}

range.addEventListener("input", (e) =>{
  setThumb(e.target.value,thumb.clientWidth); 
  setCount(e.target.value);
  setEmojy(e.target.value);
  setMessage(e.target.value);  
   
}); 

function setThumb (value,thumbWidth) {
  thumb.style.left = `calc(${value}% - ${thumbWidth/2}px)`; 
}

function setEmojy (value) {
  if (value == 0) thumb.innerHTML = "&#128557"; 
  else if (value > 0 && value <= 10) thumb.innerHTML = "&#128546"; 
  else if (value > 10 && value <= 15) thumb.innerHTML = "&#128530";
  else if (value > 15 && value <= 25) thumb.innerHTML = "&#128527"; 
  else if (value > 25 && value <= 50) thumb.innerHTML = "&#128526"; 
  else if (value > 50 && value <=100) thumb.innerHTML = "&#128525";
}

function setMessage (value) {
  if (value == 0) rangeMessage.innerHTML = "Get some friends"; 
  else if (value > 0 && value <= 10) rangeMessage.innerHTML = "fast tourney.."; 
  else if (value > 10 && value <= 15) rangeMessage.innerHTML = "Can Bean skip dinner?";
  else if (value > 15 && value <= 25) rangeMessage.innerHTML = "Argus is starting to drool.."; 
  else if (value > 25 && value <= 50) rangeMessage.innerHTML = "Few more for a rebirth customs.."; 
  else if (value > 50 && value <=100) rangeMessage.innerHTML = "Time to think about big map customs..";
}

function setCount (value) {
  rangeValue.innerHTML = value; 
}

function checkPlayerAmount (amount, inputValue) {
  if (Number(inputValue) === 0 || Number(inputValue) < amount * 2) return false; 
  else return true; 
}

function step2 () {

  const playerAmount = checkPlayerAmount(tournament.type, range.value); 

  if (playerAmount) {
    form.playerAmount.style.display = "none";
    textArea.style.display = "block"; 
    tournament.amountOfPlayers = Number(range.value);  
    tournament.teams = tournament.amountOfPlayers / tournament.type;

    sessionStorage.step = Number(sessionStorage.step) + 1; 
    sessionStorage.setItem("playerAmount",range.value);
    sessionStorage.setItem("teams", tournament.teams); 
    
    form.btn.removeEventListener("click", step2); 
    form.btn.addEventListener("click",step3); 

  } else {
    console.log("u need to have atleast 2 teams"); 
  }
  
}

function step3 () {
  const playerInfo = collectPlayerInfo(); 
 
  if (!playerInfo) {
     
    textArea.style.display = "none";
    form.btn.removeEventListener("click",step3); 
    form.btn.addEventListener("click",step4);  
    form.bracket.style.display = "flex"; 
    sessionStorage.setItem("players" , JSON.stringify(tournament.players)); 
    sessionStorage.step = Number(sessionStorage.step) + 1;
    step = Number(sessionStorage.step)
    createPlayerCards(); 
    createHeaderBtn(step);  

  } else {
    console.log(playerInfo); 
  }

}

function step4 () {
  const tiersCollected = collectTiers(); 

  if (tiersCollected) {
    form.btn.removeEventListener("click",step4); 
    form.container.style.display = "none"; 
    sessionStorage.players = JSON.stringify(tournament.players); 

    
    sessionStorage.step = Number(sessionStorage.step) + 1;
    step = Number(sessionStorage.step)
    createHeaderBtn(step); 
    changeMain(); 
    sortPlayer();
    createTeamCards(); 

   


    segments = checkSegment(checkTiers());
    numSegments = segments.length;  
    updateTeamPickingH2("spinning"); 
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); 
     
  }
}


function collectPlayerInfo () {
  let textAreaValue = textArea.value; 
  let rowsValue = textAreaValue.split("\n"); 

  // remove the empty rows
  
  let players = rowsValue.filter((line) => {
     
    return line.trim().length > 0; 
  }); 
 
  if (players.length > tournament.amountOfPlayers) return `You need to remove ${players.length - tournament.amountOfPlayers} players `; 
  else if (players.length < tournament.amountOfPlayers) return `You need to add ${tournament.amountOfPlayers - players.length} players`;    

  else {
    players.forEach((player, index) => { 
    
        
      const playerInfo = {
        name: player, 
        id: index, 
        bracket: null, 
      }

      tournament.players.push(playerInfo); 
      });  
   
    return false;  
  }
  
} 

function createPlayerCards () {
  tournament.players.forEach((player)=>{
    const div = document.createElement("div"); 

    const indexInput = document.createElement("input"); 
    indexInput.type = "hidden"; 
    indexInput.value = player.id; 
    
    const tierInput = document.createElement("input"); 
    tierInput.type = "text"; 
    tierInput.disabled = true; 
    tierInput.placeholder = "Click to change tier";  

    const p = document.createElement("p"); 
    p.innerHTML = player.name; 

    div.onclick = function (e) {switchTier(e.target)}; 

    div.appendChild(indexInput); 
    div.appendChild(tierInput);
    div.appendChild(p);  

    form.bracket.appendChild(div); 

  }); 
}

function switchTier (element) {
  const tierInput = element.childNodes[1] 
  let value = tierInput.value; 
  
  
  switch (value) {
    case "Bottom tier": 
      element.style.backgroundColor = " #2C88DD";
      tierInput.value = "Middle tier"; 
    break; 
    case "Middle tier": 
      element.style.backgroundColor =  " #1F73C1"
      tierInput.value = "Top tier"; 
    break; 
    default: 
      element.style.backgroundColor =  " #509BE2"
      tierInput.value = "Bottom tier"
    break; 
    }
}

function collectTiers () {
  const cards = form.bracket.children; 
  let status = true; 

  for (let i = 0; i < tournament.amountOfPlayers; i++) {
    
    const playerIndex = cards[i].children[0].value 
    const playerBracket = cards[i].children[1].value;

    

    if (!playerBracket) {
      console.log("You have not set a value on card: " + cards[i].children[2].innerHTML); 
      status = false; 
      break; 
    } else {

      
      tournament.players[playerIndex].bracket = playerBracket; 

      if(i+1 === tournament.amountOfPlayers) status === true; 
      
    } 
  }

  return status; 
   
}

function resizeCanvas() {
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  const canvasSize = Math.min(containerWidth, containerHeight);
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  centerX = canvas.width / 2;
  centerY = canvas.height / 2;
  wheelRadius = canvas.width / 2;
  drawWheel();
}

// Draw the wheel
function drawWheel() {  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw each segment
  for (let i = 0; i < numSegments; i++) {
    const startAngle = (i * 2 * Math.PI) / numSegments + currentAngle;
    const endAngle = ((i + 1) * 2 * Math.PI) / numSegments + currentAngle;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, wheelRadius, startAngle, endAngle);
    ctx.closePath();

    ctx.fillStyle = segmentColors[i % segmentColors.length];
    ctx.fill();

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Add text to the segment
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((startAngle + endAngle) / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.font = `${wheelRadius / 12}px Arial`;
    ctx.fillText(segments[i], wheelRadius * 0.9, 0);
    ctx.restore();
  }

  // Draw the pointer
  /* ctx.beginPath();
  ctx.moveTo(centerX - 10, centerY - wheelRadius - 10);
  ctx.lineTo(centerX + 10, centerY - wheelRadius - 10);
  ctx.lineTo(centerX, centerY - wheelRadius - 40);
  ctx.closePath();
  ctx.fillStyle = '#000';
  ctx.fill(); */

  // Draw spin button in the center
  /* const buttonRadius = wheelRadius * 0.2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, buttonRadius, 0, 2 * Math.PI);
  ctx.fillStyle = '#000';
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.font = `${buttonRadius / 2}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SPIN', centerX, centerY); */
}

// Detect spin button click
spinBtn.addEventListener('click', (event) => {
  if (reSpin) removePlayers(); 
  const rect = canvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;
  const distance = Math.sqrt(Math.pow(clickX - centerX, 2) + Math.pow(clickY - centerY, 2));

  if (distance <= wheelRadius * 0.2 && !spinning) {
    spinWheel();
  }
});

// Spin the wheel
function spinWheel() {
  if (spinning || numSegments === 0) return;
  spinning = true;
  /* spinVelocity = Math.random() * 0.1 + 0.2; */ // Initial velocity
  spinVelocity = Math.random()  + Math.random() + Math.random() * 0.1 + 0.2; 
  requestAnimationFrame(animateSpin);
}

// Animate the spinning
function animateSpin() {
  if (spinVelocity > 0.001) {
    currentAngle += spinVelocity;
    spinVelocity *= 0.98; // Gradual slowing
    drawWheel();
    requestAnimationFrame(animateSpin);
  } else {
    spinning = false;
    spinVelocity = 0;
    determineWinner();
  }
}

// Determine the winner
async function determineWinner() {
  /* if (numSegments === 0) {
    alert('All segments have been removed. The game is over!');
    return;
  } */
    

  const segmentAngle = (2 * Math.PI) / numSegments;
  const adjustedAngle = (2 * Math.PI - (currentAngle % (2 * Math.PI))) % (2 * Math.PI);
  const winningIndex = Math.floor(adjustedAngle / segmentAngle);



  updateTeamPickingH2("picking"); 
  winnerName.innerHTML = `${segments[winningIndex]}!`; 
  addPlayerToTeam(segments[winningIndex]); 
  await waitTimer(); 
  winnerName.innerHTML = ""; 
  updateTeamPickingH2("spinning");
  
  // test functions 

  


  // Remove the winning segment
  segments.splice(winningIndex,1); 
  /* uppdatePlayerTiers(winningIndex); */
     
 ; 
  numSegments = segments.length;
  
 

  if (numSegments > 0) {
    spinWheel(); // Automatically spin again if segments remain
  } else if (playerTiers.top.length == 0 & playerTiers.middle.length > 0) {  
    currentAngle = 0;
    spinning = false;
    spinVelocity = 0;
    segments = checkSegment("middle"); 
    numSegments = segments.length; 
    spinWheel();  
  } else if (playerTiers.bottom.length > 0) {
    currentAngle = 0;
    spinning = false;
    spinVelocity = 0;
    segments = checkSegment("bottom"); 
    numSegments = segments.length; 
    spinWheel(); 
    
  } else {
   
    currentAngle = 0;
    spinning = false;
    spinVelocity = 0;
    reSpin = true; 
    sortPlayer();  
    segments = checkSegment(checkTiers()); 
    numSegments = segments.length; 
    drawWheel(); 

  }
}

function onloadFunction () {
  for (let i = 1; i <= step; i++) {
    createHeaderBtn(i); 
  }
  

  switch(Number(step)) {
    case 1: 
    form.btn.addEventListener("click", step1)
      form.type.style.display = "flex";
    break; 
    case 2: 
      form.playerAmount.style.display = "flex"; 
      range.setAttribute("step",tournament.type); 
      form.btn.addEventListener("click",step2); 
    break; 
    case 3: 
      form.btn.addEventListener("click",step3); 
      textArea.style.display = "block";
    break;  
    case 4: 
      form.btn.addEventListener("click",step4)
      createPlayerCards();
      form.bracket.style.display = "flex"; 
    break;
    case 5: 
      form.container.style.display = "none"; 
      changeMain(); 
      sortPlayer();
      createTeamCards();
      segments = checkSegment(checkTiers());
      numSegments = segments.length;  
      updateTeamPickingH2("spinning"); 
      window.addEventListener('resize', resizeCanvas);
      resizeCanvas(); 
    break; 
  }
  
}

function randomizeTiers (tier) {
  let playersInTier = tier.length; 
  let randomize = 0; 

  while (randomize < playersInTier) {
    if(randomize === 10) {
      break; 
    }
    let randomNr1 = Math.floor(Math.random() * playersInTier); 
    let randomNr2 = Math.floor(Math.random() * playersInTier); 
    let index1 = tier[randomNr1]; 
    let index2 = tier[randomNr2]; 
    tier[randomNr1] = index2; 
    tier[randomNr2] = index1;  
    randomize ++; 

  }
  return tier; 
}

function checkSegment (tier) {
  

  switch(tier) {
    case "top": 
      
      playerTiers.top = randomizeTiers(playerTiers.top); 
      
      return playerTiers.top;  
    
      
    break; 
    case "middle": 
       
      playerTiers.middle = randomizeTiers(playerTiers.middle); 
      
      return playerTiers.middle;  
    break; 
    case "bottom":  
       
      playerTiers.bottom = randomizeTiers(playerTiers.bottom); 
      
      return playerTiers.bottom;       
    break;   
    default:
      return []; 
    break; 
  }
  
}

function updateTeamPickingH2 (status) {

  switch(status) {
    case "spinning": 
      teamPicking = (teamPicking ==  tournament.teams) ? 1 : teamPicking = teamPicking + 1;
      teamPickingH2.innerHTML = `Team ${teamPicking} spinning`;
    break; 
    case "picking": 
      teamPickingH2.innerHTML = `Team ${teamPicking} got`;
    break; 
  }
   
    
  
}

function waitTimer () {
  return new Promise  ((resolve) => {
    setTimeout(() =>{
      resolve("resolved"); 
    }, 1000); 
  })
}

function createTeamCards () { 
  for (let i = 1; i <= tournament.teams; i++) {
    const card = document.createElement("div"); 
    const h2 = document.createElement("h2"); 
    h2.innerHTML = `Team ${i}`; 
    card.appendChild(h2); 
    teamsContainer.appendChild(card);  
  }
  
}

function addPlayerToTeam (player) {
  const p = document.createElement("p"); 
  p.innerHTML = player; 
  const card = teamsContainer.children[teamPicking-1]; 
  card.appendChild(p); 
}

function removePlayers () {
  for (let i = 0; i < tournament.teams; i++) {
    const container = teamsContainer.children[i]; 
    while (container.children.length > 1) {
      container.removeChild(container.lastChild); 
    }
  }
  reSpin = false; 
}

function changeMain () {
  // switch style of main when showing spinner. 
  main.style.display = "grid"; 
  container.style.display = "flex"; 
  teamsContainer.style.display = "flex"; 
  winnerCard.style.display = "flex"; 
}

function sortPlayer () {
  tournament.players.forEach((player) => {
    if (player.bracket === "Top tier") playerTiers.top.push(player.name); 
    else if (player.bracket === "Middle tier") playerTiers.middle.push(player.name);
    else if (player.bracket === "Bottom tier") playerTiers.bottom.push(player.name);
  }); 
}

function createHeaderBtn (step) {

  switch (step) {
      case 1: 
        var button = document.createElement("button"); 
        var input = document.createElement("input"); 
        input.setAttribute("type","hidden"); 
        input.value = step; 
        button.innerHTML = "Tournament Type"; 
        button.appendChild(input); 
        header.appendChild(button); 
        var div = document.createElement("div"); 
        header.appendChild(div); 
      break; 
      case 2:   
        var button = document.createElement("button"); 
        button.innerHTML = "Amount Of Players"; 
        header.appendChild(button); 
        var div = document.createElement("div"); 
        header.appendChild(div); 
      break; 
      case 3: 
        var button = document.createElement("button"); 
        button.innerHTML = "Player Names"; 
        header.appendChild(button); 
        var div = document.createElement("div"); 
        header.appendChild(div); 
      break; 
      case 4:
        var button = document.createElement("button"); 
        button.innerHTML = "Player Tiers"; 
        header.appendChild(button); 
        var div = document.createElement("div"); 
        header.appendChild(div); 
      break;  
      case 5: 
        var button = document.createElement("button"); 
        button.innerHTML = "Wheel"; 
        header.appendChild(button); 
      break; 
    }  
  
}












 



















