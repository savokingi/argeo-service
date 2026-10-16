import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// A generic, purpose-built phone cutaway. Every part shares one assembly axis.
// Meshes are authored here; no external model, textures, or remote requests.
const stage = document.querySelector('#phone-stage');
const art = document.querySelector('#device-art');
const motion = matchMedia('(prefers-reduced-motion: reduce)');

function roundedShape(width, height, radius) {
  const x = -width / 2, y = -height / 2, r = Math.min(radius, width / 2, height / 2);
  const shape = new THREE.Shape();
  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

function initializePhone() {
  const renderer = new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute('aria-hidden','true');
  stage.append(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-5,5,5,-5,.1,100);
  camera.position.set(10,-6,17);
  camera.lookAt(0,0,0);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = new RoomEnvironment();
  const environmentTarget = pmrem.fromScene(environment,.04);
  scene.environment = environmentTarget.texture;
  scene.environmentIntensity = .75;
  environment.dispose();
  pmrem.dispose();

  scene.add(new THREE.HemisphereLight(0xe2eeff,0x173354,1.7));
  const key = new THREE.DirectionalLight(0xffffff,3.5);
  key.position.set(-5,7,12);
  key.castShadow = true;
  key.shadow.mapSize.set(2048,2048);
  key.shadow.camera.left = -7;
  key.shadow.camera.right = 7;
  key.shadow.camera.top = 7;
  key.shadow.camera.bottom = -7;
  key.shadow.normalBias = .02;
  key.shadow.bias = -.0002;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xa5caff,2.0);
  fill.position.set(5,-3,5);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff,3);
  rim.position.set(-5,-3,-5);
  scene.add(rim);

  const materials = {
    titanium: new THREE.MeshStandardMaterial({color:0x9ba8bb,metalness:.95,roughness:.24}),
    polished: new THREE.MeshStandardMaterial({color:0xd9e1eb,metalness:1,roughness:.17}),
    frame: new THREE.MeshStandardMaterial({color:0x202c3d,metalness:.8,roughness:.27}),
    black: new THREE.MeshStandardMaterial({color:0x0a111b,metalness:.25,roughness:.38}),
    graphite: new THREE.MeshStandardMaterial({color:0x1c2530,metalness:.4,roughness:.48}),
    board: new THREE.MeshStandardMaterial({color:0x104e42,metalness:.35,roughness:.55}),
    shield: new THREE.MeshStandardMaterial({color:0xa1a8af,metalness:.92,roughness:.36}),
    gold: new THREE.MeshStandardMaterial({color:0xc99645,metalness:.82,roughness:.32}),
    copper: new THREE.MeshStandardMaterial({color:0xbf7131,metalness:.7,roughness:.38}),
    ceramic: new THREE.MeshStandardMaterial({color:0xb6a187,metalness:.15,roughness:.65}),
    lens: new THREE.MeshPhysicalMaterial({color:0x081622,metalness:.55,roughness:.08,clearcoat:1,clearcoatRoughness:.05}),
    lensBlue: new THREE.MeshStandardMaterial({color:0x123552,metalness:.8,roughness:.1}),
  };

  const rig = new THREE.Group();
  rig.rotation.z = -.30;
  scene.add(rig);
  const body = new THREE.Group();
  const electronics = new THREE.Group();
  const battery = new THREE.Group();
  const display = new THREE.Group();
  rig.add(body,electronics,battery,display);

  const geometryCache = new Map();
  function slab(parent,w,h,depth,radius,material,x=0,y=0,z=0,bevel=.012) {
    const cacheKey = [w,h,depth,radius,bevel].join('/');
    let geometry = geometryCache.get(cacheKey);
    if (!geometry) {
      geometry = new THREE.ExtrudeGeometry(roundedShape(w,h,radius),{depth,bevelEnabled:bevel>0,bevelSegments:3,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:14});
      geometry.translate(0,0,-depth/2);
      geometryCache.set(cacheKey,geometry);
    }
    const mesh = new THREE.Mesh(geometry,material);
    mesh.position.set(x,y,z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function box(parent,w,h,d,material,x,y,z) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
    mesh.position.set(x,y,z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function cylinder(parent,radius,depth,material,x,y,z,segments=32) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,depth,segments),material);
    mesh.rotation.x = Math.PI/2;
    mesh.position.set(x,y,z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function trace(parent,points,material,width=.012) {
    const curve = new THREE.CurvePath();
    for(let i=1;i<points.length;i++) curve.add(new THREE.LineCurve3(new THREE.Vector3(...points[i-1]),new THREE.Vector3(...points[i])));
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(2,points.length*2),width,4,false),material);
    parent.add(mesh);
  }
  function label(parent,text,w,h,x,y,z,options={}) {
    const canvas = document.createElement('canvas');
    canvas.width = 768;
    canvas.height = Math.max(96,Math.round(768*h/w));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = options.background || '#1c2530';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = options.color || '#a7b0ba';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${options.bold?'600':'400'} ${options.size || 42}px Arial, sans-serif`;
    text.split('\n').forEach((line,index,lines)=>ctx.fillText(line,canvas.width/2,canvas.height/2+(index-(lines.length-1)/2)*(options.lineHeight||65)));
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(),8);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture,toneMapped:false}));
    mesh.position.set(x,y,z);
    parent.add(mesh);
    return mesh;
  }

  // Machined enclosure, recessed inner tray, antenna bands and real side controls.
  slab(body,3.05,6.22,.22,.42,materials.titanium,0,0,-.13,.025);
  slab(body,2.96,6.13,.07,.39,materials.frame,0,0,.01,.018);
  slab(body,2.81,5.98,.025,.34,materials.black,0,0,.065,.005);
  slab(body,2.91,6.08,.035,.38,materials.polished,0,0,-.256,.012);
  slab(body,2.84,6.01,.02,.36,materials.frame,0,0,-.28,.005);
  [-1.35,1.35].forEach(x=>[-2.85,2.85].forEach(y=>{
    cylinder(body,.045,.026,materials.polished,x,y,.10,16);
    box(body,.045,.008,.003,materials.black,x,y,.117);
    box(body,.008,.045,.003,materials.black,x,y,.117);
  }));
  const sideButton = (x,y,h) => slab(body,.055,h,.11,.025,materials.polished,x,y,-.07,.009);
  sideButton(-1.545,1.12,.56);
  sideButton(-1.545,.32,.56);
  sideButton(1.545,.83,.87);
  [-2.46,2.46].forEach(y=>[-1.527,1.527].forEach(x=>box(body,.015,.05,.20,materials.graphite,x,y,-.1)));
  const port = slab(body,.45,.13,.012,.055,materials.black,0,-3.12,-.12,.004);
  port.rotation.x = Math.PI/2;
  for(let side of [-1,1]) for(let i=0;i<6;i++) {
    const hole = cylinder(body,.025,.016,materials.black,side*(.58+i*.105),-3.13,-.11,12);
    hole.rotation.x = 0;
  }

  // Mainboard lives along the top and right edge, leaving room for the cell.
  slab(electronics,2.46,1.42,.045,.14,materials.board,0,2.12,.11,.005);
  slab(electronics,.65,3.72,.045,.08,materials.board,.93,-.38,.11,.005);
  slab(electronics,2.45,.47,.045,.09,materials.board,0,-2.56,.11,.005);
  const shields = [ [.48,.94,.63,2.13], [.77,.56,-.31,1.74], [.44,.74,.93,.85], [.43,.60,.93,-.19], [.42,.63,.93,-1.17] ];
  shields.forEach(([w,h,x,y])=>{
    slab(electronics,w,h,.085,.045,materials.shield,x,y,.19,.009);
    // Fine folded seam around each RF shield.
    const outline = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(roundedShape(w-.045,h-.045,.025).getPoints(20).map(p=>new THREE.Vector3(p.x+x,p.y+y,.244))),new THREE.LineBasicMaterial({color:0x64717e}));
    electronics.add(outline);
  });
  label(electronics,'ARGEO\n073',.37,.36,.63,2.16,.242,{background:'#a1a8af',color:'#4e5967',size:83,lineHeight:97});
  const cameraPositions = [[-.90,2.52],[-.43,2.06],[-.91,1.67]];
  cameraPositions.forEach(([x,y])=>{
    slab(electronics,.49,.49,.12,.10,materials.shield,x,y,.18,.015);
    cylinder(electronics,.202,.05,materials.black,x,y,.27);
    cylinder(electronics,.174,.018,materials.polished,x,y,.306);
    cylinder(electronics,.148,.015,materials.lens,x,y,.323);
    cylinder(electronics,.077,.005,materials.lensBlue,x,y,.334);
    cylinder(electronics,.031,.003,materials.lens,x,y,.338);
  });
  // Controlled, deterministic placement keeps components away from the battery and shields.
  for(let i=0;i<22;i++) {
    const y = -1.92+(i%11)*.335;
    const x = i<11?.60:1.26;
    slab(electronics,.063,.115,.032,.009,i%3?materials.ceramic:materials.black,x,y,.165,.002);
    box(electronics,.064,.018,.039,materials.polished,x,y-.042,.166);
    box(electronics,.064,.018,.039,materials.polished,x,y+.042,.166);
  }
  for(let i=0;i<12;i++) {
    const x = -.08+i*.095;
    slab(electronics,.055,.08,.025,.006,i%2?materials.ceramic:materials.black,x,2.76,.16,.002);
  }
  for(let i=0;i<7;i++) {
    trace(electronics,[[.55+i*.025,1.49,.14],[.55+i*.025,1.31-i*.045,.14],[.76+i*.025,1.12-i*.045,.14],[.76+i*.025,.96,.14]],materials.gold,.006);
    cylinder(electronics,.018,.008,materials.gold,.61+i*.08,-2.62,.151,10);
  }
  // Ribbon connectors: flat, copper coloured, bent along the board surface.
  trace(electronics,[[.35,-2.35,.13],[.35,-1.9,.13],[.48,-1.77,.13],[.48,-1.46,.13]],materials.copper,.055);
  slab(electronics,.28,.12,.035,.02,materials.black,.48,-1.45,.17,.003);
  for(let i=0;i<8;i++) box(electronics,.014,.08,.007,materials.gold,.387+i*.027,-1.45,.193);
  slab(electronics,.89,.34,.14,.06,materials.graphite,-.68,-2.55,.20,.012);
  label(electronics,'TAPTIC',.65,.15,-.68,-2.55,.288,{size:90,color:'#87939f'});
  slab(electronics,.49,.33,.13,.06,materials.black,.37,-2.55,.20,.01);
  for(let i=0;i<6;i++) box(electronics,.035,.21,.008,materials.graphite,.22+i*.063,-2.55,.275);

  // The cell has a rounded foil pouch, an insulating border and printed markings.
  slab(battery,1.73,3.58,.105,.11,materials.black,-.36,-.49,.15,.018);
  slab(battery,1.66,3.50,.025,.095,materials.graphite,-.36,-.49,.216,.009);
  label(battery,'Li-ion\nRECHARGEABLE\n\n3.87 V   /   12.4 Wh\n\nARGEO · EVERY DETAIL MATTERS',1.40,2.5,-.36,-.55,.248,{size:42,lineHeight:83});
  // Battery terminal joins the mainboard; it stays attached to the cell in the cutaway.
  slab(battery,.25,.32,.012,.02,materials.copper,.33,1.39,.16,.002);
  slab(battery,.32,.12,.035,.02,materials.black,.33,1.56,.17,.003);
  for(let i=0;i<7;i++) box(battery,.018,.08,.007,materials.gold,.23+i*.033,1.56,.192);

  // A thin, cohesive display module: graphite backing, metal rim and OLED glass.
  slab(display,3.03,6.20,.055,.415,materials.polished,0,0,.176,.018);
  slab(display,2.97,6.14,.035,.395,materials.black,0,0,.215,.01);
  slab(display,2.84,6.00,.012,.34,materials.black,0,0,.239,.006);
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 1024;
  screenCanvas.height = 2160;
  const ctx = screenCanvas.getContext('2d');
  const background = ctx.createLinearGradient(0,0,1024,2160);
  background.addColorStop(0,'#edf5fa');
  background.addColorStop(.42,'#a8c9ed');
  background.addColorStop(1,'#154bba');
  ctx.fillStyle = background;
  ctx.fillRect(0,0,1024,2160);
  const glow = ctx.createRadialGradient(880,600,10,700,1000,1200);
  glow.addColorStop(0,'#c9efaa');
  glow.addColorStop(.5,'#b2dce280');
  glow.addColorStop(1,'#0d48b800');
  ctx.fillStyle = glow;
  ctx.fillRect(0,0,1024,2160);
  ctx.save();
  ctx.translate(500,1340);
  ctx.rotate(-.42);
  ctx.lineWidth = 230;
  const ribbon = ctx.createLinearGradient(-700,-400,700,700);
  ribbon.addColorStop(0,'#def3c9');
  ribbon.addColorStop(.5,'#a1d5e6');
  ribbon.addColorStop(1,'#1c57dc');
  ctx.strokeStyle = ribbon;
  ctx.beginPath();
  ctx.ellipse(0,0,620,730,0,0,Math.PI*2);
  ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#f2fffcaa';
  ctx.beginPath();
  ctx.ellipse(0,0,496,610,0,0,Math.PI*2);
  ctx.stroke();
  ctx.restore();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#143056';
  ctx.font = '500 48px Arial';
  ctx.fillText('Есть что сохранить',512,365);
  ctx.font = '300 210px Arial';
  ctx.fillText('10:09',512,610);
  ctx.fillStyle = '#ffffff70';
  ctx.beginPath();ctx.roundRect(106,1680,812,190,36);ctx.fill();
  ctx.textAlign = 'left';
  ctx.fillStyle = '#16345c';
  ctx.font = '600 32px Arial';ctx.fillText('ARGEO SERVICE',160,1744);
  ctx.font = '400 34px Arial';ctx.fillText('Всё снова работает.',160,1810);
  ctx.fillStyle = '#f0f5ff';ctx.beginPath();ctx.roundRect(348,2080,328,13,7);ctx.fill();
  const screenTexture = new THREE.CanvasTexture(screenCanvas);
  screenTexture.colorSpace = THREE.SRGBColorSpace;
  screenTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(),8);
  const face = new THREE.ShapeGeometry(roundedShape(2.81,5.97,.335),32);
  const positions = face.getAttribute('position');
  const uv = face.getAttribute('uv');
  for(let i=0;i<positions.count;i++) uv.setXY(i,(positions.getX(i)+1.405)/2.81,(positions.getY(i)+2.985)/5.97);
  const oled = new THREE.Mesh(face,new THREE.MeshBasicMaterial({map:screenTexture,toneMapped:false}));
  oled.position.z = .252;
  display.add(oled);
  slab(display,.79,.18,.009,.09,materials.black,0,2.75,.268,.003);
  cylinder(display,.045,.006,materials.lensBlue,.255,2.75,.278,24);
  // A subtle diagonal reflection belongs to the glass, so it moves with the display.
  const reflectionCanvas = document.createElement('canvas');
  reflectionCanvas.width=256;reflectionCanvas.height=512;
  const reflectionCtx=reflectionCanvas.getContext('2d');
  const reflectionGradient=reflectionCtx.createLinearGradient(0,0,256,512);
  reflectionGradient.addColorStop(0,'#ffffff35');reflectionGradient.addColorStop(.42,'#ffffff00');reflectionGradient.addColorStop(.85,'#ffffff00');reflectionGradient.addColorStop(1,'#ffffff12');
  reflectionCtx.fillStyle=reflectionGradient;reflectionCtx.fillRect(0,0,256,512);
  const reflectionTexture=new THREE.CanvasTexture(reflectionCanvas);
  const glass=new THREE.Mesh(face,new THREE.MeshBasicMaterial({map:reflectionTexture,transparent:true,depthWrite:false,toneMapped:false}));
  glass.position.z=.263;display.add(glass);
  // The back of the lifted display carries a real-looking connector and graphite shield.
  slab(display,2.75,5.90,.009,.32,materials.graphite,0,0,.135,.003);
  slab(display,.24,.92,.014,.025,materials.copper,.83,-1.80,.119,.003);

  let progress = art.classList.contains('exploded') ? 1 : 0;
  let target = progress;
  let pointerX=0,pointerY=0,currentX=0,currentY=0;
  let visible=true,frameId=0,previous=0;
  const labels = [...stage.querySelectorAll('[data-part]')];
  const anchors = {
    screen:{object:display,point:new THREE.Vector3(-1.3,1.85,.28)},
    board:{object:electronics,point:new THREE.Vector3(1.25,1.5,.25)},
    battery:{object:battery,point:new THREE.Vector3(-.20,-1.2,.25)},
  };
  const worldBounds = new THREE.Box3();
  const viewBounds = new THREE.Box3();
  const corner = new THREE.Vector3();
  function layout() {
    const width=stage.clientWidth,height=stage.clientHeight;
    if(!width||!height)return;
    renderer.setSize(width,height,false);
    const aspect=width/height;
    // Fit the actual assembly in camera space; phone and labels stay inside
    // the art panel at every aspect ratio and every point in the animation.
    rig.updateMatrixWorld(true);
    camera.updateMatrixWorld(true);
    worldBounds.setFromObject(rig);
    viewBounds.makeEmpty();
    for(const x of [worldBounds.min.x,worldBounds.max.x])
      for(const y of [worldBounds.min.y,worldBounds.max.y])
        for(const z of [worldBounds.min.z,worldBounds.max.z]) {
          corner.set(x,y,z).applyMatrix4(camera.matrixWorldInverse);
          viewBounds.expandByPoint(corner);
        }
    const centerX=(viewBounds.min.x+viewBounds.max.x)/2;
    const centerY=(viewBounds.min.y+viewBounds.max.y)/2;
    const halfHeight=Math.max((viewBounds.max.y-viewBounds.min.y)/2+.48,((viewBounds.max.x-viewBounds.min.x)/2+.48)/aspect);
    camera.left=centerX-halfHeight*aspect;camera.right=centerX+halfHeight*aspect;
    camera.top=centerY+halfHeight;camera.bottom=centerY-halfHeight;
    camera.updateProjectionMatrix();
  }
  function updateLabels() {
    rig.updateMatrixWorld(true);
    labels.forEach(element=>{
      const anchor=anchors[element.dataset.part];
      const point=anchor.object.localToWorld(anchor.point.clone()).project(camera);
      const offsets={screen:[-24,-18],board:[35,-6],battery:[8,24]};
      const [dx,dy]=offsets[element.dataset.part];
      const halfWidth=element.offsetWidth/2,halfHeight=element.offsetHeight/2;
      const x=THREE.MathUtils.clamp((point.x*.5+.5)*stage.clientWidth+dx,halfWidth+8,stage.clientWidth-halfWidth-8);
      const y=THREE.MathUtils.clamp((-point.y*.5+.5)*stage.clientHeight+dy,halfHeight+8,stage.clientHeight-halfHeight-8);
      element.style.left=`${x}px`;
      element.style.top=`${y}px`;
    });
  }
  function draw(now=performance.now()) {
    frameId=0;
    const dt=Math.min((now-previous)/1000,.045)||.016;
    previous=now;
    const blend=motion.matches?1:1-Math.exp(-dt*4.4);
    progress += (target-progress)*blend;
    if(Math.abs(target-progress)<.0005)progress=target;
    currentX+=(pointerX-currentX)*.11;
    currentY+=(pointerY-currentY)*.11;
    // The screen lifts first, then the battery and board separate within the gap.
    const p=progress*progress*(3-2*progress);
    display.position.z = p*4.65;
    electronics.position.z = -.14+p*.48;
    battery.position.z = -.03+p*.96;
    rig.position.set(.12*p,-.12*p,-2.05*p);
    rig.rotation.set(currentY*.055,currentX*.075,-.30);
    layout();
    updateLabels();
    renderer.render(scene,camera);
    if(visible&&(progress!==target||Math.abs(pointerX-currentX)>.001||Math.abs(pointerY-currentY)>.001))requestDraw();
  }
  function requestDraw(){if(!frameId&&visible&&!document.hidden)frameId=requestAnimationFrame(draw);}
  art.addEventListener('argeo:disassembly',event=>{target=event.detail.exploded?1:0;requestDraw();});
  if(matchMedia('(hover:hover) and (pointer:fine)').matches){
    stage.addEventListener('pointermove',event=>{if(motion.matches)return;const rect=stage.getBoundingClientRect();pointerX=(event.clientX-rect.left)/rect.width-.5;pointerY=(event.clientY-rect.top)/rect.height-.5;requestDraw();});
    stage.addEventListener('pointerleave',()=>{pointerX=0;pointerY=0;requestDraw();});
  }
  const resizeObserver=new ResizeObserver(()=>{layout();requestDraw();});resizeObserver.observe(stage);
  const visibilityObserver=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)requestDraw();else if(frameId){cancelAnimationFrame(frameId);frameId=0;}},{rootMargin:'150px'});visibilityObserver.observe(stage);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&frameId){cancelAnimationFrame(frameId);frameId=0;}else requestDraw();});
  motion.addEventListener('change',requestDraw);
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();stage.classList.remove('ready');});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{stage.classList.add('ready');requestDraw();});
  layout();draw();stage.classList.add('ready');
}

if(stage){
  const start=()=>{
    try{initializePhone();}
    catch(error){stage.classList.add('fallback');art.classList.remove('exploded');const button=document.querySelector('#art-toggle');button.hidden=true;console.warn('ARGEO: статическая версия иллюстрации.',error.message);}
  };
  if(document.readyState==='complete')start();
  else window.addEventListener('load',start,{once:true});
}
