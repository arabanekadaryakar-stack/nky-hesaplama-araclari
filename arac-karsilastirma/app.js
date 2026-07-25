(function(){
  'use strict';
  const N=window.NKY;
  const selected=[null,null];
  let mode='route';
  let routeKm=0;
  let routeLabel='';
  let lastText='';

  N.fillLocationSelects('fromCity','fromDistrict');
  N.fillLocationSelects('toCity','toDistrict');
  N.fillLocationSelects('priceCity',document.createElement('select'),'Ankara');

  function selectVehicle(slot,vehicle){
    selected[slot]=vehicle;
    const i=slot+1;
    N.$('cons'+i).value=N.fmt(vehicle.cons,1);
    N.$('unit'+i).textContent=vehicle.type==='elektrik'?'kWh/100 km':'L/100 km';
    N.$('priceUnit'+i).textContent=vehicle.type==='elektrik'?'TL/kWh':'TL/L';
    N.$('selected'+i).textContent='Seçili: '+vehicle.label+' · '+N.typeName(vehicle.type)+' · '+N.fmt(vehicle.cons,1)+' '+vehicle.unit;
    N.$('selected'+i).className='nky-selected ok';
    if(selected[0]&&selected[1])loadPrices(false);
  }
  N.createVehicleAutocomplete({input:'vehicle1',panel:'suggestions1',status:'selected1',restore:false,onSelect:v=>selectVehicle(0,v)});
  N.createVehicleAutocomplete({input:'vehicle2',panel:'suggestions2',status:'selected2',restore:false,onSelect:v=>selectVehicle(1,v)});

  document.querySelectorAll('.nky-tab').forEach(button=>button.addEventListener('click',()=>{
    mode=button.dataset.mode;
    document.querySelectorAll('.nky-tab').forEach(b=>b.classList.toggle('active',b===button));
    document.querySelectorAll('.nky-panel').forEach(p=>p.classList.toggle('active',p.dataset.panel===mode));
    N.sendHeight();
  }));

  N.$('fromCity').addEventListener('change',()=>{if(N.$('fromCity').value)N.$('priceCity').value=N.$('fromCity').value;});
  N.$('routeButton').addEventListener('click',async()=>{
    N.showStatus('routeStatus','Rota hesaplanıyor…');
    try{
      const route=await N.calculateRoute({fromCity:N.$('fromCity').value,fromDistrict:N.$('fromDistrict').value,toCity:N.$('toCity').value,toDistrict:N.$('toDistrict').value});
      routeKm=route.distanceKm;routeLabel=route.fromLabel+' → '+route.toLabel;
      N.$('distanceKm').value=routeKm;
      N.showStatus('routeStatus',routeLabel+': yaklaşık '+N.fmt(routeKm,0)+' km · '+N.durationText(route.durationMin)+'.','ok');
      if(N.$('fromCity').value)N.$('priceCity').value=N.$('fromCity').value;
    }catch(error){N.showStatus('routeStatus',error.message+'. Mesafe bazında elle giriş yapabilirsiniz.','error');}
  });

  N.$('priceButton').addEventListener('click',()=>loadPrices(true));
  N.$('electricTariff').addEventListener('change',()=>loadPrices(false));
  async function loadPrices(force){
    if(!selected[0]&&!selected[1])return N.showStatus('priceStatus','Önce en az bir araç seçin.','warn');
    const city=N.$('priceCity').value||N.$('fromCity').value||'Ankara';
    N.showStatus('priceStatus','Yakıt ve şarj fiyatları getiriliyor…');
    try{
      const needsFuel=selected.some(v=>v&&v.type!=='elektrik');
      const needsCharge=selected.some(v=>v&&v.type==='elektrik');
      const [fuel,charge]=await Promise.all([needsFuel?N.loadFuelPrices(city,'',force):Promise.resolve(null),needsCharge?N.loadChargePrices(force):Promise.resolve(null)]);
      selected.forEach((v,index)=>{
        if(!v)return;
        const price=N.priceFromPayload(v.type,fuel,charge,N.$('electricTariff').value);
        if(N.validPositive(price))N.$('price'+(index+1)).value=N.fmt(price,2);
      });
      N.showStatus('priceStatus',city+' için seçili araçların fiyatları getirildi. Alanları isterseniz değiştirebilirsiniz.','ok');
    }catch(error){N.showStatus('priceStatus','Fiyatlar alınamadı: '+error.message+'. Değerleri elle girebilirsiniz.','error');}
  }

  N.$('compareButton').addEventListener('click',()=>{
    const error=N.$('formError');
    if(!selected[0]||!selected[1]){error.textContent='İki aracı da seçin.';error.classList.remove('nky-hidden');return;}
    const c1=N.parseNumber(N.$('cons1').value),p1=N.parseNumber(N.$('price1').value),c2=N.parseNumber(N.$('cons2').value),p2=N.parseNumber(N.$('price2').value);
    if(![c1,p1,c2,p2].every(N.validPositive)){error.textContent='İki aracın tüketim ve birim fiyat alanlarını kontrol edin.';error.classList.remove('nky-hidden');return;}
    let basis,label,monthlyKm=0;
    if(mode==='route'){basis=routeKm||N.parseNumber(N.$('distanceKm').value);label='Rota maliyeti';}
    else if(mode==='distance'){basis=N.parseNumber(N.$('distanceKm').value);label='Yol maliyeti';}
    else{monthlyKm=N.parseNumber(N.$('monthlyKm').value);basis=monthlyKm;label='Aylık maliyet';}
    if(!N.validPositive(basis)){error.textContent='Geçerli bir mesafe veya aylık kilometre girin.';error.classList.remove('nky-hidden');return;}
    error.classList.add('nky-hidden');
    const per100=[c1*p1,c2*p2];
    const main=[basis*per100[0]/100,basis*per100[1]/100];
    const compareMonthly=monthlyKm||1500;
    const monthly=[compareMonthly*per100[0]/100,compareMonthly*per100[1]/100];
    const yearly=[monthly[0]*12,monthly[1]*12];
    const cheap=main[0]<=main[1]?0:1;
    const diff=Math.abs(main[0]-main[1]);
    const names=[selected[0].label,selected[1].label];

    for(let i=0;i<2;i++){
      const n=i+1;
      N.$('resultName'+n).textContent=names[i];N.$('mainCost'+n).textContent=N.money(main[i]);N.$('mainLabel'+n).textContent=label;
      N.$('per100_'+n).textContent=N.money(per100[i]);N.$('monthly_'+n).textContent=N.money(monthly[i]);N.$('yearly_'+n).textContent=N.money(yearly[i]);
      N.$('resultCard'+n).classList.toggle('cheaper',i===cheap);
    }
    const scope=mode==='route'?(routeLabel||N.fmt(basis,0)+' km rota'):mode==='distance'?N.fmt(basis,0)+' km yol':N.fmt(basis,0)+' km/ay';
    N.$('winner').textContent=names[cheap]+' bu koşullarda daha düşük enerji maliyetine sahip.';
    N.showStatus('difference',scope+' için fark yaklaşık '+N.money(diff)+'. 100 km farkı '+N.money(Math.abs(per100[0]-per100[1]))+'.','warn');
    lastText=names[0]+' ile '+names[1]+' karşılaştırması: '+scope+'. Daha ekonomik: '+names[cheap]+'. Fark '+N.money(diff)+'.';
    N.$('result').classList.add('show');N.$('result').scrollIntoView({behavior:'smooth',block:'start'});N.sendHeight();
  });

  N.$('shareButton').addEventListener('click',async()=>{if(lastText){const r=await N.shareText('Araç karşılaştırması',lastText,'https://www.arabanekadaryakar.com/');if(r==='copied')N.showStatus('difference','Karşılaştırma sonucu panoya kopyalandı.','ok');}});
  N.$('whatsappButton').addEventListener('click',()=>{if(lastText)N.openWhatsApp(lastText,'https://www.arabanekadaryakar.com/');});
  N.$('copyButton').addEventListener('click',async()=>{if(lastText){await navigator.clipboard.writeText(lastText);N.showStatus('difference','Karşılaştırma sonucu panoya kopyalandı.','ok');}});
})();
