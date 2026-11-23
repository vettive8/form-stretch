const moves = [
  {name:"Hip flexor lunge",side:true,cue:s=>"Kneel on your "+s+" knee, with the other foot in front. Keep your back tall and gently shift your hips forward until you feel the front of the kneeling hip."},
  {name:"Elephant walks",cue:()=>"Bend both knees and fold toward your thighs. Rest your hands on the floor or on sturdy blocks. Ease one knee straighter, soften it, then switch. Finish with both together."},
  {name:"Pancake stretch",cue:()=>"Sit tall with your legs comfortably apart and toes pointing up. Hinge forward from the hips until you feel a gentle pull in the inner thighs."},
  {name:"Figure four",side:true,cue:s=>"Lie on your back. Bend both knees. Rest your "+s+" ankle on the opposite thigh, just above the knee. Stay here or hold behind the supporting thigh and gently draw it toward you."},
  {name:"Kneeling lat stretch",cue:()=>"From hands and knees, walk your hands forward. Keep your hips above your knees and ease your chest down as far as feels comfortable."},
  {name:"Seated side bend",side:true,cue:s=>"Sit tall. Lift your "+s+" arm straight up. Soften your elbow and curve your arm overhead while you stay tall. Then lean slowly to the opposite side, keeping your chest facing forward and both sitting bones down."},
  {name:"Seated twist",side:true,seconds:twistTiming.end,cue:s=>"Sit tall. Bend your elbows by your ribs and lift both hands in front of your chest, a little apart. Gently turn to the "+s+", letting your arms follow your chest. Keep your hips grounded and turn only as far as feels comfortable."}
];
const video = seconds => "https://youtu.be/QaKuVOhikaY?t=" + seconds;
const original = seconds => "https://youtu.be/eQHmKJh20_c?t=" + seconds;
const physio = "https://www.worcsacute.nhs.uk/leaflets/stretching-exercises-physiotherapy/";
const seatedGuide = "https://www.nhs.uk/live-well/exercise/sitting-exercises/";
const evidence = [
  ["Regular static stretching can increase range of motion in adults.", "Static stretching dose review", "https://pubmed.ncbi.nlm.nih.gov/39614059/"],
  ["In one six-week hamstring trial, 30-second holds improved knee extension. Doubling each hold added no detectable benefit.", "Hamstring training trial", "https://pubmed.ncbi.nlm.nih.gov/9327823/"],
  ["A six-month office trial found fewer new neck and low-back pain episodes with active breaks or changes of position in high-risk workers.", "Office movement trial", "https://pubmed.ncbi.nlm.nih.gov/33906239/"]
];
// Model keys link each variation to its own movement diagram.
function variation(name, cue, source, model=null, seconds=30) {
  return {name,cue,source,model,seconds};
}
function classic(id, name, time) {
  return variation(name,moves[id].cue,original(time),id,moves[id].seconds||30);
}
const families = [
  {name:"Hip flexor lunge",region:"Lower body",side:true,default:1,variants:[
    variation("Supported lunge","Use a steady support. Kneel on your SIDE knee and put the other foot in front. Keep the pelvis facing forward and shift a little toward the front foot.",video(259),"lungeSupport"),
    classic(0,"Half-kneeling lunge",28),
    variation("Lunge with overhead reach","Settle into a comfortable lunge on your SIDE knee. Reach that arm upward and slightly away, keeping your pelvis facing forward.",video(238),12)]},
  {name:"Elephant walks",region:"Lower body",variants:[classic(1,"Alternating knee extensions",135)]},
  {name:"Pancake",region:"Lower body",default:1,variants:[
    variation("Supported · raised seat","Sit on a firm raised surface, feet supported and legs apart. Reach toward a stable support in front as you hinge gently at the hips.",video(86),11),
    classic(2,"Floor · hands forward",196),
    variation("Deeper · forearm reach","Sit in a comfortable straddle and hinge forward. Rest on forearms only if that range is already comfortable; support them higher if needed.",video(94),"pancakeLow")]},
  {name:"Figure four",region:"Lower body",side:true,default:1,variants:[
    variation("Supported · chair","Sit on a stable chair. Rest your SIDE ankle across the opposite thigh. Stay tall or tip forward slightly. Ease out if the knee hurts.",video(178),"chairFour"),
    classic(3,"Reclined · figure four",288),
    variation("Deeper · half pigeon","Start on hands and knees. Bring your SIDE knee forward, keep that heel close, and extend the other leg behind. Support the front hip and use only a comfortable range.",video(205),"pigeon")]},
  {name:"Lat reach",region:"Upper body",variants:[
    classic(4,"Kneeling · arms long",404),
    variation("Deeper · elbows down","From the kneeling reach, rest the elbows on the mat. Bring your hands together and bend the elbows within your comfortable range.",original(451),"latElbows")]},
  {name:"Seated side bend",region:"Spine",side:true,variants:[
    classic(5,"Floor · overhead arc",483),
    variation("At your desk · chair","Sit tall on a stable chair with feet grounded. Lift your SIDE arm overhead, soften the elbow, then gently lean away. Keep both sitting bones down.","https://hw.qld.gov.au/physical-activity/seated-side-stretch/",9)]},
  {name:"Seated twist",region:"Spine",side:true,variants:[
    classic(6,"Floor · active turn",573),
    variation("At your desk · chair","Sit tall with feet flat. Raise your hands loosely in front of your chest and turn comfortably to the SIDE. Keep your hips still.",original(573),10,twistTiming.end)]},
  {name:"Chest opening",region:"Upper body",variants:[
    variation("Supported · seated chest opener","Sit upright. Let your arms open beside you, shoulders relaxed. Gently lift the chest and breathe.",seatedGuide,"chestSeat",10),
    variation("Standing · wide grip","Use the linked demonstration for the grip and placement. Start with a wide grip on a belt behind you and gently lift the hands away from your back. Ease out for shoulder or elbow pain.",video(337),"beltWide"),
    variation("Deeper · closer grip","With the same light stick or belt, bring your hands slightly closer only if the wide version already feels easy. Keep the motion smooth.",video(354),"beltClose")]},
  {name:"Wall angels",region:"Upper body",variants:[
    variation("Wall slide · comfortable range","Stand against a wall. Start with elbows bent and hands up. Slide both arms upward and back down within a range where your ribs stay quiet.",video(420),7,40)]},
  {name:"Neck rotation",region:"Spine",side:true,variants:[
    variation("Chair · gentle turn","Sit tall and relax your shoulders. Turn your head slowly to the SIDE within a comfortable range, pause, and return to center.",seatedGuide,"neckTurn",9),
    variation("Supine · pillow-supported turn","Lie on your back with a comfortable head support. Keep the shoulders quiet. Slowly roll your head to the SIDE, pause, and come back to center.",physio,"neckSupine",9),
    variation("All fours · level head turn","Set hands below shoulders and knees below hips. Keep your head in line with your back, chin gently nodded. Slowly turn your head to the SIDE, keeping your shoulders steady. Return to center.","https://www.sira.nsw.gov.au/resources-library/motor-accident-resources/publications/injury-advice-centre/whiplash-neck-exercises/neck-strengthening-exercises","neckKneel",9)]},
  {name:"Calf stretch",region:"Lower body",side:true,variants:[
    variation("Supported · towel","Sit with your SIDE leg extended. Loop a towel around the ball of the foot and gently draw it toward you.",physio,"calfTowel"),
    variation("Standing · wall","Place your hands against a wall. Step the SIDE foot back and keep the heel down as the front knee bends.",physio,"calfWall")]},
  {name:"Quadriceps stretch",region:"Lower body",side:true,variants:[
    variation("Prone · knee bend","Lie on your stomach. Bend the SIDE knee and reach for the ankle if comfortable, keeping the hips supported.",physio,"quadProne"),
    variation("Standing · supported","Hold a stable support and bring your SIDE heel gently toward your seat. Keep the thighs close.",physio,"quadStand")]},
  {name:"Hamstring hinge",region:"Lower body",side:true,variants:[
    variation("Heel on low step","Place your SIDE heel on a low step. With the leg comfortably long, tip forward at the hips until you feel the back of the thigh.",physio,"hamStep")]},
  {name:"Reclined butterfly",region:"Lower body",variants:[
    variation("Floor · bent knees","Lie on your back with knees bent. Bring the soles of your feet together and let the knees open gently.",physio,"butterfly")]},
  {name:"Knee to chest",region:"Spine",variants:[
    variation("Reclined · both knees","Lie on your back and gently draw your knees toward you with your arms. Release slowly.",physio,"kneesChest")]},
  {name:"Forearm stretch",region:"Upper body",side:true,variants:[
    variation("Wrist extension","Reach your SIDE arm forward. With the other hand gently guide the palm back until you feel a light stretch inside the forearm.",physio,"wristExt")]},
  {name:"Reclined trunk rotation",region:"Spine",side:true,variants:[
    variation("Bent knees","Lie on your back, knees bent together. Roll your knees gently toward the SIDE while your shoulders rest on the floor.",physio,"trunkRoll")]},
  {name:"Shoulder elevation",region:"Upper body",side:true,variants:[
    variation("Assisted · overhead reach","Support the SIDE wrist with the other hand. Gently guide the arm overhead within comfortable reach.",physio,"shoulderLift")]},
  {name:"Reclined chest opener",region:"Upper body",variants:[
    variation("Floor · elbows apart","Lie back and support your head with your hands. Start with elbows pointing up. Allow them to open sideways as you breathe.",physio,"chestFloor")]},
  {name:"Elbow extension",region:"Upper body",side:true,variants:[
    variation("Supported · palm up","Support the SIDE wrist, gently turn the palm up and ease the elbow toward straight.",physio,"elbowOpen")]},
  {name:"Full-body reach",region:"Spine",variants:[
    variation("Reclined · long reach","Lie comfortably on your back. Reach both arms overhead within your range and gently move your ankles.",physio,"longReach")]},
  {name:"Front-of-hip stretch",region:"Lower body",side:true,variants:[
    variation("Supported · bed edge","Lie near the edge of a stable bed with the SIDE thigh supported enough to feel secure. Let that leg lower gently, keeping your lower back comfortable.",physio,"bedHip")]},
  {name:"Prone extension",region:"Spine",variants:[
    variation("Forearm support","Lie on your stomach and ease onto your forearms. Keep your pelvis supported and choose a comfortable height.",physio,"pronePress")]},
  {name:"Diagonal neck stretch",region:"Spine",side:true,variants:[variation("Turn, then look down","Sit tall. Turn gently toward the SIDE, then look slightly down toward that armpit. Keep shoulders relaxed. Ease back through center.","https://www.leedsth.nhs.uk/wp-content/uploads/2023/08/Exercise-NASS-Home-exercises-for-axSpA_AS-v2.pdf","neckDiagonal",12)]},
  {name:"Neck side bend",region:"Spine",side:true,variants:[variation("Ear toward shoulder","Sit upright. Tilt your head gently toward the SIDE shoulder while the shoulders stay level. Return slowly.","https://www.nhs.uk/live-well/exercise/flexibility-exercises/","neckTilt",9)]},
  {name:"Neck flexion",region:"Spine",variants:[variation("Gentle forward bend","Sit tall with relaxed shoulders. Slowly lower your chin toward your chest within a comfortable range, then lift back to neutral.","https://www.sfh-tr.nhs.uk/services/msk-together-partnership/self-care/neck-pain/","neckFlex",9)]},
  {name:"Posterior shoulder stretch",region:"Upper body",side:true,variants:[variation("Cross-body reach","Bring your SIDE arm across your chest and support the upper arm gently with the opposite hand. Keep the shoulder relaxed.","https://orthoinfo.aaos.org/en/recovery/rotator-cuff-and-shoulder-conditioning-program/","crossArm")]},
  {name:"Bent-knee calf stretch",region:"Lower body",side:true,variants:[variation("Wall · bent rear knee","Step the SIDE foot back with toes forward. Keep the heel grounded and gently soften both knees.",physio,"calfBent")]},
  {name:"Wall-supported hamstring stretch",region:"Lower body",side:true,variants:[variation("Heel at a doorway","Lie beside a doorway. Rest the SIDE heel on the wall with the other leg along the floor. Ease the supported knee toward straight.","https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/stretching/art-20546848","hamWall")]}
];
const splitGuide = "https://nwga.co.uk/wp-content/uploads/2024/12/Leg-Flexibility-1-1.pdf";
const frontSplit = families.length;
families.push({name:"Supported front split preparation",region:"Lower body",side:true,goalOnly:true,variants:[
  variation("Half split on blocks","Pad your back knee. Place the SIDE heel ahead and rest your hands on sturdy blocks. Shift your hips back until the front leg comfortably lengthens. Keep both hips facing forward.",splitGuide,"halfSplit",24)
]});
const middleSplit = families.length;
families.push({name:"Supported middle split preparation",region:"Lower body",goalOnly:true,variants:[
  variation("Standing straddle with support","Stand on a grippy surface with a sturdy counter in reach. Step into a comfortable wide stance. Keep hands supported, knees soft and in line with your toes. Hinge slightly, then return before stepping in.",splitGuide,"wideStraddle",24)
]});
const routines = [
  {name:"Full body reset",description:"The original seven-movement floor practice.",ids:[0,1,2,3,4,5,6],original:true},
  {name:"Whole-body practice",description:"Your chosen pancake, figure four, lunge, chest opener and lat reach in one session.",ids:[2,3,0,7,4]},
  {name:"Hips and hamstrings",description:"A lunge, a straddle and an outer-hip stretch at your chosen levels.",ids:[0,2,3]},
  {name:"Overhead reach",description:"Open the chest, reach through the lats and finish with wall slides. Have a wall nearby.",ids:[7,4,8]},
  {name:"Screen break",description:"One surprise chair or wall movement. Start it whenever you want a break.",desk:true}
];
