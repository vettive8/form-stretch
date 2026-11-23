function ease(value) {
  const x = Math.max(0, Math.min(1, value));
  return x * x * (3 - 2 * x);
}
function mix(a, b, amount) { return a + (b - a) * amount; }
function limb(points, far = false) {
  line(points.map(([x,y], i) => (i ? "L" : "M") + x + " " + y).join(" "), far);
}
// Side-view landmarks manually mapped from Kit Laughlin's Elephant Walk
// demonstration (Fu01tG0aYiM). Far joints are offset for leg visibility.
// The alternating and bilateral poses interpolate between the observed landmarks.
const walkPoses = {
  standing: {hip:[163,86], knee:[163,121], farKnee:[177,119], shoulder:[165,44], head:[166,29], elbow:[168,70], wrist:[167,94]},
  soft: {hip:[153,88], knee:[172,122], farKnee:[184,119], shoulder:[188,109], head:[200,119], elbow:[192,133], wrist:[195,158]},
  left: {hip:[153,82], knee:[173,120], farKnee:[165,116], shoulder:[188,106], head:[200,117], elbow:[192,132], wrist:[195,158]},
  right: {hip:[153,82], knee:[157,120], farKnee:[184,119], shoulder:[188,106], head:[200,117], elbow:[192,132], wrist:[195,158]},
  both: {hip:[152,78], knee:[156,119], farKnee:[165,115], shoulder:[187,102], head:[198,115], elbow:[192,130], wrist:[195,158]}
};
function drawWalkPose(target, amount) {
  const from = target === "standing" ? walkPoses.standing : walkPoses.soft;
  const to = target === "standing" ? walkPoses.soft : walkPoses[target];
  const pose = {};
  for (const key of Object.keys(from)) {
    pose[key] = from[key].map((v,i)=>mix(v,to[key][i],amount));
  }
  const {hip,knee,farKnee,shoulder,elbow,wrist} = pose;
  limb([hip,[hip[0]+6,hip[1]-3],farKnee,[174,154],[187,154]],true);
  limb([hip,knee,[161,160],[174,160]]);
  limb([shoulder,[elbow[0]+6,elbow[1]-3],[wrist[0]+7,wrist[1]-4]],true);
  line("M"+hip.join(" ")+" Q"+(hip[0]+(shoulder[0]-hip[0])*.5)+" "+(hip[1]+(shoulder[1]-hip[1])*.5-6)+" "+shoulder.join(" "));
  limb([shoulder,pose.head]);
  limb([shoulder,elbow,wrist]);
  head(...pose.head);
}
function elephantWalk(t, setup) {
  if (setup) {
    drawWalkPose("standing",ease((t-.45)/4));
    return "Fold forward · start with both knees soft";
  }
  if (t < 18) {
    const side = Math.floor(t/3)%2 === 0 ? "left" : "right";
    const beat = t%3;
    const extend = ease(beat/.9)*ease((3-beat)/.85);
    drawWalkPose(side,extend);
    return beat > 2.15 ? "Soften both knees" : "Straighten the "+side+" leg";
  }
  const finalHold=t>=24;
  const beat=finalHold ? t-24 : (t-18)%3;
  const extend=ease(beat/.9)*(finalHold ? 1 : ease((3-beat)/.85));
  drawWalkPose("both",extend);
  if (finalHold) return "Both legs · final hold";
  return beat > 2.15 ? "Soften both knees" : "Straighten both legs";
}
// Oblique view of the supine figure four, based on OrthoCarolina's stretching
// guide, page 6. Coordinates run toward the feet, across the mat, and upward.
function figureFour(t, setup, right) {
  const side = right ? -1 : 1;
  const cross = setup ? ease((t - (right ? 0 : 1.4)) / (right ? 2.5 : 4)) : 1;
  const pull = setup ? 0 : ease((t-1)/4) * ease((30-t)/3);
  const point = ([along, across, height]) =>
    [179 + .65*along + .76*across, 142 + .28*along - .24*across - .93*height];
  const between = (a,b,k) => a.map((v,i)=>mix(v,b[i],k));
  const supportingHip = [0,-8*side,0], crossingHip = [0,8*side,0];
  const knee = [mix(29,-8,pull),-10*side,mix(36,47,pull)];
  const ankle = [mix(60,29,pull),-11*side,mix(3,27,pull)];
  const contact = between(supportingHip,knee,.84);
  contact[2] += 2;
  const openKnee = between([29,10*side,36],[mix(18,-3,pull),40*side,mix(24,31,pull)],cross);
  const crossedAnkle = between([60,11*side,3],contact,cross);
  crossedAnkle[2] += 8*Math.sin(Math.PI*cross);
  const crossedToes = crossedAnkle.map((v,i)=>v+[mix(12,0,cross),-10*side*cross,2+4*cross][i]);
  const grip = between(supportingHip,knee,.69);
  function arm(sign) {
    const shoulder = [-46,sign*9,4];
    const elbow = between([-24,sign*14,2],[-28,sign*18,12],pull);
    const hand = between([-1,sign*15,2],[grip[0]-1,grip[1]+sign*4,grip[2]-2],pull);
    limb([shoulder,elbow,hand].map(point),sign===1);
  }
  arm(1);
  limb([supportingHip,knee,ankle,[ankle[0]+13,ankle[1],ankle[2]+1]].map(point),true);
  limb([[-64,0,7],[-46,0,4],[0,0,0]].map(point));
  head(...point([-69,0,8]));
  arm(-1);
  limb([crossingHip,openKnee,crossedAnkle,crossedToes].map(point));
  if (setup) return cross < .01 ? "Lie back · bend both knees" : "Rest ankle across opposite thigh";
  if (t < 5) return "Gently draw the supporting thigh in";
  return t < 27 ? "Hold · let the outer hip relax" : "Lower the supporting foot";
}
const seatedBody = {hipX:179, hipY:143, torso:45, halfShoulders:10, headHeight:59, upperArm:25, forearm:24};
const twistTiming = {liftEnd:1, turnEnd:4, holdEnd:9, returnEnd:12, end:15};
function seatedMotion(id, t, setup, chair=false, right=false) {
  const {hipX,hipY,torso,halfShoulders,headHeight,upperArm,forearm} = seatedBody;
  if (chair) {
    ctx.translate(0,-26);
    line("M151 144 L205 144 M153 144 L153 186 M203 144 L203 186",true);
    limb([[179,143],[159,151],[157,184],[147,185]],true);
    limb([[179,143],[198,151],[200,184],[211,185]]);
  } else {
    limb([[179,143],[143,148],[137,153],[192,161]],true);
    limb([[179,143],[216,149],[220,153],[165,161]]);
  }
  if (id === 5) {
    // Raise the arm, soften the elbow overhead, then lean from the seated pelvis.
    const lift = setup ? 0 : ease(t/4) * ease((30-t)/2);
    const arc = setup ? 0 : ease((t-5)/3) * ease((28-t)/2);
    const bend = setup ? 0 : ease((t-9)/5) * ease((26-t)/3);
    const angle = -0.42 * bend;
    // Rotate each upper-body landmark about the seated pelvis.
    function torsoPoint(x,y) {
      return [hipX+x*Math.cos(angle)-y*Math.sin(angle),hipY+x*Math.sin(angle)+y*Math.cos(angle)];
    }
    const neck = torsoPoint(0,-torso);
    const shoulder = torsoPoint(halfShoulders,-torso);
    const support = torsoPoint(-halfShoulders,-torso);
    const armAngle = mix(1.24,-Math.PI/2,lift) - .12*arc + angle;
    const elbow = [shoulder[0]+upperArm*Math.cos(armAngle),shoulder[1]+upperArm*Math.sin(armAngle)];
    const forearmAngle = armAngle + mix(.66,0,lift) - .84*arc;
    const hand = [elbow[0]+forearm*Math.cos(forearmAngle),elbow[1]+forearm*Math.sin(forearmAngle)];
    limb([support,[mix(155,144,bend),125],[mix(149,132,bend),155]],true);
    limb([[179,143],neck]);limb([support,shoulder]);limb([shoulder,elbow,hand]);
    head(...torsoPoint(0,-headHeight));
    if (setup) return "Sit tall · ground both hips";
    if (t < 4) return "Reach straight up";
    if (t < 5) return "Stay tall · arm overhead";
    if (t < 9) return "Curve the arm overhead · stay tall";
    if (t < 14) return "Slowly bend sideways";
    if (t < 23) return "Hold · breathe easily";
    if (t < 26) return "Come upright slowly";
    return t < 28 ? "Reach straight up again" : "Lower the arm";
  }
  const {liftEnd,turnEnd,holdEnd,returnEnd,end} = twistTiming;
  const lift = setup ? 0 : ease(t/liftEnd) * ease((end-t)/(end-returnEnd));
  const turn = setup ? 0 : ease((t-liftEnd)/(turnEnd-liftEnd)) * ease((returnEnd-t)/(returnEnd-holdEnd));
  const yaw = (right ? -.65 : .65)*turn;
  function project(x,y,depth=0) {
    return [hipX + x*Math.cos(yaw) + depth*Math.sin(yaw),
            hipY - torso + y - .18*x*Math.sin(yaw)];
  }
  function twistArm(side) {
    const shoulder = side*halfShoulders;
    // The reference has separate hands in front of the ribs. The forearms
    // fold forward in depth, so they travel with the chest during rotation.
    const elbowOffset = upperArm*.29;
    const upperReach = Math.sqrt(upperArm**2-elbowOffset**2);
    const upperAngle = mix(.08,.42,lift);
    const elbowX = shoulder + side*elbowOffset;
    const elbowY = upperReach*Math.cos(upperAngle);
    const elbowZ = upperReach*Math.sin(upperAngle);
    const wristOffset = mix(2,-6,lift);
    const forearmReach = Math.sqrt(forearm**2-wristOffset**2);
    const lowerAngle = mix(.3,2.17,lift);
    return [project(shoulder,0), project(elbowX,elbowY,elbowZ),
            project(elbowX+side*wristOffset,elbowY+forearmReach*Math.cos(lowerAngle),
                    elbowZ+forearmReach*Math.sin(lowerAngle))];
  }
  limb([[hipX,hipY],project(0,0)]);
  limb([project(-halfShoulders,0),project(halfShoulders,0)]);
  limb(twistArm(1),true);
  limb(twistArm(-1));
  head(hipX,hipY-headHeight);
  if (setup) return "Sit tall · face forward";
  if (t < liftEnd) return "Lift both hands in front of your chest";
  if (t < turnEnd) return "Gently turn your chest";
  if (t < holdEnd) return "Hold · breathe easily";
  return t < returnEnd ? "Return slowly to center" : "Lower your arms";
}
function wallAngel(t,setup) {
  const lift = setup ? 0 : (1-Math.cos(2*Math.PI*(t%4)/4))/2;
  limb([[180,105],[163,132],[159,159],[150,160]],true);
  limb([[180,105],[194,132],[198,159],[207,160]]);
  limb([[180,105],[180,62]]);
  for (const sign of [-1,1]) {
    const shoulder=[180+sign*10,62];
    const angle=mix(.16,-1.03,lift);
    const elbow=[shoulder[0]+sign*25*Math.cos(angle),shoulder[1]+25*Math.sin(angle)];
    limb([shoulder,elbow,[elbow[0]+sign*5,elbow[1]-23]],sign<0);
  }
  head(180,47);
  return setup ? "Stand with your back to a wall" : "Rep "+Math.min(10,Math.floor(t/4)+1)+" of 10 · "+(t%4<2?"slide up":"slide down");
}
function raisedPancake(t,setup) {
  // Seated profile, following the elevated straddle at 1:26–1:31.
  const reach=setup?0:ease(t/3)*ease((30-t)/2);
  line("M160 112 L201 112 M170 113 L167 159 M196 113 L200 159",true);
  line("M106 108 L143 108 M113 110 L110 158",true);
  limb([[179,109],[161,129],[149,148],[137,147]],true);
  limb([[179,109],[154,131],[130,157],[118,156]]);
  const shoulder=[181-12*reach,63+3*reach];
  limb([[179,109],shoulder]);
  limb([shoulder,[shoulder[0]-19,88],[shoulder[0]-39,103]]);
  head(shoulder[0]-2*reach,shoulder[1]-13);
  return setup?"Sit on a firm raised seat":"Hinge gently from your hips";
}
function reachingLunge(t,setup) {
  const reach=setup?0:ease(t/3)*ease((30-t)/2);
  limb([[179,110],[142,156],[102,157],[96,161]],true);
  limb([[179,110],[220,115],[222,158],[235,160]]);
  const shoulder=[182-4*reach,72];limb([[179,110],shoulder]);
  limb([shoulder,[194,98],[214,109]],true);
  const angle=mix(1.42,-1.88,reach);
  const elbow=[shoulder[0]+24*Math.cos(angle),shoulder[1]+24*Math.sin(angle)];
  limb([shoulder,elbow,[elbow[0]+22*Math.cos(angle-.14*reach),elbow[1]+22*Math.sin(angle-.14*reach)]]);
  head(shoulder[0],58);
  return setup?"Kneel · face forward":"Reach up within a comfortable range";
}
