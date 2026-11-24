const preparationMs = 7000;
const $=id=>document.getElementById(id);
const ctx=$("figure").getContext("2d");
const progress=$("progress");
let sequence = [];
let steps = [];
let originName = "";
let shuffle = null;
function isTwist(id) { return id === 6 || id === 10; }
function configureSession(items, name) {
  sequence = items;
  originName = name;
  steps = items.flatMap(({family,variant},number)=>{
    const group=families[family], choice=group.variants[variant];
    return (group.side ? ["left","right"] : [""]).map(side=>({
      id:choice.model, family, choice, number, side,
      seconds:isTwist(choice.model) ? (side==="left" ? twistTiming.returnEnd : twistTiming.end-twistTiming.liftEnd) : choice.seconds
    }));
  });
  progress.replaceChildren(...items.map(()=>document.createElement("i")));
}
let index=0, mode="intro", remaining=0, deadline=0;
const reduced=matchMedia("(prefers-reduced-motion: reduce)");
function line(path,far=false){
  ctx.lineWidth=far?3.7:4.5;ctx.strokeStyle=far?"#979797":"#f5f5f5";ctx.stroke(new Path2D(path));
}
function head(x,y){ctx.fillStyle="#000";ctx.strokeStyle="#f5f5f5";ctx.lineWidth=3.8;ctx.beginPath();ctx.ellipse(x,y,8,9,-.1,0,Math.PI*2);ctx.fill();ctx.stroke();}
function draw(id,flip,t=0,setup=false,seconds=30){
  let caption;
  ctx.setTransform(2,0,0,2,0,0);ctx.clearRect(0,0,360,210);
  ctx.lineCap="round";ctx.lineJoin="round";
  const ground=ctx.createLinearGradient(42,0,318,0);
  ground.addColorStop(0,"#000");ground.addColorStop(.5,"#585858");ground.addColorStop(1,"#000");
  ctx.fillStyle=ground;ctx.fillRect(42,164,276,.8);
  ctx.save();if(flip && id!==3 && !isTwist(id)){ctx.translate(360,0);ctx.scale(-1,1);}
  const reach=setup?0:ease(t/3)*ease((seconds-t)/3);
  if(typeof id==="string"){
    caption=catalogPose(id,t,setup,seconds);
  } else if(id===0){
    const hip=[172+6*reach,108+5*reach], shoulder=[177+6*reach,64+5*reach];
    limb([hip,[142,155],[101,157],[95,161]],true);
    limb([hip,[220,114],[222,158],[236,160]]);
    limb([hip,shoulder,[shoulder[0]+1,shoulder[1]-8]]);
    limb([shoulder,[188+3*reach,93],[214,108]],true);limb([shoulder,[186+3*reach,99],[208,109]]);
    head(shoulder[0]+2,shoulder[1]-18);
  } else if(id===1){
    caption = elephantWalk(t, setup);
  } else if(id===2){
    line("M179 141 L143 149 L102 157 L98 148",true);
    line("M179 141 L218 150 L259 157 L262 148");
    const sy=101+9*reach;limb([[179,139],[183,sy]]);head(183,sy-13);
    limb([[180,sy],[160,127+7*reach],[149,143+9*reach]],true);limb([[184,sy],[200,127+7*reach],[209,143+9*reach]]);
  } else if(id===3){
    caption = figureFour(t, setup, flip);
  } else if(id===4){
    line("M164 104 L154 154 L111 155 L105 159",true);
    line("M164 104 L166 158 L121 159 L115 162");
    const sy=119+20*reach;limb([[164,104],[212,sy],[221,sy+3]]);head(232,sy+4);
    limb([[211,sy],[241,143+6*reach],[267,155],[278,155]]);
  } else if(id===11) {
    caption=raisedPancake(t,setup);
  } else if(id===12) {
    caption=reachingLunge(t,setup);
  } else if(id===7) {
    caption = wallAngel(t,setup);
  } else {
    caption = seatedMotion(id===9?5:id===10?6:id, t, setup, id===9||id===10,flip);
  }
  ctx.restore();
  return caption;
}
let audioContext;
let soundEnabled = true;
let pausedPhase;
let activeSince;
let elapsedMs = 0;
const endings = ["You're all stretched out!", "Be born again!", "Go enjoy those freshly unfolded limbs."];
function stopSessionClock() {
  if (activeSince !== undefined) {
    elapsedMs += performance.now() - activeSince;
    activeSince = undefined;
  }
}
function sessionDuration() {
  const seconds = Math.round(elapsedMs / 1000);
  return Math.floor(seconds / 60) + "m " + seconds % 60 + "s";
}
function enableAudio() {
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!soundEnabled || !Audio) return;
  try {
    audioContext ??= new Audio();
    if (audioContext.state !== "running") audioContext.resume().catch(() => {});
  } catch { /* The visual countdown works independently. */ }
}
function chime(notes) {
  if (!soundEnabled || audioContext?.state !== "running") return;
  notes.forEach((frequency, index) => {
    const start = audioContext.currentTime + index * 0.23;
    const tone = audioContext.createOscillator();
    const volume = audioContext.createGain();
    tone.frequency.value = frequency;
    volume.gain.setValueAtTime(0, start);
    volume.gain.linearRampToValueAtTime(0.15, start + 0.015);
    volume.gain.exponentialRampToValueAtTime(0.001, start + 0.32);
    tone.connect(volume);
    volume.connect(audioContext.destination);
    tone.onended = () => { tone.disconnect(); volume.disconnect(); };
    tone.start(start);
    tone.stop(start + 0.34);
  });
}
$("sound").onclick = () => {
  soundEnabled = !soundEnabled;
  $("sound").setAttribute("aria-pressed", String(soundEnabled));
  $("sound").textContent = soundEnabled ? "Sound on" : "Sound off";
  enableAudio();
};
function startPhase(phase, milliseconds) {
  activeSince ??= performance.now();
  mode = phase;
  remaining = milliseconds;
  deadline = performance.now() + milliseconds;
}
function setupTime(step) {
  if (step.side === "right" && isTwist(step.id)) return 0;
  return step.id === 3 && step.side === "right" ? 3000 : preparationMs;
}
function renderFigure() {
  const step = steps[index];
  const phase = mode === "paused" ? pausedPhase : mode;
  if (phase === "done") { draw(6, false, 0, true); return; }
  if (step.id === null) return;
  const setup = phase === "preparing";
  const t = Math.max(0, ((setup ? setupTime(step) : step.seconds * 1000) - remaining) / 1000);
  const poseTime = !setup && isTwist(step.id) && step.side==="right" ? t+twistTiming.liftEnd : t;
  const sample = reduced.matches ? (setup ? 3 : Math.floor(poseTime)) : poseTime;
  const caption = draw(step.id, step.side === "right", sample, setup, step.seconds);
  if (caption && mode !== "paused" && $("foot").textContent !== caption) $("foot").textContent = caption;
}
function clockText() {
  const preparing = mode === "preparing" || (mode === "paused" && pausedPhase === "preparing");
  return (preparing ? "Get ready · " : "") + Math.ceil(remaining / 1000) + "s";
}
function show(){
  const {id,side,choice,number,family}=steps[index];
  $("figure").hidden=false;
  $("finish").hidden=!shuffle || mode==="done";
  $("exit").hidden=(!isUnlocked() && !directoryVisited) || mode==="done" || mode==="intro";
  if (mode!=="preparing" && mode!=="paused") $("insight").hidden=true;
  $("skip").hidden=mode==="intro"||mode==="done";
  $("clock").hidden=!["preparing","running","paused"].includes(mode);
  if(mode==="done"){
    $("label").textContent="PRACTICE COMPLETE";$("title").textContent="Congrats!";
    $("cue").textContent="You took " + sessionDuration() + ". " + endings[Math.floor(Math.random() * endings.length)];$("action").textContent="Explore the stretch index";
  } else if(mode!=="intro"){
    $("label").textContent="MOVEMENT "+String(number+1).padStart(2,"0")+" / "+String(sequence.length).padStart(2,"0")+(side?"   ·   "+side.toUpperCase()+" SIDE":"");
    $("title").textContent=families[family].name;$("cue").textContent=typeof choice.cue==="function" ? choice.cue(side) : choice.cue.replaceAll("SIDE",side);
    if (families[family].variants.length>1) $("label").textContent+=" · "+choice.name;
    $("action").textContent=mode==="paused"?"Resume":"Pause";
  }
  $("figure").setAttribute("aria-label",mode==="done"?"Seated stick figure":families[family].name+(side?" — "+side+" side":""));
  $("foot").textContent=mode==="done"?"COMPLETE":mode==="intro"?originName.toUpperCase():mode==="preparing"?"GET INTO POSITION":mode==="paused"?"PAUSED":id===1?"ALTERNATE LEGS":"HOLD";
  $("count").textContent=mode==="intro"?String(sequence.length).padStart(2,"0")+" MOVEMENTS":mode==="done"?"SESSION ENDED":String(number+1).padStart(2,"0")+" / "+String(sequence.length).padStart(2,"0");
  [...progress.children].forEach((p,i)=>p.classList.toggle("on",mode==="done"||(mode!=="intro"&&i<=number)));
  if (shuffle && mode!=="done") {
    $("label").textContent="RANDOM ROUTINE · MOVEMENT "+shuffle.number+(side?" · "+side.toUpperCase()+" SIDE":"");
    updateShuffleClock();
  }
  if(isTwist(id) && side==="right" && mode!=="done") $("cue").textContent="Keep your hands raised. Turn gently to the right, hold, then unwind and lower your arms.";
  $("clock").textContent=clockText();
  renderFigure();
}
function finishSession() {
  stopSessionClock();
  mode="done";
  unlockLibrary();
  chime([523,659,784]);
  show();
}
function activeMilliseconds() {
  return elapsedMs + (activeSince === undefined ? 0 : performance.now()-activeSince);
}
function updateShuffleClock() {
  if (shuffle.limit === Infinity) { $("count").textContent="OPEN-ENDED"; return; }
  const seconds=Math.max(0,Math.ceil((shuffle.limit-activeMilliseconds())/1000));
  $("count").textContent=Math.floor(seconds/60)+":"+String(seconds%60).padStart(2,"0")+" LEFT";
}
function advance() {
  let changedFamily=true;
  if(index===steps.length-1) {
    if(!shuffle){finishSession();return;}
    configureSession([nextShuffleItem(shuffle)],"Random routine");
    index=0;
  } else {
    changedFamily=steps[index+1].number!==steps[index].number;
    index++;
  }
  showInsight(changedFamily);
  const setup=setupTime(steps[index]);
  if(setup)startPhase("preparing",setup);
  else startPhase("running",steps[index].seconds*1000);
  chime([784,523]);
  show();
}
function pausePhase() {
  stopSessionClock();
  pausedPhase = mode;
  remaining = Math.max(0, deadline - performance.now());
  mode = "paused";
  show();
}
$("action").onclick=()=>{
  enableAudio();
  if(mode==="done"){openLibrary();return;}
  if(mode==="intro"){startPhase("preparing", setupTime(steps[index]));}
  else if(mode==="paused"){startPhase(pausedPhase, remaining);}
  else {pausePhase();return;}
  show();
};
$("skip").onclick=advance;
$("finish").onclick=finishSession;
document.addEventListener("visibilitychange",()=>{
  if(document.hidden && ["running","preparing"].includes(mode)) pausePhase();
});
function frame(now){
  if(mode==="running" || mode==="preparing"){
    if(shuffle){
      if(activeMilliseconds()>=shuffle.limit){finishSession();requestAnimationFrame(frame);return;}
      updateShuffleClock();
    }
    remaining=Math.max(0,deadline-now);
    if (!remaining && mode === "preparing") {
      startPhase("running", steps[index].seconds * 1000);
      chime([660]);
      show();
    } else if (!remaining) advance();
    else{
      $("clock").textContent=clockText();
      renderFigure();
    }
  }
  requestAnimationFrame(frame);
}
$("expand").hidden=!document.fullscreenEnabled;
$("expand").onclick=async()=>{
  try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}
  catch{$("expand").hidden=true;}
};
document.onfullscreenchange=()=>{
  const label=document.fullscreenElement?"Exit fullscreen":"Enter fullscreen";
  $("expand").setAttribute("aria-label",label);$("expand").title=label;
};
configureSession(defaultItems(),routines[0].name);
show();
if (isUnlocked() || new URLSearchParams(location.search).get("view")==="directory") openLibrary();
requestAnimationFrame(frame);
