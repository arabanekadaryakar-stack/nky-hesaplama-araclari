(function(global){
  'use strict';

  const VEHICLE_API='https://script.google.com/macros/s/AKfycbxNwL7NGF9eTBJApiu3PTIKHfPDt7wjmEg9rThG3fcVLdhkDaZWvmc2QDII4VcXONWAnQ/exec';
  const PRICE_API='https://script.google.com/macros/s/AKfycbwJ2dzHkJRgvW2d9D_inYkYVi9s0wnZlEysyomC9W5BZ7W63nhgkHpL22QoP5-A6tMoyA/exec';
  const CLIENT='nky-web-2026';
  const SITE='arabanekadaryakar.com';
  const CACHE_TTL=10*60*1000;

  const fallbackVehicleMap={"Alfa Romeo":[{"name":"Giulietta 1.4 TB Benzin","type":"benzin","cons":7.0},{"name":"Tonale 1.5 Hybrid","type":"hibrit","cons":5.9}],"Audi":[{"name":"A3 35 TFSI Benzin","type":"benzin","cons":6.0},{"name":"A4 40 TDI Dizel","type":"dizel","cons":5.2},{"name":"Q3 35 TFSI Benzin","type":"benzin","cons":6.8}],"BMW":[{"name":"116i Benzin","type":"benzin","cons":6.3},{"name":"320i Benzin","type":"benzin","cons":6.5},{"name":"320d Dizel","type":"dizel","cons":5.0},{"name":"iX1 Elektrikli","type":"elektrik","cons":17.2}],"BYD":[{"name":"Dolphin Elektrikli","type":"elektrik","cons":15.9},{"name":"Atto 3 Elektrikli","type":"elektrik","cons":16.0},{"name":"Seal U DM-i Hibrit","type":"hibrit","cons":5.8},{"name":"Seal U EV Elektrikli","type":"elektrik","cons":19.9}],"Chery":[{"name":"Omoda 5 Pro 1.6 TGDI Benzin","type":"benzin","cons":9.1},{"name":"Tiggo 7 Pro Max 1.6 TGDI Benzin","type":"benzin","cons":7.9},{"name":"Tiggo 8 Pro Max 1.6 TGDI Benzin","type":"benzin","cons":8.6}],"Citroen":[{"name":"C3 1.2 PureTech Benzin","type":"benzin","cons":5.7},{"name":"C4 1.2 PureTech Benzin","type":"benzin","cons":5.8},{"name":"C4 X 1.5 BlueHDi Dizel","type":"dizel","cons":4.8}],"Cupra":[{"name":"Formentor 1.5 TSI Benzin","type":"benzin","cons":6.8},{"name":"Born Elektrikli","type":"elektrik","cons":16.8}],"Dacia":[{"name":"Sandero 1.0 TCe Benzin","type":"benzin","cons":6.0},{"name":"Duster 1.3 TCe Benzin","type":"benzin","cons":7.0},{"name":"Duster ECO-G LPG","type":"lpg","cons":8.1},{"name":"Jogger ECO-G LPG","type":"lpg","cons":8.4}],"DS":[{"name":"DS 4 PureTech Benzin","type":"benzin","cons":6.5},{"name":"DS 7 BlueHDi Dizel","type":"dizel","cons":5.5}],"Fiat":[{"name":"Egea 1.4 Fire Benzin","type":"benzin","cons":7.1},{"name":"Egea 1.6 Multijet Dizel","type":"dizel","cons":4.8},{"name":"Egea 1.4 Fire LPG","type":"lpg","cons":9.0},{"name":"500e Elektrikli","type":"elektrik","cons":14.0},{"name":"Fiorino 1.3 Multijet Dizel","type":"dizel","cons":5.2}],"Ford":[{"name":"Focus 1.5 EcoBlue Dizel","type":"dizel","cons":4.7},{"name":"Focus 1.0 EcoBoost Benzin","type":"benzin","cons":5.8},{"name":"Puma 1.0 EcoBoost Hybrid","type":"hibrit","cons":5.6},{"name":"Kuga 1.5 EcoBoost Benzin","type":"benzin","cons":7.2}],"Honda":[{"name":"Civic 1.5 VTEC Turbo Benzin","type":"benzin","cons":7.0},{"name":"Civic e:HEV Hybrid","type":"hibrit","cons":5.0},{"name":"HR-V e:HEV Hybrid","type":"hibrit","cons":5.4}],"Hyundai":[{"name":"i10 1.0 Benzin","type":"benzin","cons":5.5},{"name":"i20 1.0 T-GDI Benzin","type":"benzin","cons":6.0},{"name":"Bayon 1.0 T-GDI Benzin","type":"benzin","cons":6.2},{"name":"Tucson 1.6 T-GDI Hybrid","type":"hibrit","cons":6.0},{"name":"IONIQ 5 Elektrikli","type":"elektrik","cons":18.1},{"name":"Kona Elektrikli","type":"elektrik","cons":14.7}],"Jeep":[{"name":"Renegade 1.5 e-Hybrid","type":"hibrit","cons":5.8},{"name":"Compass 1.5 e-Hybrid","type":"hibrit","cons":6.0}],"Kia":[{"name":"Picanto 1.0 Benzin","type":"benzin","cons":5.4},{"name":"Stonic 1.0 T-GDI Benzin","type":"benzin","cons":5.9},{"name":"Sportage 1.6 T-GDI Hybrid","type":"hibrit","cons":6.1},{"name":"Niro EV Elektrikli","type":"elektrik","cons":16.2},{"name":"EV3 Elektrikli","type":"elektrik","cons":15.8}],"Mercedes-Benz":[{"name":"A 200 Benzin","type":"benzin","cons":6.4},{"name":"C 200 Benzin","type":"benzin","cons":6.7},{"name":"E 220 d Dizel","type":"dizel","cons":5.2},{"name":"EQA 250+ Elektrikli","type":"elektrik","cons":16.1}],"MG":[{"name":"MG4 Elektrikli","type":"elektrik","cons":16.6},{"name":"ZS 1.0 T-GDI Benzin","type":"benzin","cons":6.7},{"name":"HS PHEV Hibrit","type":"hibrit","cons":6.2}],"Mini":[{"name":"Cooper C Benzin","type":"benzin","cons":6.0},{"name":"Cooper Electric","type":"elektrik","cons":14.7}],"Nissan":[{"name":"Juke 1.0 DIG-T Benzin","type":"benzin","cons":6.0},{"name":"Qashqai e-Power Hybrid","type":"hibrit","cons":5.4},{"name":"X-Trail e-Power Hybrid","type":"hibrit","cons":6.2}],"Opel":[{"name":"Corsa 1.2 Benzin","type":"benzin","cons":5.4},{"name":"Astra 1.2 Turbo Benzin","type":"benzin","cons":5.8},{"name":"Mokka 1.2 Turbo Benzin","type":"benzin","cons":6.0},{"name":"Corsa-e Elektrikli","type":"elektrik","cons":15.8}],"Peugeot":[{"name":"208 1.2 PureTech Benzin","type":"benzin","cons":5.6},{"name":"2008 1.2 PureTech Benzin","type":"benzin","cons":6.1},{"name":"308 1.2 PureTech Benzin","type":"benzin","cons":5.8},{"name":"3008 1.5 BlueHDi Dizel","type":"dizel","cons":5.1},{"name":"e-2008 Elektrikli","type":"elektrik","cons":16.2}],"Renault":[{"name":"Clio 1.0 TCe Benzin","type":"benzin","cons":6.2},{"name":"Clio 1.5 Blue dCi Dizel","type":"dizel","cons":4.3},{"name":"Megane 1.3 TCe Benzin","type":"benzin","cons":6.7},{"name":"Captur E-Tech Hybrid","type":"hibrit","cons":5.0},{"name":"Austral E-Tech Hybrid","type":"hibrit","cons":5.2},{"name":"Megane E-Tech Elektrikli","type":"elektrik","cons":16.1}],"Seat":[{"name":"Ibiza 1.0 TSI Benzin","type":"benzin","cons":5.4},{"name":"Leon 1.5 eTSI Hybrid","type":"hibrit","cons":5.7},{"name":"Ateca 1.5 TSI Benzin","type":"benzin","cons":6.7}],"Skoda":[{"name":"Fabia 1.0 TSI Benzin","type":"benzin","cons":5.3},{"name":"Scala 1.0 TSI Benzin","type":"benzin","cons":5.5},{"name":"Octavia 1.5 eTSI Hybrid","type":"hibrit","cons":5.5},{"name":"Kodiaq 1.5 TSI Benzin","type":"benzin","cons":6.9},{"name":"Enyaq Elektrikli","type":"elektrik","cons":17.0}],"Suzuki":[{"name":"Swift Hybrid","type":"hibrit","cons":4.7},{"name":"Vitara Hybrid","type":"hibrit","cons":5.7},{"name":"S-Cross Hybrid","type":"hibrit","cons":5.8}],"Tesla":[{"name":"Model 3 RWD Elektrikli","type":"elektrik","cons":14.5},{"name":"Model 3 Long Range Elektrikli","type":"elektrik","cons":15.2},{"name":"Model Y RWD Elektrikli","type":"elektrik","cons":16.9},{"name":"Model Y Long Range Elektrikli","type":"elektrik","cons":17.3}],"Togg":[{"name":"T10X V1 RWD Elektrikli","type":"elektrik","cons":18.0},{"name":"T10X V2 RWD Elektrikli","type":"elektrik","cons":18.3}],"Toyota":[{"name":"Yaris 1.5 Hybrid","type":"hibrit","cons":4.0},{"name":"Corolla 1.5 Benzin","type":"benzin","cons":6.5},{"name":"Corolla 1.8 Hybrid","type":"hibrit","cons":4.6},{"name":"C-HR 1.8 Hybrid","type":"hibrit","cons":4.8},{"name":"RAV4 Hybrid","type":"hibrit","cons":5.8}],"Volkswagen":[{"name":"Polo 1.0 TSI Benzin","type":"benzin","cons":5.6},{"name":"Golf 1.0 TSI Benzin","type":"benzin","cons":5.8},{"name":"Golf 1.5 eTSI Hybrid","type":"hibrit","cons":5.5},{"name":"Passat 1.5 TSI Benzin","type":"benzin","cons":6.5},{"name":"T-Roc 1.5 TSI Benzin","type":"benzin","cons":6.6},{"name":"ID.4 Elektrikli","type":"elektrik","cons":17.0}],"Volvo":[{"name":"XC40 B3 Mild Hybrid","type":"hibrit","cons":6.7},{"name":"EX30 Elektrikli","type":"elektrik","cons":15.7},{"name":"XC60 B5 Mild Hybrid","type":"hibrit","cons":7.5}]};

  function fallbackVehicles(){
    const rows=[];
    Object.keys(fallbackVehicleMap).forEach(brand=>{
      (fallbackVehicleMap[brand]||[]).forEach(item=>{
        const type=normalizeFuelType(item.type);
        rows.push({id:item.id||slugify(brand+' '+item.name),brand,name:item.name,label:brand+' '+item.name,type,cons:Number(item.cons),unit:item.unit||(type==='elektrik'?'kWh/100 km':'L/100 km'),source:'Yerleşik araç kataloğu',updatedAt:''});
      });
    });
    return rows.sort((a,b)=>a.label.localeCompare(b.label,'tr'));
  }

  const typeLabels={benzin:'Benzin',dizel:'Dizel',motorin:'Dizel',lpg:'LPG',hibrit:'Hibrit',elektrik:'Elektrikli'};

  function $(id){return document.getElementById(id);}
  function normalizeText(value){
    return String(value||'').toLocaleLowerCase('tr-TR')
      .replace(/ı/g,'i').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ö/g,'o').replace(/ç/g,'c')
      .replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
  }
  function normalizeFuelType(value){
    const v=normalizeText(value);
    if(v==='motorin'||v==='diesel')return 'dizel';
    if(v==='ev'||v==='electric')return 'elektrik';
    if(v==='hybrid')return 'hibrit';
    return ['benzin','dizel','lpg','hibrit','elektrik'].includes(v)?v:'benzin';
  }
  function typeName(value){return typeLabels[normalizeFuelType(value)]||String(value||'');}
  function slugify(value){return normalizeText(value).replace(/\s+/g,'-');}
  function fmt(value,digits=2){return new Intl.NumberFormat('tr-TR',{minimumFractionDigits:digits,maximumFractionDigits:digits}).format(Number(value)||0);}
  function money(value,digits=2){return fmt(value,digits)+' TL';}
  function parseNumber(value){
    let s=String(value??'').trim().replace(/\s/g,'');
    if(!s)return NaN;
    if(s.includes(',')&&s.includes('.'))s=s.lastIndexOf(',')>s.lastIndexOf('.')?s.replace(/\./g,'').replace(',','.'):s.replace(/,/g,'');
    else if(s.includes(','))s=s.replace(',','.');
    return Number(s);
  }
  function validPositive(value){return Number.isFinite(value)&&value>0;}
  function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function showStatus(element,message,kind){
    if(typeof element==='string')element=$(element);
    if(!element)return;
    element.textContent=message;
    element.className='nky-status'+(kind?' '+kind:'');
  }
  function getStored(key,fallback=null){try{const x=localStorage.getItem(key);return x===null?fallback:JSON.parse(x);}catch(e){return fallback;}}
  function setStored(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch(e){}}
  function getCached(key){const x=getStored(key);return x&&Date.now()-x.time<CACHE_TTL?x.value:null;}
  function setCached(key,value){setStored(key,{time:Date.now(),value});}

  function normalizeVehiclePayload(payload){
    let rows=[];
    const source=payload&&payload.data&&typeof payload.data==='object'&&!Array.isArray(payload.data)?payload.data:payload;

    if(Array.isArray(payload))rows=payload;
    else if(Array.isArray(payload?.vehicles))rows=payload.vehicles;
    else if(Array.isArray(payload?.araclar))rows=payload.araclar;
    else if(Array.isArray(payload?.rows))rows=payload.rows;
    else if(Array.isArray(payload?.data))rows=payload.data;
    else if(source&&typeof source==='object'){
      Object.keys(source).forEach(brand=>{
        const list=source[brand];
        if(!Array.isArray(list))return;
        list.forEach(item=>rows.push(Object.assign({brand},item)));
      });
    }

    const result=[];
    rows.forEach(r=>{
      if(!r||typeof r!=='object')return;
      if(r.active===false||['hayır','hayir','false','0','pasif'].includes(String(r.active||'').toLocaleLowerCase('tr-TR')))return;
      const brand=String(r.brand||r.marka||'').trim();
      const name=String(r.name||r.modelMotor||r.model||r.motor||'').trim();
      const type=normalizeFuelType(r.type||r.yakitTuru||r.yakitturu||r.yakit);
      const cons=parseNumber(r.cons??r.tuketim??r.consumption);
      if(!brand||!name||!validPositive(cons))return;
      result.push({
        id:String(r.id||r.slug||slugify(brand+' '+name)),
        brand,name,label:brand+' '+name,type,cons,
        unit:r.unit||r.birim||(type==='elektrik'?'kWh/100 km':'L/100 km'),
        source:r.source||r.kaynak||'',updatedAt:r.updatedAt||r.guncellemeTarihi||''
      });
    });
    return result.sort((a,b)=>a.label.localeCompare(b.label,'tr'));
  }

  async function loadVehicles(force=false){
    const cacheKey='nky_vehicle_catalogue_v3';
    if(!force){const cached=getCached(cacheKey);if(cached?.length)return cached;}
    const url=VEHICLE_API+'?mode=vehicles&client='+encodeURIComponent(CLIENT)+'&site='+encodeURIComponent(SITE)+(force?'&_='+Date.now():'');
    try{
      const response=await fetch(url,{cache:force?'no-store':'default'});
      if(!response.ok)throw new Error('HTTP '+response.status);
      const json=await response.json();
      if(json.ok===false)throw new Error(json.error||'Araç servisi yanıt vermedi');
      const vehicles=normalizeVehiclePayload(json);
      if(!vehicles.length)throw new Error('Araç listesi boş');
      setCached(cacheKey,vehicles);
      return vehicles;
    }catch(error){
      console.error('Araç kataloğu:',error);
      return fallbackVehicles();
    }
  }

  async function fetchJson(url,cacheKey,ttl=CACHE_TTL){
    if(cacheKey){
      const raw=getStored(cacheKey);
      if(raw&&Date.now()-raw.time<ttl)return raw.value;
    }
    const response=await fetch(url);
    if(!response.ok)throw new Error('HTTP '+response.status);
    const json=await response.json();
    if(json.ok===false)throw new Error(json.error||'Servis hatası');
    if(cacheKey)setStored(cacheKey,{time:Date.now(),value:json});
    return json;
  }
  async function loadFuelPrices(city,district='',force=false){
    const c=String(city||'Ankara').trim()||'Ankara';
    const d=String(district||'').trim();
    const key='nky_price_'+normalizeText(c)+'_'+normalizeText(d);
    const url=PRICE_API+'?city='+encodeURIComponent(c)+'&district='+encodeURIComponent(d)+(force?'&_='+Date.now():'');
    return fetchJson(url,force?null:key,10*60*1000);
  }
  async function loadChargePrices(force=false){
    const url=PRICE_API+'?mode=charge'+(force?'&_='+Date.now():'');
    return fetchJson(url,force?null:'nky_charge_prices',30*60*1000);
  }
  function priceFromPayload(type,fuel,charge,tariff='ac'){
    const t=normalizeFuelType(type);
    if(t==='elektrik')return parseNumber(tariff==='dc'?charge?.dc:charge?.ac);
    if(t==='dizel')return parseNumber(fuel?.motorin);
    if(t==='lpg')return parseNumber(fuel?.lpg);
    return parseNumber(fuel?.benzin);
  }

  function createVehicleAutocomplete({input,panel,onSelect,status,restore=true,paramName='vehicle',storedKey='nky_last_vehicle'}){
    let vehicles=fallbackVehicles();
    let activeIndex=-1;
    let restored=false;
    const inputEl=typeof input==='string'?$(input):input;
    const panelEl=typeof panel==='string'?$(panel):panel;
    if(!inputEl||!panelEl)throw new Error('Araç arama alanı bulunamadı.');

    function close(){panelEl.classList.remove('show');activeIndex=-1;}
    function currentList(){return Array.from(panelEl.querySelectorAll('.nky-suggestion'));}
    function render(){
      const q=normalizeText(inputEl.value);
      const list=vehicles.filter(v=>!q||normalizeText(v.label).includes(q)).slice(0,q?40:100);
      panelEl.innerHTML='';
      if(!list.length){panelEl.innerHTML='<div class="nky-status warn">Araç bulunamadı. Marka veya model adını daha kısa yazın.</div>';panelEl.classList.add('show');return;}
      list.forEach(v=>{
        const button=document.createElement('button');
        button.type='button';button.className='nky-suggestion';button.dataset.id=v.id;
        button.innerHTML='<span class="nky-suggestion-main"><strong>'+escapeHtml(v.label)+'</strong><small>'+escapeHtml(typeName(v.type))+' · '+fmt(v.cons,1)+' '+escapeHtml(v.unit)+'</small></span><span class="nky-badge">Seç</span>';
        button.addEventListener('pointerdown',e=>e.preventDefault());
        button.addEventListener('click',()=>{inputEl.value=v.label;close();onSelect?.(v);if(storedKey)setStored(storedKey,v);});
        panelEl.appendChild(button);
      });
      panelEl.classList.add('show');
    }
    function findCandidate(){
      if(!restore||restored)return null;
      const params=new URLSearchParams(location.search);
      const raw=String(params.get(paramName)||'').trim();
      const stored=storedKey?getStored(storedKey):null;
      const q=normalizeText(raw);
      let candidate=null;
      if(q){
        candidate=vehicles.find(x=>{
          const id=normalizeText(x.id),label=normalizeText(x.label);
          return id===q||label===q||label.includes(q)||q.includes(label);
        });
      }else if(stored){
        candidate=vehicles.find(x=>x.id===stored.id||normalizeText(x.label)===normalizeText(stored.label));
      }
      if(candidate){
        restored=true;
        inputEl.value=candidate.label;
        onSelect?.(candidate);
      }
      return candidate;
    }

    inputEl.addEventListener('focus',render);
    inputEl.addEventListener('click',render);
    inputEl.addEventListener('input',render);
    inputEl.addEventListener('keydown',event=>{
      const list=currentList();if(!list.length)return;
      if(event.key==='ArrowDown'){event.preventDefault();activeIndex=Math.min(activeIndex+1,list.length-1);}
      else if(event.key==='ArrowUp'){event.preventDefault();activeIndex=Math.max(activeIndex-1,0);}
      else if(event.key==='Enter'){
        if(activeIndex>=0){event.preventDefault();list[activeIndex].click();return;}
        const q=normalizeText(inputEl.value);
        const exact=vehicles.find(v=>normalizeText(v.label)===q);
        if(exact){event.preventDefault();inputEl.value=exact.label;close();onSelect?.(exact);if(storedKey)setStored(storedKey,exact);return;}
      }else if(event.key==='Escape'){close();return;}
      list.forEach((x,i)=>x.classList.toggle('active',i===activeIndex));
      list[activeIndex]?.scrollIntoView({block:'nearest'});
    });
    inputEl.addEventListener('blur',()=>setTimeout(close,160));

    if(status)showStatus(status,'Araç listesi hazır: '+vehicles.length+' araç.','ok');
    findCandidate();

    loadVehicles().then(v=>{
      if(Array.isArray(v)&&v.length)vehicles=v;
      if(status&&!restored)showStatus(status,'Araç kataloğu hazır: '+vehicles.length+' araç.','ok');
      findCandidate();
      if(panelEl.classList.contains('show'))render();
    }).catch(()=>{
      if(status&&!restored)showStatus(status,'Yerleşik araç listesi kullanılıyor: '+vehicles.length+' araç.','warn');
    });

    return {setVehicles(v){vehicles=v?.length?v:fallbackVehicles();},render,close,getVehicles:()=>vehicles};
  }

  function fillLocationSelects(citySelect,districtSelect,defaultCity=''){
    const cityEl=typeof citySelect==='string'?$(citySelect):citySelect;
    const distEl=typeof districtSelect==='string'?$(districtSelect):districtSelect;
    const data=global.NKY_LOCATIONS||{cities:[],districts:{}};
    cityEl.innerHTML='<option value="">İl seçin</option>'+data.cities.map(c=>'<option value="'+escapeHtml(c)+'">'+escapeHtml(c)+'</option>').join('');
    function updateDistricts(){
      const rows=data.districts[cityEl.value]||[];
      distEl.innerHTML='<option value="">İl merkezi / ilçe seçme</option>'+rows.map(d=>'<option value="'+escapeHtml(d)+'">'+escapeHtml(d)+'</option>').join('');
      distEl.disabled=!cityEl.value||!rows.length;
    }
    cityEl.addEventListener('change',updateDistricts);
    if(defaultCity&&data.cities.includes(defaultCity)){cityEl.value=defaultCity;updateDistricts();}
    return updateDistricts;
  }

  async function geocodeLocation(city,district=''){
    const query=(district?district+', ':'')+city+', Türkiye';
    const url='https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=tr&accept-language=tr&q='+encodeURIComponent(query);
    const response=await fetch(url,{headers:{'Accept':'application/json'}});
    if(!response.ok)throw new Error('Konum servisi yanıt vermedi');
    const json=await response.json();
    if(!json?.length)throw new Error(query+' bulunamadı');
    return [parseNumber(json[0].lon),parseNumber(json[0].lat)];
  }
  async function calculateRoute({fromCity,fromDistrict='',toCity,toDistrict=''}){
    if(!fromCity||!toCity)throw new Error('Kalkış ve varış ili seçin.');
    if(fromCity===toCity&&(!fromDistrict||!toDistrict||fromDistrict===toDistrict))throw new Error('Aynı il içindeki rota için iki farklı ilçe seçin.');
    const points=await Promise.all([geocodeLocation(fromCity,fromDistrict),geocodeLocation(toCity,toDistrict)]);
    const url='https://router.project-osrm.org/route/v1/driving/'+points[0].join(',')+';'+points[1].join(',')+'?overview=false&steps=false';
    const response=await fetch(url);
    if(!response.ok)throw new Error('Rota servisi yanıt vermedi');
    const json=await response.json();
    if(!json.routes?.length)throw new Error('Karayolu rotası bulunamadı');
    const route=json.routes[0];
    return {distanceKm:Math.round(route.distance/1000),durationMin:Math.round(route.duration/60),fromLabel:(fromDistrict?fromDistrict+', ':'')+fromCity,toLabel:(toDistrict?toDistrict+', ':'')+toCity};
  }
  function durationText(minutes){const h=Math.floor(minutes/60),m=minutes%60;return (h?h+' sa ':'')+m+' dk';}
  function mapsUrl(fromLabel,toLabel){return 'https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(fromLabel+', Türkiye')+'&destination='+encodeURIComponent(toLabel+', Türkiye')+'&travelmode=driving';}

  async function shareText(title,text,url=location.href){
    if(navigator.share){try{await navigator.share({title,text,url});return 'shared';}catch(e){if(e.name==='AbortError')return 'cancelled';}}
    if(navigator.clipboard){await navigator.clipboard.writeText(text+' '+url);return 'copied';}
    return 'unsupported';
  }
  function openWhatsApp(text,url=location.href){window.open('https://wa.me/?text='+encodeURIComponent(text+' '+url),'_blank','noopener');}
  function sendHeight(){
    const height=Math.max(document.documentElement.scrollHeight,document.body.scrollHeight);
    if(global.parent!==global)global.parent.postMessage({type:'nky-iframe-height',height,path:location.pathname},'*');
  }
  const observer=new ResizeObserver(()=>requestAnimationFrame(sendHeight));
  observer.observe(document.documentElement);
  global.addEventListener('load',sendHeight);
  global.addEventListener('resize',sendHeight);

  global.NKY={
    $,VEHICLE_API,PRICE_API,normalizeText,normalizeFuelType,typeName,fmt,money,parseNumber,validPositive,escapeHtml,
    showStatus,getStored,setStored,loadVehicles,loadFuelPrices,loadChargePrices,priceFromPayload,createVehicleAutocomplete,
    fillLocationSelects,calculateRoute,durationText,mapsUrl,shareText,openWhatsApp,sendHeight
  };
})(window);
