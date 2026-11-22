import {loadActivityArtwork} from './activity-artwork.mjs';

const localAsset = path => new URL(path, import.meta.url).href;

function canvasTexture(THREE, width, height, paint) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  paint(canvas.getContext('2d'), width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function stipple(ctx, w, h, rgb, variation) {
  const image = ctx.createImageData(w, h);
  let seed = 2713;
  for (let i = 0; i < image.data.length; i += 4) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const t = (seed / 4294967296 - 0.5) * variation;
    for (let k = 0; k < 3; k++) image.data[i+k] = rgb[k] + t;
    image.data[i+3] = 255;
  }
  ctx.putImageData(image, 0, 0);
}

export async function createRoom(THREE) {
  const room = new THREE.Group();
  room.name = 'Study';
  const loader = new THREE.TextureLoader();
  const [wood, view, artwork] = await Promise.all([
    loader.loadAsync(localAsset('walnut.webp')),
    loader.loadAsync(localAsset('garden.webp')),
    loadActivityArtwork().then(canvas => new THREE.CanvasTexture(canvas))
      .catch(() => loader.loadAsync(localAsset('activity-poster.webp'))),
  ]);
  for (const map of [wood, view, artwork]) { map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 6; }
  const finish = (color, roughness = 0.78, extra = {}) =>
    new THREE.MeshStandardMaterial({color, roughness, ...extra});
  function box(name, size, at, material) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
    mesh.name = name;
    mesh.position.set(...at);
    room.add(mesh);
    return mesh;
  }
  function face(name, w, h, at, material) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w,h), material);
    mesh.name = name; mesh.position.set(...at); room.add(mesh);
    return mesh;
  }
  const walnut = finish(0xa08c78, 0.60, {map:wood});
  const sill = finish(0x86715c);
  const darkTimber = finish(0x433831);
  const metal = finish(0x272b2c, 0.46, {metalness:0.45});
  const plasterTexture = canvasTexture(THREE,512,512,(ctx,w,h) =>
    stipple(ctx,w,h,[177,183,175],11));
  plasterTexture.wrapS = plasterTexture.wrapT = THREE.RepeatWrapping;
  plasterTexture.repeat.set(24, 11);
  const plaster = finish(0xb9c2c3, 0.98, {map:plasterTexture});
  const wallZ = -4.85;
  box('Mineral plaster wall', [100,52,.26], [0,11,wallZ], plaster);
  box('Skirting', [100,.45,.15], [0,-5.48,wallZ+.19], finish(0xa4a39b));
  const floorMap = wood.clone();
  floorMap.wrapS = floorMap.wrapT = THREE.MirroredRepeatWrapping;
  floorMap.repeat.set(12, 15);
  box('Oak floor', [120,.34,100], [0,-5.86,26], finish(0x6c6860,0.88,{map:floorMap}));
  const rugMap = canvasTexture(THREE, 144, 144, (ctx,w,h) => {
    stipple(ctx,w,h,[104,115,112],19);
    ctx.strokeStyle='rgba(221,216,198,.19)';
    ctx.lineWidth=1;
    for (let y=0;y<h;y+=4) {
      ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();
    }
  });
  rugMap.wrapS = rugMap.wrapT = THREE.RepeatWrapping;
  rugMap.repeat.set(14, 10);
  const rug = face('Woven floor rug',17.6,13.5,[.1,-5.67,6.7],
    finish(0x969591,.98,{map:rugMap}));
  rug.rotation.x=-Math.PI/2;

  // A recessed sash, sash rails, painted mullions and a deep timber sill.
  const wx=-7.1, wy=5.0, wz=wallZ+.20, ww=5.0, wh=8.1;
  const painted=finish(0xa8aea7, 0.67);
  box('Window reveal',[ww+.31,wh+.34,.24],[wx,wy,wz-.02],darkTimber);
  face('Garden beyond the sash',ww,wh,[wx,wy,wz+.124],
    new THREE.MeshBasicMaterial({map:view,color:0xe2e4d6,toneMapped:false}));
  for (const s of [-1,1]) {
    box('Sash stile',[.15,wh+.25,.20],[wx+s*(ww+.04)/2,wy,wz+.18],painted);
    box('Sash rail',[ww+.25,.16,.20],[wx,wy+s*wh/2,wz+.18],painted);
  }
  box('Center mullion',[.075,wh,.115],[wx+.15,wy,wz+.188],painted);
  box('Meeting rail',[ww,.092,.14],[wx,wy+.22,wz+.22],painted);
  box('Casement sill',[ww+.63,.22,.72],[wx,wy-wh/2-.11,wz+.31],sill);
  box('Sill apron',[ww+.23,.22,.20],[wx,wy-wh/2-.29,wz+.12],painted);

  // The blind is gathered at the head of the window. Slightly stagger the
  // lower slats to reveal their thickness and the garden behind them.
  const blind = finish(0x81705a,0.7);
  for (let i=0;i<6;i++) {
    const slat=box('Timber blind slat',[ww-.09,.047,.19],
      [wx,wy+wh/2-.20-i*.14,wz+.315],blind);
    slat.rotation.x=-.25;
  }
  for (const dx of [-1.62,1.62])
    box('Blind ladder cord',[.019,.97,.018],[wx+dx,wy+wh/2-.55,wz+.352],darkTimber);

  // A framed paper print sits off-axis to leave the monitor the largest plane.
  const artX=7.48, artY=4.7, artW=2.2, artH=3.12, artZ=wallZ+.22;
  box('Shadow behind the print',[artW+.08,artH+.10,.06],[artX+.037,artY-.045,artZ-.04],finish(0x434741));
  box('Walnut picture frame',[artW,artH,.12],[artX,artY,artZ+.015],darkTimber);
  face('Linen mat',artW-.09,artH-.09,[artX,artY,artZ+.082],finish(0xe6e3d8));
  face('GitHub contribution calendar',artW-.2,artH-.22,[artX,artY,artZ+.084],
    new THREE.MeshBasicMaterial({map:artwork,toneMapped:false}));

  // The grain runs the length of the desktop, above a solid lipped edge.
  const width=19.4, depth=12, deskZ=2.43;
  const top = box('Oiled walnut desktop',[width,.30,depth],[0,-.19,deskZ],walnut);
  top.receiveShadow=true;
  box('Desk apron',[width-.45,.45,depth-.44],[0,-.49,deskZ],darkTimber);
  for (const x of [-6.15,6.15]) {
    for (const z of [-2.44,7.36]) box('Desk frame',[.18,5.12,.2],[x,-3.12,z],metal);
    box('Frame rail',[.19,.14,9.98],[x,-5.55,2.46],metal);
  }

  const matW=10.2, matD=4.01, round=.16;
  const shape=new THREE.Shape();
  const x=-matW/2, y=-matD/2;
  shape.moveTo(x+round,y); shape.lineTo(-x-round,y);
  shape.quadraticCurveTo(-x,y,-x,y+round); shape.lineTo(-x,-y-round);
  shape.quadraticCurveTo(-x,-y,-x-round,-y); shape.lineTo(x+round,-y);
  shape.quadraticCurveTo(x,-y,x,-y-round); shape.lineTo(x,y+round);
  shape.quadraticCurveTo(x,y,x+round,y);
  const cloth=canvasTexture(THREE,256,256,(ctx,w,h)=>{
    stipple(ctx,w,h,[66,72,71],14);
    ctx.fillStyle='rgba(163,170,159,.075)';
    for(let n=0;n<w;n+=3) ctx.fillRect(n,0,1,h);
  });
  cloth.wrapS=cloth.wrapT=THREE.RepeatWrapping;
  cloth.repeat.set(1.3,1.3);
  const mat=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{
    depth:.018,bevelEnabled:true,bevelSegments:2,bevelThickness:.006,bevelSize:.008,curveSegments:6
  }),finish(0xa7aaa4,.98,{map:cloth}));
  mat.name='Woven desk mat'; mat.rotation.x=-Math.PI/2;
  mat.receiveShadow = true;
  mat.position.set(.67,-.039,4.20); room.add(mat);

  // A soft patch of daylight breaks up the wall beyond the desk.
  const lightPatch=canvasTexture(THREE,640,400,(ctx,w,h)=>{
    const halo=ctx.createLinearGradient(0,0,w,h*.25);
    halo.addColorStop(0,'rgba(251,230,184,0)');
    halo.addColorStop(.27,'rgba(251,230,184,.38)');
    halo.addColorStop(.61,'rgba(251,235,204,.18)');
    halo.addColorStop(1,'rgba(251,235,204,0)');
    ctx.fillStyle=halo;ctx.filter='blur(11px)';
    for(let i=0;i<7;i++){
      const dy=-110+i*92;
      ctx.beginPath();ctx.moveTo(0,dy+180);ctx.lineTo(w,dy-80);
      ctx.lineTo(w,dy-25);ctx.lineTo(0,dy+235);ctx.fill();
    }
    ctx.globalCompositeOperation='destination-in';ctx.filter='none';
    const fade=ctx.createRadialGradient(w*.45,h*.5,30,w*.45,h*.5,w*.52);
    fade.addColorStop(0,'white');fade.addColorStop(.67,'white');fade.addColorStop(1,'transparent');
    ctx.fillStyle=fade;ctx.fillRect(0,0,w,h);
    const edges=ctx.createLinearGradient(0,0,0,h);
    edges.addColorStop(0,'transparent');edges.addColorStop(.22,'white');
    edges.addColorStop(.78,'white');edges.addColorStop(1,'transparent');
    ctx.fillStyle=edges;ctx.fillRect(0,0,w,h);
  });
  face('Reflected window light',14,8.3,[4.2,4.9,wallZ+.147],
    new THREE.MeshBasicMaterial({map:lightPatch,transparent:true,depthWrite:false,toneMapped:false}));
  return room;
}
