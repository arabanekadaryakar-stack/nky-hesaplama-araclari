(function(global){
  'use strict';

  const VEHICLE_API='https://script.google.com/macros/s/AKfycbxNwL7NGF9eTBJApiu3PTIKHfPDt7wjmEg9rThG3fcVLdhkDaZWvmc2QDII4VcXONWAnQ/exec';
  const PRICE_API='https://script.google.com/macros/s/AKfycbwJ2dzHkJRgvW2d9D_inYkYVi9s0wnZlEysyomC9W5BZ7W63nhgkHpL22QoP5-A6tMoyA/exec';
  const CLIENT='nky-web-2026';
  const SITE='arabanekadaryakar.com';
  const CACHE_TTL=10*60*1000;

  const fallbackVehicles=[
    {brand:'Chery',name:'Omoda 5 Pro 1.6 TGDI Benzin',type:'benzin',cons:9.1,unit:'L/100 km'},
    {brand:'Fiat',name:'Egea 1.6 Multijet Dizel',type:'dizel',cons:4.8,unit:'L/100 km'},
    {brand:'Renault',name:'Clio 1.0 TCe Benzin',type:'benzin',cons:6.2,unit:'L/100 km'},
    {brand:'Toyota',name:'Corolla 1.8 Hybrid',type:'hibrit',cons:4.6,unit:'L/100 km'},
    {brand:'Togg',name:'T10X V2 RWD Elektrikli',type:'elektrik',cons:18.3,unit:'kWh/100 km'},
    {brand:'Tesla',name:'Model Y RWD Elektrikli',type:'elektrik',cons:16.9,unit:'kWh/100 km'}
  ];

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
    const rows=Array.isArray(payload?.vehicles)?payload.vehicles:[];
    const result=[];
    rows.forEach(r=>{
      if(r.active===false||['hayır','hayir','false','0','pasif'].includes(String(r.active||'').toLocaleLowerCase('tr-TR')))return;
      const brand=String(r.brand||r.marka||'').trim();
      const name=String(r.name||r.modelMotor||r.model||'').trim();
      const type=normalizeFuelType(r.type||r.yakitTuru||r.yakitturu);
      const cons=parseNumber(r.cons??r.tuketim);
      if(!brand||!name||!validPositive(cons))return;
      result.push({
        id:r.id||r.slug||slugify(brand+' '+name),brand,name,label:brand+' '+name,type,cons,
        unit:r.unit||r.birim||(type==='elektrik'?'kWh/100 km':'L/100 km'),source:r.source||r.kaynak||'',updatedAt:r.updatedAt||r.guncellemeTarihi||''
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
      return fallbackVehicles.map(v=>({...v,id:slugify(v.brand+' '+v.name),label:v.brand+' '+v.name}));
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

  function createVehicleAutocomplete({input,panel,onSelect,status,restore=true}){
    let vehicles=[];
    let activeIndex=-1;
    const inputEl=typeof input==='string'?$(input):input;
    const panelEl=typeof panel==='string'?$(panel):panel;
    if(!inputEl||!panelEl)throw new Error('Araç arama alanı bulunamadı.');

    function close(){panelEl.classList.remove('show');activeIndex=-1;}
    function currentList(){return Array.from(panelEl.querySelectorAll('.nky-suggestion'));}
    function render(){
      const q=normalizeText(inputEl.value);
      const list=vehicles.filter(v=>!q||normalizeText(v.label).includes(q)).slice(0,q?30:80);
      panelEl.innerHTML='';
      if(!list.length){panelEl.innerHTML='<div class="nky-status warn">Araç bulunamadı. Daha kısa bir marka veya model adı deneyin.</div>';panelEl.classList.add('show');return;}
      list.forEach(v=>{
        const button=document.createElement('button');
        button.type='button';button.className='nky-suggestion';button.dataset.id=v.id;
        button.innerHTML='<span class="nky-suggestion-main"><strong>'+escapeHtml(v.label)+'</strong><small>'+escapeHtml(typeName(v.type))+' · '+fmt(v.cons,1)+' '+escapeHtml(v.unit)+'</small></span><span class="nky-badge">Seç</span>';
        button.addEventListener('mousedown',e=>e.preventDefault());
        button.addEventListener('click',()=>{inputEl.value=v.label;close();onSelect?.(v);setStored('nky_last_vehicle',v);});
        panelEl.appendChild(button);
      });
      panelEl.classList.add('show');
    }
    inputEl.addEventListener('focus',render);
    inputEl.addEventListener('input',render);
    inputEl.addEventListener('keydown',event=>{
      const list=currentList();if(!list.length)return;
      if(event.key==='ArrowDown'){event.preventDefault();activeIndex=Math.min(activeIndex+1,list.length-1);}
      else if(event.key==='ArrowUp'){event.preventDefault();activeIndex=Math.max(activeIndex-1,0);}
      else if(event.key==='Enter'&&activeIndex>=0){event.preventDefault();list[activeIndex].click();return;}
      else if(event.key==='Escape'){close();return;}
      list.forEach((x,i)=>x.classList.toggle('active',i===activeIndex));
      list[activeIndex]?.scrollIntoView({block:'nearest'});
    });
    inputEl.addEventListener('blur',()=>setTimeout(close,160));

    loadVehicles().then(v=>{
      vehicles=v;
      if(status)showStatus(status,'Araç kataloğu hazır: '+vehicles.length+' araç.','ok');
      if(restore){
        const params=new URLSearchParams(location.search);
        const vehicleParam=params.get('vehicle');
        const stored=getStored('nky_last_vehicle');
        const candidate=vehicleParam?vehicles.find(x=>normalizeText(x.id)===normalizeText(vehicleParam)||normalizeText(x.label).includes(normalizeText(vehicleParam))):stored&&vehicles.find(x=>x.id===stored.id);
        if(candidate){inputEl.value=candidate.label;onSelect?.(candidate);}
      }
    });
    return {setVehicles(v){vehicles=v||[];},render,close,getVehicles:()=>vehicles};
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
