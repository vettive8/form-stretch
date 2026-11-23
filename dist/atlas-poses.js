// Joint coordinates below describe the movement plane. Keep the head featureless;
// a curved direction marker makes axial rotation visible from the front.
function supportPath(path) {
  ctx.save();ctx.strokeStyle="#636363";ctx.lineWidth=1.6;ctx.stroke(new Path2D(path));ctx.restore();
}
function chairBase() {
  supportPath("M153 113 H204 M158 113 V158 M200 113 V158");
  limb([[179,111],[160,121],[158,158],[148,160]],true);
  limb([[179,111],[198,121],[201,158],[212,160]]);
}
function posture(hip,neck,skull) { limb([hip,neck,skull]);head(...skull); }
function directionArc(x,y,p) {
  if(p<=.01)return;
  ctx.save();ctx.strokeStyle="#aaa";ctx.lineWidth=1.4;
  ctx.beginPath();ctx.ellipse(x,y,17,5,0,1.8,1.8-1.65*p,true);ctx.stroke();
  const a=1.8-1.65*p, tip=[x+17*Math.cos(a),y+5*Math.sin(a)];
  ctx.beginPath();ctx.moveTo(tip[0]-4,tip[1]+2);ctx.lineTo(...tip);ctx.lineTo(tip[0]+1,tip[1]+4);ctx.stroke();ctx.restore();
}
function neckPose(key,p,t,setup) {
  const supine=key==="neckSupine", sagittal=key==="neckFlex";
  ctx.save();
  if(key==="neckKneel") {
    limb([[156,103],[151,151],[114,154]],true);
    limb([[156,104],[159,157],[120,159],[112,161]]);
    limb([[156,103],[206,99],[216,98]]);
    limb([[202,100],[200,128],[199,153],[209,153]],true);
    limb([[207,100],[209,130],[211,158],[223,159]]);
    ctx.save();ctx.translate(225,98);ctx.rotate(.30*p);ctx.scale(1-.2*p,1);head(0,0);ctx.restore();
    directionArc(225,83,p);
  } else if(supine) {
    supportPath("M109 158 Q121 151 135 158");
    limb([[184,148],[210,115],[237,157],[248,158]],true);
    limb([[184,148],[205,116],[226,160],[237,160]]);
    limb([[184,148],[142,149],[132,148]]);
    limb([[144,148],[163,156],[186,155]]);
    ctx.save();ctx.translate(123,146);ctx.rotate(-.28*p);ctx.scale(1-.18*p,1);head(0,0);ctx.restore();
    directionArc(123,135,p);
  } else {
    // Frame the neck and upper torso closely enough for small screens.
    ctx.translate(180,102);ctx.scale(1.55,1.55);ctx.translate(-180,-85);
    chairBase();limb([[179,112],[179,68]]);
    limb([[168,70],[156,88],[162,106]],true);limb([[190,70],[202,88],[195,106]]);
    limb([[168,70],[190,70]]);
    const tilt=key==="neckTilt"?p*.40:0;
    const yaw=key==="neckTurn"||key==="neckDiagonal"?p:0;
    const nod=key==="neckDiagonal"&&!setup?ease((t-2)/2)*ease((12-t)/2):sagittal?p:0;
    const x=179+14*Math.sin(tilt)+3*yaw+5*nod,y=52+3*nod;
    limb([[179,69],[x,y+6]]);
    ctx.translate(x,y);ctx.rotate(tilt+.32*nod);ctx.beginPath();
    ctx.ellipse(0,0,8-1.6*yaw,9,0,0,Math.PI*2);ctx.fillStyle="#000";ctx.fill();ctx.strokeStyle="#f5f5f5";ctx.lineWidth=3.8;ctx.stroke();
    if(yaw)directionArc(0,-14,yaw);
  }
  ctx.restore();
}
function catalogPose(key,t,setup,seconds) {
  const entry=Math.min(3,seconds===9?2:seconds/4), release=seconds<15?2:3;
  const p=setup?0:ease(t/entry)*ease((seconds-t)/release);
  const pt=(x,y,endX,endY)=>[mix(x,endX,p),mix(y,endY,p)];
  if(key.startsWith("neck")) {
    neckPose(key,p,t,setup);
    if(setup)return key==="neckSupine"?"Lie back · support your head":key==="neckKneel"?"Hands and knees · head level":"Sit tall · shoulders relaxed";
    if(t>seconds-release)return "Return slowly to center";
    if(key==="neckDiagonal")return t<2?"Turn gently":t<4?"Lower your gaze toward the armpit":"Hold comfortably";
    return t>entry?"Hold comfortably":({neckTilt:"Tilt toward the shoulder",neckFlex:"Lower the chin gently"})[key]||"Turn the head gently";
  }
  const hip=[179,112], feet=[[179,104],[170,133],[168,159],[157,160]];
  if(key==="halfSplit"){
    const h=pt(179,113,166,111), n=pt(187,74,183,77);
    limb([h,[157,155],[127,157],[119,159]],true);
    limb([h,pt(205,121,201,131),[236,157],[241,148]]);
    posture(h,n,[n[0]+5,n[1]-13]);
    supportPath("M182 119 H200 V160 H182 Z M202 118 H218 V160 H202 Z");
    limb([n,pt(196,95,197,97),[209,116]],true);
    limb([n,pt(179,96,175,97),[190,117]]);
  } else if(key==="wideStraddle"){
    const h=pt(180,108,180,114),n=pt(180,64,180,79);
    for(const sign of [-1,1]){
      limb([h,[180+sign*25,134],[180+sign*47,158],[180+sign*56,159]],sign<0);
    }
    posture(h,n,[180,n[1]-13]);
    supportPath("M138 103 H222 M143 104 V160 M217 104 V160");
    for(const sign of [-1,1]){
      limb([[180+sign*4,n[1]+3],pt(180+sign*15,84,180+sign*16,91),[180+sign*25,101]],sign<0);
    }
  } else if(["chestSeat","crossArm","elbowOpen","shoulderLift","wristExt","chairFour"].includes(key)){
    if(key==="chairFour"){
      supportPath("M145 116 H210 M150 116 V158 M204 116 V158");
      limb([[179,113],[158,126],[157,158],[148,160]],true);
      limb([[179,113],pt(198,126,214,110),pt(200,157,163,119),pt(211,158,153,116)]);
      const n=pt(179,69,173,73);posture(hip,n,[n[0]-1,n[1]-12]);
      limb([n,[190,92],pt(197,111,201,109)]);limb([n,[164,91],[157,115]],true);
    } else {
      chairBase();const n=pt(179,68,179,key==="chestSeat"?65:68);
      posture(hip,n,[179,n[1]-13]);limb([[169,n[1]],[189,n[1]]]);
      if(key==="chestSeat"){
        for(const sign of [-1,1]){
          const a=mix(1.37,.64,p),x=179+sign*10;
          limb([[x,n[1]],[x+sign*24*Math.cos(a),n[1]+24*Math.sin(a)],[x+sign*47*Math.cos(a),n[1]+47*Math.sin(a)]],sign<0);
        }
      } else if(key==="crossArm"){
        limb([[169,68],pt(152,89,180,81),pt(148,112,203,75)],true);
        limb([[189,68],pt(201,92,199,95),pt(195,111,179,81)]);
      } else if(key==="shoulderLift"){
        const a=mix(1.25,-1.42,p),e=[188+25*Math.cos(a),68+25*Math.sin(a)],w=[e[0]+24*Math.cos(a),e[1]+24*Math.sin(a)];
        limb([[188,68],e,w]);limb([[169,69],pt(155,91,180,59),[w[0]-3,w[1]+6]],true);
      } else {
        const elbow=pt(199,91,210,78),wrist=key==="wristExt"?pt(215,85,233,78):pt(207,70,232,81);
        const a=key==="wristExt"?mix(.1,-.95,p):.08;
        limb([[189,68],elbow,wrist,[wrist[0]+9*Math.cos(a),wrist[1]+9*Math.sin(a)]]);
        limb([[169,69],pt(179,92,196,95),[wrist[0]-1,wrist[1]+1]],true);
      }
    }
  } else if(key==="lungeSupport"){
    supportPath("M211 88 H259 M243 89 V160");const h=pt(176,109,185,112),n=[h[0]+1,h[1]-43];
    limb([h,[153,157],[112,158]],true);limb([h,[219,118],[219,158],[232,159]]);
    posture(h,n,[n[0]+1,n[1]-13]);limb([n,[198,85],[224,86]]);
  } else if(key==="pancakeLow"){
    limb([[181,139],[141,148],[101,156],[99,148]],true);limb([[181,139],[220,147],[259,156],[262,148]]);
    const n=pt(181,100,178,130);posture([181,139],n,[n[0],n[1]+mix(-13,7,p)]);
    for(const sign of [-1,1])limb([[n[0]+sign*8,n[1]],pt(181+sign*16,122,181+sign*16,151),[181+sign*22,159]],sign<0);
  } else if(key==="pigeon"){
    const h=pt(180,117,177,134),n=pt(190,77,200,99);
    limb([h,[147,148],[111,157],[99,158]],true);limb([h,[220,151],[187,157],[178,154]]);
    posture(h,n,[n[0]+3,n[1]-13]);limb([n,pt(206,104,215,129),pt(217,128,225,157)]);
  } else if(key==="latElbows"){
    limb([[160,102],[161,156],[121,158],[115,161]]);
    const n=pt(207,113,207,135);posture([160,102],n,[n[0]+14,n[1]+2]);
    limb([n,[235,151],pt(259,151,237,124)]);
  } else if(key==="beltWide"||key==="beltClose"){
    limb(feet,true);limb([[179,104],[190,132],[192,159],[204,160]]);
    posture([179,104],[173,61],[170,47]);
    const width=key==="beltWide"?18:7;
    const left=pt(172-width,103,191-width,89),right=pt(172+width,103,191+width,89);
    limb([[166,62],pt(159,83,165,75),left],true);limb([[180,62],pt(187,84,198,71),right]);
    supportPath("M"+left.join(" ")+" L"+right.join(" "));
  } else if(key==="calfWall"||key==="calfBent"){
    supportPath("M234 48 V162");const h=pt(178,112,190,116),n=pt(187,72,201,77);
    limb([h,pt(158,135,key==="calfBent"?166:157,138),[132,159],[145,159]],true);
    limb([h,pt(206,125,215,127),[204,159],[218,159]]);
    posture(h,n,[n[0]+3,n[1]-13]);limb([n,pt(209,80,215,90),[232,82]]);
  } else if(key==="quadStand"){
    supportPath("M220 85 H247 M234 87 V160");limb(feet,true);
    posture([179,104],[181,62],[181,48]);limb([[181,63],[201,83],[226,84]],true);
    const a=mix(1.72,3.99,p),k=[179,132],w=[179+30*Math.cos(a),132+30*Math.sin(a)];
    limb([[179,104],k,w,[w[0]-7,w[1]-3]]);limb([[178,64],pt(163,86,153,88),pt(159,110,w[0],w[1])]);
  } else if(key==="hamStep"){
    supportPath("M205 131 H254 V160 H205 Z");const n=pt(178,66,199,77);
    limb([[178,110],[162,135],[155,159],[167,160]],true);
    limb([[178,110],[202,118],[229,129],[232,118]]);posture([178,110],n,[n[0]+4,n[1]-12]);
    limb([n,pt(185,92,207,100),pt(189,112,216,117)]);
  } else if(key==="calfTowel"){
    posture([154,144],[149,102],[147,90]);limb([[154,144],[197,150],[237,155],pt(243,146,238,142)]);
    limb([[149,102],[168,125],pt(184,121,177,117)]);
    supportPath("M"+pt(184,121,177,117).join(" ")+" L239 146 L"+pt(184,125,177,121).join(" "));
  } else if(key==="quadProne"||key==="pronePress"){
    const n=pt(149,147,145,key==="pronePress"?117:146);posture([191,150],n,[n[0]-14,n[1]-1]);
    limb([[191,150],[225,153],[257,155],[267,153]],true);
    if(key==="quadProne"){
      const a=mix(.07,-1.96,p),w=[225+33*Math.cos(a),153+33*Math.sin(a)];
      limb([[191,150],[225,153],w,[w[0]-6,w[1]-4]]);
      limb([n,pt(164,135,174,129),pt(185,143,w[0],w[1])]);
    } else {limb([n,[146,156],[118,157]]);limb([[191,150],[223,156],[255,159]]);}
  } else {
    // Supine studies share the same spine, head support and floor plane.
    const h=[177,148], n=[133,148];
    if(key==="bedHip")ctx.translate(0,-35);
    posture(h,n,[118,148]);
    if(key==="butterfly"||key==="trunkRoll"){
      for(const sign of [-1,1]){
        const knee=key==="butterfly"?pt(197+sign*7,113,195+sign*27,141):pt(198+sign*5,112,218+sign*5,140);
        limb([h,knee,[225+sign*4,153],[235+sign*4,153]],sign<0);
      }
      limb([n,[146,158],[163,160]]);
    } else if(key==="kneesChest"){
      for(const sign of [-1,1]){
        const k=pt(203+sign*4,116,156+sign*4,108);
        limb([h,k,pt(222+sign*4,156,191+sign*4,102)],sign<0);
        limb([n,pt(151,155,138,127),pt(172,155,k[0],k[1]+3)],sign<0);
      }
    } else if(key==="chestFloor"){
      limb([h,[200,116],[224,156],[236,157]]);
      for(const sign of [-1,1])limb([n,pt(124+sign*3,120,131+sign*17,147),[119,145]],sign<0);
    } else if(key==="longReach"){
      const a=mix(0,-Math.PI,p);
      limb([n,[133+24*Math.cos(a),148+24*Math.sin(a)],[133+48*Math.cos(a),148+48*Math.sin(a)]]);
      limb([h,[214,151],[251,154],pt(263,154,256,144)]);
    } else if(key==="bedHip"){
      supportPath("M98 155 H184 V195 M108 156 V195");
      limb([h,[154,114],[183,109]],true);limb([n,[141,125],[151,117]],true);
      limb([h,pt(206,139,207,164),pt(230,158,211,193),pt(241,158,222,194)]);
    } else if(key==="hamWall"){
      supportPath("M200 60 V160");limb([h,[211,155],[246,157]],true);
      limb([h,pt(201,114,186,109),[197,71],[198,63]]);limb([n,[151,154],[171,155]]);
    } else throw new Error("Unmapped stretch: "+key);
  }
  return setup?"Get into position":t<entry?"Ease into the stretch":t>seconds-release?"Release slowly":"Hold · breathe easily";
}
