// ข้อมูลจำลองทั้งหมด — ไม่ใช่ข้อมูลทางการ
// ตั้งค่าพื้นที่ตัวอย่าง: จังหวัดพะเยา (ฝั่งตะวันออกของกว๊านพะเยา) — ปรับ LAT0/LNG0 เพื่อเลื่อนพื้นที่ได้
const LAT0=19.12,LNG0=99.92,SPAN=0.10;
const RLAT=LAT0.toFixed(2)+"–"+(LAT0+SPAN).toFixed(2),RLNG=LNG0.toFixed(2)+"–"+(LNG0+SPAN).toFixed(2);
const ll=(x,y)=>[LAT0+SPAN-y/300*SPAN,LNG0+x/400*SPAN];
const poly=s=>s.split(" ").map(p=>{const[a,b]=p.split(",");return ll(+a,+b)});
const AREA=[[LAT0,LNG0],[LAT0+SPAN,LNG0+SPAN]];
const Z={spk:{n:"เขตปฏิรูปที่ดินบ้านตัวอย่าง",t:"เขตปฏิรูปที่ดิน",a:"สำนักงานการปฏิรูปที่ดินเพื่อเกษตรกรรม",c:"#9CCC65",d:"พื้นที่ปฏิรูปที่ดินเพื่อเกษตรกรรม",pts:"20,30 190,20 210,150 40,170"},
forest:{n:"ป่าสงวนแห่งชาติตัวอย่าง",t:"เขตป่าสงวน",a:"กรมป่าไม้",c:"#4DB6AC",d:"พื้นที่ป่าที่รัฐสงวนไว้",pts:"230,20 380,40 370,170 240,150"},
park:{n:"อุทยานแห่งชาติตัวอย่าง",t:"อุทยานแห่งชาติ",a:"กรมอุทยานแห่งชาติ สัตว์ป่า และพันธุ์พืช",c:"#BCAAA4",d:"พื้นที่อนุรักษ์ธรรมชาติ",pts:"120,190 380,200 390,285 110,280"}};
const P={"10001":{id:"A",pts:"25,205 85,200 88,262 28,266",z:[],loc:"หมู่ 1",area:"4-1-20 ไร่"},
"10002":{id:"B",pts:"225,100 285,100 290,170 230,175",z:["forest"],loc:"หมู่ 2",area:"6-0-45 ไร่"},
"10003":{id:"C",pts:"100,150 175,150 175,215 100,215",z:["spk","park"],loc:"หมู่ 3",area:"8-2-10 ไร่"}};
Object.values(P).forEach(p=>{const q=poly(p.pts);p.ll=[q.reduce((a,b)=>a+b[0],0)/q.length,q.reduce((a,b)=>a+b[1],0)/q.length]});
const EX=P["10002"].ll.map(x=>x.toFixed(4));
const LAYERS=[["parcel","แปลงที่ดิน","ขอบเขตแปลงตัวอย่าง · ชุดข้อมูลจำลอง"],["spk","เขตปฏิรูปที่ดิน",Z.spk.d+" · "+Z.spk.a],["forest","เขตป่าสงวน",Z.forest.d+" · "+Z.forest.a],["park","อุทยานแห่งชาติ",Z.park.d+" · "+Z.park.a]];
const S={v:"s1",on:{parcel:1,spk:1,forest:1,park:1},mode:"deed",deed:"",lat:"",lng:"",sel:null,hi:null,
 mapErr:location.hash=="#map-error",resErr:location.hash=="#result-error"};
let M,G;
const $=h=>{document.getElementById("app").innerHTML=h};
const sat=m=>{L.imageOverlay("assets/fallback-satellite.jpg",AREA).addTo(m);return L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{maxZoom:18,attribution:"Imagery © Esri, Maxar, Earthstar Geographics"}).addTo(m)};
const disc=`<p class="notice">ข้อมูลนี้เป็นข้อมูลจำลองเพื่อการเรียนรู้ ไม่ใช่การรับรองสิทธิ์ตามกฎหมาย และไม่ใช่ระบบทางการของหน่วยงานใด ภาพดาวเทียมใช้เป็นพื้นหลังประกอบเท่านั้น</p>`;
const go=v=>{S.v=v;render();scrollTo(0,0)};
const load=(v,msg)=>{$(`<div class="card empty"><div class="spin"></div><p>${msg}</p></div>`);setTimeout(()=>go(v),700)};
const pick=k=>{S.sel=k;load("s3","กำลังตรวจสอบแปลง")};
const render=()=>({s1,s2,s3})[S.v]();
const zpoly=k=>L.polygon(poly(Z[k].pts),{className:"z-"+k,color:Z[k].c,weight:2.5,fillOpacity:1}).bindTooltip(Z[k].t,{sticky:true});
const sw=k=>`<span class="sw sw-${k}"></span>`;
function s1(){
 if(S.mapErr)return $(`<div class="card empty"><h2>โหลดแผนที่ไม่สำเร็จ</h2><p>กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง</p><button class="btn" onclick="S.mapErr=0;load('s1','กำลังโหลดแผนที่')">ลองอีกครั้ง</button></div>`);
 $(`<button class="btn" onclick="go('s2')">🔍 ค้นหาแปลง</button><h1>แผนที่หลัก</h1><div class="grid"><div>
 <div class="mapwrap"><div id="map"></div><div class="none" id="none" hidden>ยังไม่ได้เปิดชั้นข้อมูลใด<br>กรุณาเปิดอย่างน้อย 1 ชั้นข้อมูล</div></div>
 <p class="help" style="margin-top:8px">แตะที่แปลงบนแผนที่เพื่อดูผลการตรวจสอบ</p></div>
 <div><div class="card"><h2>ชั้นข้อมูล</h2>${LAYERS.map(l=>`<label class="layer"><input type="checkbox" ${S.on[l[0]]?"checked":""} onchange="tog('${l[0]}')"><span><b>${l[1]}</b><small>${l[2]}</small></span></label>`).join("")}</div>
 <div class="card"><h2>คำอธิบายสัญลักษณ์</h2>${LAYERS.map(l=>`<div class="leg">${sw(l[0])} ${l[1]}</div>`).join("")}<div class="leg"><span class="sw" style="border-color:#E65100;border-width:4px"></span> แปลงที่เลือก</div></div>${disc}</div></div>`);
 M=L.map("map").fitBounds(AREA);sat(M);
 G={spk:L.layerGroup([zpoly("spk")]),forest:L.layerGroup([zpoly("forest")]),park:L.layerGroup([zpoly("park")]),
  parcel:L.layerGroup(Object.keys(P).map(k=>{const hi=S.hi==k;return L.polygon(poly(P[k].pts),{color:hi?"#FF6D00":"#fff",weight:hi?6:3,fillColor:"#fff",fillOpacity:.18})
   .bindTooltip("แปลง "+P[k].id,{permanent:true,direction:"center",className:"lbl"}).on("click",()=>pick(k))}))};
 Object.keys(G).forEach(k=>S.on[k]&&G[k].addTo(M));
 if(S.hi){M.fitBounds(L.polygon(poly(P[S.hi].pts)).getBounds().pad(2));S.hi=null}
 upd()}
function upd(){document.getElementById("none").hidden=Object.values(S.on).some(x=>x)}
function tog(k){S.on[k]=S.on[k]?0:1;S.on[k]?G[k].addTo(M):M.removeLayer(G[k]);upd()}
function s2(){const d=S.mode=="deed";
 $(`<button class="btn sec fit" onclick="go('s1')">← กลับไปแผนที่</button><h1>ค้นหาแปลง</h1>
 <div class="card" style="max-width:620px"><div class="seg" role="group" aria-label="วิธีค้นหา"><button aria-pressed="${d}" onclick="sm('deed')">เลขโฉนด</button><button aria-pressed="${!d}" onclick="sm('xy')">พิกัด</button></div>
 ${d?`<label for="deed">เลขที่โฉนด</label><input type="text" id="deed" inputmode="numeric" value="${S.deed}"><p class="help">ตัวอย่าง: 10001 (ลองใช้ 10001, 10002, 10003 หรือ 99999)</p>`:
 `<label for="lat">ละติจูด</label><input type="text" id="lat" inputmode="decimal" value="${S.lat}"><p class="help">ตัวอย่าง: ${EX[0]}</p><label for="lng">ลองจิจูด</label><input type="text" id="lng" inputmode="decimal" value="${S.lng}"><p class="help">ตัวอย่าง: ${EX[1]} (พื้นที่ตัวอย่างอยู่ในช่วง ${RLAT} และ ${RLNG})</p>`}
 <div id="m"></div><button class="btn" id="go" onclick="srch()">🔍 ค้นหาแปลง</button></div>${disc}`)}
function sm(m){S.mode=m;s2()}
function fe(id,msg){const i=document.getElementById(id);i.className="bad";i.nextElementSibling.outerHTML=`<p class="err" role="alert">⚠ ${msg}</p>`}
function srch(){let k,ok=1;
 if(S.mode=="deed"){S.deed=deed.value.trim();if(!S.deed)return fe("deed","กรุณากรอกเลขที่โฉนด เช่น 10001");k=S.deed}
 else{S.lat=lat.value.trim();S.lng=lng.value.trim();const a=parseFloat(S.lat),b=parseFloat(S.lng);
  if(isNaN(a)){fe("lat","กรุณากรอกละติจูดเป็นตัวเลข เช่น "+EX[0]);ok=0}
  if(isNaN(b)){fe("lng","กรุณากรอกลองจิจูดเป็นตัวเลข เช่น "+EX[1]);ok=0}
  if(!ok)return;
  if(a<LAT0||a>LAT0+SPAN||b<LNG0||b>LNG0+SPAN)return fe("lat","พิกัดนี้อยู่นอกพื้นที่ตัวอย่าง กรุณากรอกละติจูด "+RLAT+" และลองจิจูด "+RLNG);
  k=Object.keys(P).find(x=>Math.abs(P[x].ll[0]-a)<.008&&Math.abs(P[x].ll[1]-b)<.008)||"-"}
 const g=document.getElementById("go");g.disabled=true;g.textContent="กำลังค้นหาแปลง…";
 setTimeout(()=>{if(!P[k]){s2();document.getElementById("m").innerHTML=`<div class="alert" role="alert"><b>ไม่พบแปลงที่ตรงกับข้อมูลที่กรอก</b><ul><li>ตรวจสอบว่ากรอกเลขโฉนดหรือพิกัดถูกต้อง</li><li>ลองค้นหาด้วยวิธีอื่น หรือเลือกแปลงจากแผนที่</li></ul></div>`;return}S.sel=k;go("s3")},800)}
function s3(){
 if(S.resErr)return $(`<div class="card empty"><h2>โหลดผลไม่สำเร็จ</h2><p>กรุณาลองอีกครั้ง</p><button class="btn" onclick="S.resErr=0;load('s3','กำลังตรวจสอบแปลง')">ลองอีกครั้ง</button></div>`);
 const k=S.sel,p=P[k],n=p.z.length;
 const sum=n?`แปลงนี้มีบริเวณที่ซ้อนทับกับ${p.z.map(z=>Z[z].t).join("และ")}ตามข้อมูลจำลอง`:"ไม่พบการซ้อนทับกับเขตใดตามข้อมูลจำลองที่ใช้ตรวจสอบ";
 $(`<h1>ผลการตรวจสอบแปลง ${p.id}</h1><div class="grid"><div>
 <div class="card"><h2>สรุป</h2><p style="margin:0">${sum}</p></div>
 <div class="card"><h2>สถานะสิทธิ์</h2><span class="badge">✔ ข้อมูลสถานะสิทธิ์ตามข้อมูลจำลอง</span></div>
 ${n?`<div class="alert" role="alert"><h2>⚠ พบพื้นที่ซ้อนทับ ${n} เขต</h2><ul>${p.z.map(z=>`<li><b>${Z[z].n}</b><br>ประเภท: ${Z[z].d}<br>หน่วยงานเจ้าของข้อมูล: ${Z[z].a}</li>`).join("")}</ul></div>`:`<div class="card"><h2>การซ้อนทับ</h2><p style="margin:0">✔ ไม่พบการซ้อนทับตามข้อมูลที่ใช้ตรวจสอบ</p></div>`}
 <div class="card"><h2>รายละเอียดแปลง</h2><dl><dt>เลขที่โฉนด</dt><dd>${k}</dd><dt>ประเภทเอกสาร</dt><dd>โฉนดที่ดิน (ข้อมูลจำลอง)</dd><dt>ที่ตั้ง</dt><dd>${p.loc} ตำบลบ้านตัวอย่าง อำเภอเมืองสมมติ จังหวัดสมมติ</dd><dt>เนื้อที่</dt><dd>${p.area}</dd></dl></div></div>
 <div><div class="card"><h2>แผนที่ย่อ</h2><div class="mapwrap"><div id="mini"></div></div><div style="margin-top:10px">${p.z.map(z=>`<div class="leg">${sw(z)} ${Z[z].t}</div>`).join("")}<div class="leg">${sw("parcel")} แปลง ${p.id}</div></div></div>${disc}
 <button class="btn" onclick="go('s2')">🔍 ค้นหาแปลงอื่น</button><button class="btn sec" onclick="S.hi='${k}';go('s1')">🗺️ ดูบนแผนที่</button></div></div>`);
 const m=L.map("mini",{zoomControl:false,dragging:false,scrollWheelZoom:false,doubleClickZoom:false,touchZoom:false,boxZoom:false,keyboard:false});sat(m);
 p.z.forEach(z=>zpoly(z).addTo(m));
 const pp=L.polygon(poly(p.pts),{color:"#FF6D00",weight:4,fillColor:"#fff",fillOpacity:.2}).addTo(m);
 const b=p.z.reduce((a,z)=>a.extend(L.polygon(poly(Z[z].pts)).getBounds()),pp.getBounds());m.fitBounds(b.pad(.1))}
render();
