function readSetting(key, fallback) {
  try { return JSON.parse(localStorage.getItem("form.atlas."+key)) ?? fallback; }
  catch { return fallback; }
}
function writeSetting(key,value) {
  try { localStorage.setItem("form.atlas."+key,JSON.stringify(value)); } catch {}
}
let directoryVisited = false;
let unlocked = readSetting("unlocked",false);
const selections = readSetting("variants",{});
let notesEnabled = readSetting("notes",true);
let lastDesk = readSetting("lastDesk",-1);
let lastInsight = -1;
function isUnlocked(){return unlocked;}
function unlockLibrary(){unlocked=true;writeSetting("unlocked",true);}
function chosen(family) {
  const group=families[family], saved=selections[family];
  return Number.isInteger(saved)&&group.variants[saved] ? saved : group.default||0;
}
function originalItems(){return routines[0].ids.map(family=>({family,variant:families[family].default||0}));}
function node(tag,text,cls) {
  const el=document.createElement(tag);
  if(text!==undefined)el.textContent=text;
  if(cls)el.className=cls;
  return el;
}
function link(label,url) {
  const a=node("a",label);a.href=url;a.target="_blank";a.rel="noopener";return a;
}
function button(label,fn,cls) {
  const b=node("button",label,cls);b.onclick=fn;return b;
}
function randomDesk() {
  const options=[{family:5,variant:1},{family:6,variant:1},{family:7,variant:0},{family:8,variant:0},{family:9,variant:0},{family:15,variant:0}];
  const candidates=options.map((_,i)=>i).filter(i=>i!==lastDesk);
  lastDesk=candidates[Math.floor(Math.random()*candidates.length)];
  writeSetting("lastDesk",lastDesk);
  return [options[lastDesk]];
}
function nextShuffleItem(state) {
  if(!state.bag.length) {
    state.bag=families.map((_,i)=>i).filter(i=>!families[i].goalOnly);
    for(let i=state.bag.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [state.bag[i],state.bag[j]]=[state.bag[j],state.bag[i]];
    }
    const last=state.bag.length-1;
    if(state.bag[last]===state.previous) [state.bag[0],state.bag[last]]=[state.bag[last],state.bag[0]];
  }
  const family=state.bag.pop();
  state.previous=family;state.number++;
  return {family,variant:chosen(family)};
}
function shuffleCard() {
  const card=node("article"), form=node("form");
  card.append(node("h3","Random routine"),node("p","Shuffle your saved stretch versions. Choose an active-time limit or finish whenever you like."));
  const label=node("label","Session length "),duration=node("select");
  duration.setAttribute("aria-label","Random routine length");
  for(const minutes of [3,5,10,15])duration.add(new Option(minutes+" minutes",minutes,false,minutes===5));
  duration.add(new Option("Custom minutes","custom"));
  duration.add(new Option("Open-ended","open"));
  const minutes=node("input");minutes.type="number";minutes.required=true;minutes.min="1";minutes.max="1440";minutes.step="1";minutes.value="5";
  minutes.setAttribute("aria-label","Custom minutes");minutes.hidden=true;minutes.disabled=true;
  duration.onchange=()=>{minutes.disabled=minutes.hidden=duration.value!=="custom";};
  const start=node("button","Start shuffle");start.type="submit";
  form.onsubmit=e=>{
    e.preventDefault();
    const value=duration.value==="custom"?minutes.valueAsNumber:Number(duration.value);
    const state={limit:duration.value==="open"?Infinity:value*60000,bag:[],previous:-1,number:0};
    beginItems([nextShuffleItem(state)],"Random routine",state);
  };
  label.append(duration);form.append(label,minutes,start);card.append(form);return card;
}
function beginItems(items,name,shuffleState=null) {
  shuffle=shuffleState;
  enableAudio();
  configureSession(items,name);
  index=0;elapsedMs=0;activeSince=undefined;
  $("library").hidden=true;$("player").hidden=false;
  document.querySelector("footer").hidden=false;
  $("insight").hidden=true;
  startPhase("preparing",setupTime(steps[0]));show();window.scrollTo(0,0);
  $("action").focus({preventScroll:true});
}
function showInsight(eligible) {
  const target=$("insight");target.hidden=true;
  if(!eligible || !notesEnabled || Math.random()>.38)return;
  const options=evidence.filter((_,i)=>i!==lastInsight);
  const item=options[Math.floor(Math.random()*options.length)];lastInsight=evidence.indexOf(item);
  target.replaceChildren(document.createTextNode(item[0]+" "),link("Study",item[2]));target.hidden=false;
}
const videoNotes = {
  0:["3:58–4:32","Lunge, then overhead reach. A higher supported lunge appears at 4:19.",238],
  2:["1:21–1:49","Raised pelvis and supported reach, then floor variations. Contact landmarks show increasing range.",81],
  3:["2:58–3:33","Chair cross and hinge, assisted alternatives, then half pigeon on the floor.",178],
  4:["6:08–6:25","The clip shows four lat variations in a short montage. Watch the demonstration to compare the supports.",368],
  7:["5:33–6:03","Stick behind the shoulders or belt, with grip width changing the demand. The instructor cues a 30-second hold.",333],
  8:["7:00–7:32","Elbows and wrists move toward the wall, then the arms slide upward. Ten slow reps are cued at 7:27. The app uses 2 seconds up and 2 down.",420]
};
const modelTiming = {
  0:"30 seconds per side after setup. The front knee stays bent and the rear knee grounded.",
  1:"18 seconds alternating legs, then three bilateral extensions including a final five-second hold.",
  2:"30 seconds on the mat. The earlier routine demonstrates the floor version at 3:16.",
  3:"30 seconds per side, including the optional draw-in and release. The side change is three seconds.",
  4:"30 seconds with the arms long. The first film introduces this position at 6:44.",
  5:"Four seconds to raise the arm; curve the arm before the torso follows. The whole side lasts 30 seconds.",
  6:"Raise the hands once for one second. Turn for three, hold for five, and unwind for three per side. Cross center directly and lower the arms after the second side.",
  7:"Ten repetitions. The app counts two seconds upward and two downward. The video specifies ten slow reps.",
  9:"Same 30-second arm and torso sequence as the floor side bend at 8:03 in the first film. The chair is a studio adaptation.",
  10:"Same one-second arm lift and five-second hold as the floor twist. Switch sides through center with the hands up. The chair is a studio adaptation.",
  11:"Three seconds into the hinge and two to come upright in a 30-second block. The raised seat is visible around 1:29; the timing is a studio choice.",
  12:"Three seconds to lift the arm, then two to lower at the end of a 30-second block. The overhead reach is visible around 4:17; the timing is a studio choice."
};
const clinicalGuides = {
  0:["Kneeling lunge guide","https://myhealth.alberta.ca/health/AfterCareInformation/pages/conditions.aspx?hwid=bo1646"],
  1:["Elephant-walk demonstration","https://stretchtherapy.net/elephant-walk-best-lower-back-and-hamstring-stretch/"],
  2:["ACE straddle stretch","https://www.acefitness.org/resources/everyone/exercise-library/210/seated-straddle-stretch/"],
  3:["Reclined figure-four photo","https://www.orthocarolina.com/storage/wysiwyg/stretching_guide_1.pdf"],
  5:["Seated side stretch guide","https://hw.qld.gov.au/physical-activity/seated-side-stretch/"],
  6:["NHS chair twist",seatedGuide]
};
function renderEntries() {
  const region=$("region").value;
  const query=$("search").value.trim().toLowerCase();
  $("entries").replaceChildren();
  const sectionNames=new Set();
  families.forEach((group,id)=>{
    if(region!=="All regions"&&group.region!==region)return;
    if (![group.name,group.region,...group.variants.map(v=>v.name)].join(" ").toLowerCase().includes(query))return;
    const heading=id<9?"From the two Stay Flexy films":"More guided stretches";
    if(!sectionNames.has(heading)){$("entries").append(node("h3",heading));sectionNames.add(heading);}
    const entry=node("details"), summary=node("summary"), info=node("div",undefined,"entry-body");
    const name=node("strong",group.name), meta=node("span",group.region+" · "+group.variants.length+" "+(group.variants.length===1?"version":"versions"));
    summary.append(name,meta);entry.append(summary,info);
    const select=node("select");select.setAttribute("aria-label",group.name+" version");
    group.variants.forEach((v,i)=>select.add(new Option(v.name,i,false,i===chosen(id))));
    if(group.variants.length>1)info.append(select);
    const cue=node("p"), details=node("p",undefined,"secondary"),refs=node("div",undefined,"refs");
    const play=button("Practice this stretch",()=>beginItems([{family:id,variant:chosen(id)}],group.name),"primary");
    info.append(cue,details,refs,play);
    function update() {
      const v=group.variants[chosen(id)];
      cue.textContent=typeof v.cue==="function"?v.cue("left"):v.cue.replaceAll("SIDE","left");
      const timing=isTwist(v.model) ? "26s for both sides" : v.seconds+"s"+(group.side?" per side":"");
      details.textContent=timing+" · "+(v.model===null?"Written cues and technique guide":"Guided stick figure");
      refs.replaceChildren(link("Technique reference",v.source));
      if (v.model!==null) refs.append(node("p",(modelTiming[v.model] || (v.seconds===9 ? "Two seconds to enter, five to hold and two to return." : "Studio pacing includes a gradual entry and release within the timed block."))+" Initial setup is seven seconds."));
      if (v.model===9) refs.append(link("Floor movement · 8:03",original(483)));
      if (clinicalGuides[id] && clinicalGuides[id][1]!==v.source) refs.append(link(...clinicalGuides[id]));
      const note=videoNotes[id];
      if(note)refs.append(node("p",note[1]),link("Stay Flexy · "+note[0],video(note[2])));
    }
    select.onchange=()=>{selections[id]=Number(select.value);writeSetting("variants",selections);update();};
    update();$("entries").append(entry);
  });
  appendReferenceEntries(region,query);
  if (!$("entries").childElementCount) $("entries").append(node("p","No matching stretches. Try another name or region."));
}
function showFeatured() {
  const featured=$("featured");
  featured.replaceChildren();
  const sources=[
    {id:"QaKuVOhikaY",title:"Literally 5 Stretches is all you Need",description:"Pancake, figure four, lunge, chest opener and lat reach, with the bonus wall angels.",items:()=>[{family:2,variant:1},{family:3,variant:0},{family:0,variant:2},{family:7,variant:1},{family:4,variant:0},{family:8,variant:0}]},
    {id:"eQHmKJh20_c",title:"What stretches to do in 10 minutes. Follow along.",description:"The daily floor routine. Seven movements from hip flexor lunge to seated twist.",items:originalItems}
  ];
  for(const source of sources){
    const card=node("article"),actions=node("div",undefined,"source-actions");
    actions.append(button("Start guided version",()=>beginItems(source.items(),source.title)),link("Watch original","https://youtu.be/"+source.id));
    const transcript=node("details");transcript.append(node("summary","Read transcript"));
    const lines=node("div",undefined,"transcript-lines");
    transcript.ontoggle=()=>{
      if(!transcript.open||lines.childElementCount)return;
      for(const [seconds,text] of transcripts[source.id]){
        const line=node("p"),stamp=Math.floor(seconds/60)+":"+String(seconds%60).padStart(2,"0");
        line.append(link(stamp,"https://youtu.be/"+source.id+"?t="+seconds),document.createTextNode(" "+text));
        lines.append(line);
      }
    };
    transcript.append(lines);
    const chapters=node("ol",undefined,"chapters");
    for(const [family,time] of filmChapters[source.id]){
      const row=node("li"),stamp=Math.floor(time/60)+":"+String(time%60).padStart(2,"0");
      row.append(link(stamp+" · "+families[family].name,"https://youtu.be/"+source.id+"?t="+time));
      chapters.append(row);
    }
    card.append(node("h3",source.title),node("p",source.description),chapters,actions);if(transcripts[source.id]?.length)card.append(transcript);featured.append(card);
  }
}
const goalPractices = [
  {name:"Front splits", equipment:"Two sturdy blocks and padding for your back knee.", items:[[1,0],[0,1],[frontSplit,0]], prompt:"Which block height let you keep your hips square on each side?"},
  {name:"Middle splits", equipment:"A firm seat and a stable counter.", items:[[13,0],[2,0],[middleSplit,0]], prompt:"What stance width felt comfortable with your hands supported?"},
  {name:"Deeper pancake", equipment:"A firm seat and a mat for the floor versions.", items:[[1,0],[13,0],[2,0]], prompt:"Where could your hands rest while you hinged and breathed easily?"}
];
function showGoals(){
  const shelf=$("goals");
  shelf.replaceChildren();
  for(const goal of goalPractices){
    const card=node("article"),items=goal.items.map(([family,variant])=>({family,variant}));
    card.append(node("h3",goal.name),node("p",goal.equipment));
    const path=node("ol");
    for(const item of items)path.append(node("li",families[item.family].name+" · "+families[item.family].variants[item.variant].name));
    card.append(path);
    if(goal.name==="Deeper pancake"){
      const levels=node("select");levels.setAttribute("aria-label","Pancake finish");
      families[2].variants.forEach((v,i)=>levels.add(new Option(v.name,i)));
      levels.value=String(chosen(2));
      const change=()=>{items[items.length-1].variant=Number(levels.value);path.lastChild.textContent="Pancake · "+levels.selectedOptions[0].text;};
      levels.onchange=change;change();card.append(levels);
    }
    card.append(button("Practice "+goal.name.toLowerCase(),()=>beginItems(items,goal.name)));
    const log=node("details"),label=node("label",goal.prompt),input=node("textarea");
    const key="goal."+goal.name;input.value=readSetting(key,"");input.rows=2;
    input.oninput=()=>writeSetting(key,input.value);
    label.append(input);log.append(node("summary","My practice note"),label);card.append(log);shelf.append(card);
  }
}
function openLibrary() {
  directoryVisited=true;
  stopSessionClock();shuffle=null;mode="library";$("exit").hidden=true;
  $("player").hidden=true;$("library").hidden=false;document.querySelector("footer").hidden=true;
  $("plans").replaceChildren();
  $("indexSize").textContent=families.length+" movement families · "+families.reduce((n,g)=>n+g.variants.length,0)+" animated variations · "+(exerciseReferences.length+clinicalReferences.length+yogaReferences.length)+" illustrated reference entries. Sources sometimes show the same stretch with a different setup.";
  showFeatured();showGoals();
  routines.filter(r=>!r.original).forEach(r=>{
    const tile=node("article");tile.append(node("h3",r.name),node("p",r.description));
    tile.append(button(r.desk?"Pick a desk break":"Begin routine",()=>{
      const items=r.desk?randomDesk():r.original?originalItems():r.ids.map(family=>({family,variant:chosen(family)}));
      beginItems(items,r.name);
    }));$("plans").append(tile);
  });
  $("plans").append(shuffleCard());
  $("region").onchange=renderEntries;$("search").oninput=renderEntries;renderEntries();
  $("reading").replaceChildren();
  const notes=[
    ["What changes with practice?","A single session of static stretching can temporarily increase the range you can reach. Repeated sessions also improved measured flexibility in adults. Those are two different outcomes: reaching farther today does not tell you how much range you will retain.",evidence[0][2]],
    ["How much time?","Across 189 studies, the estimated flexibility benefit levelled off around four cumulative minutes in one session for immediate gains and ten minutes per week for longer-term gains in the muscles trained. These are averages across studies. They do not establish a required dose for each pose.",evidence[0][2]],
    ["A starting schedule","Mayo Clinic suggests warming up first, holding a gentle stretch for about 30 seconds, repeating it two to four times per side, and stretching major muscle groups two to three days a week. Follow the movement-specific guide for dynamic drills.","https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/stretching/art-20546848"],
    ["Before a sprint or heavy lift","Long static holds immediately before a strength or power test sometimes reduced performance. This effect was smaller with short holds. Studies that followed stretching with dynamic activity found no clear performance effect.","https://pubmed.ncbi.nlm.nih.gov/26642915/"],
    ["Blood pressure in the five-stretch film","The claim at 5:01 draws on a small trial in adults with elevated blood pressure. Several blood pressure measures improved more with the stretching program than with brisk walking. The trial tested a specific program over eight weeks. Its results cannot predict the effect of this short routine.","https://pubmed.ncbi.nlm.nih.gov/33338988/"],
    ["Next-day soreness","A Cochrane review found little meaningful difference in next-day soreness when people stretched before or after exercise. Choose a stretch for the range of motion you want to practise.","https://www.cochrane.org/evidence/CD004577_stretching-prevent-or-reduce-muscle-soreness-after-exercise"],
    ["Injury prevention","In a 12-week trial with 1,538 male army recruits, adding six static leg stretches to a warm-up produced no significant reduction in lower-limb injuries. That result describes this protocol and population.","https://pubmed.ncbi.nlm.nih.gov/10694106/"],
    ["What the countdown measures","Setup takes seven seconds. The reclined figure-four change takes three. The seated twist passes through center without a break. Movement blocks include entry and release, so a 30-second block can contain less than 30 seconds at the end position.",original(573)],
    ["Where the reference entries come from","The directory includes named positions, assisted versions and moving drills from Free Exercise DB, plus AAOS illustrated guides and named yoga poses. Foam rolling, jumps and several strength drills were excluded from the source category. Props, joint angles and traditions create further variations.","https://github.com/yuhonas/free-exercise-db"],
    ["Why a 30-second hold?","In a six-week hamstring trial, 30 seconds was effective and a 60-second hold gave no additional measured advantage. That finding does not establish a 10% advantage for every stretch.",evidence[1][2]],
    ["Workday breaks","An office trial studied active breaks and posture changes over six months. Our on-demand desk mode is a way to vary position; that particular sequence has not been tested.",evidence[2][2]],
    ["Following the demonstrations","The two Stay Flexy videos supply the movement examples. The seven-second setup, three-second figure-four change, and wall-angel rep speed are studio timings. The second video recommends ten slow wall angels but cuts between demonstrations.",video(447)],
    ["Choosing a level","Choose a comfortable position after warming up. A prop, a smaller range, or a different setup can suit different bodies. Ease off if a stretch hurts.", "https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/stretching/art-20546848"]
  ];
  for(const [title,body,url] of notes){const block=node("section");block.append(node("h3",title),node("p",body),link("Read the source",url));$("reading").append(block);}
  $("facts").checked=notesEnabled;$("facts").onchange=e=>{notesEnabled=e.target.checked;writeSetting("notes",notesEnabled);};
  document.querySelector('a[href="#research"]').onclick=()=>{$("research").open=true;};
  $("exit").onclick=openLibrary;window.scrollTo(0,0);
}
