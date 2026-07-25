(function(){
  'use strict';
  const N=window.NKY;
  let selectedVehicle=null;
  let lastText='';
  const initialParams=new URLSearchParams(location.search);
  const initialConsumption=N.parseNumber(initialParams.get('consumption'));
  const initialFuel=N.normalizeFuelType(initialParams.get('fuel'));
  let useInitialConsumption=N.validPositive(initialConsumption);
  N.fillLocationSelects('priceCity',document.createElement('select'),'Ankara');
  const initialCity=String(initialParams.get('city')||'').trim();
  if(initialCity&&Array.from(N.$('priceCity').options).some(option=>option.value===initialCity))N.$('priceCity').value=initialCity;
  const initialMonthlyKm=N.parseNumber(initialParams.get('monthlyKm'));
  if(N.validPositive(initialMonthlyKm))N.$('monthlyKm').value=N.fmt(initialMonthlyKm,0);

  if(initialParams.get('fuel'))N.$('fuelType').value=initialFuel;
  if(useInitialConsumption)N.$('consumption').value=N.fmt(initialConsumption,1);

  function updateUnits(){
    const electric=N.$('fuelType').value==='elektrik';
    N.$('consumptionUnit').textContent=electric?'kWh/100 km':'L/100 km';
    N.$('priceUnit').textContent=electric?'TL/kWh':'TL/L';
    N.$('tariffField').classList.toggle('nky-hidden',!electric);
  }
  N.$('fuelType').addEventListener('change',()=>{updateUnits();selectedVehicle=null;N.$('vehicleSelected').classList.remove('ok');N.$('vehicleSelected').textContent='Yakıt türü elle değiştirildi. Tüketim ve fiyatı kontrol edin.';});
  updateUnits();

  N.createVehicleAutocomplete({
    input:'vehicleSearch',panel:'vehicleSuggestions',status:'vehicleSelected',
    onSelect(vehicle){
      selectedVehicle=vehicle;N.$('fuelType').value=vehicle.type;N.$('consumption').value=useInitialConsumption?N.fmt(initialConsumption,1):N.fmt(vehicle.cons,1);useInitialConsumption=false;updateUnits();
      N.$('vehicleSelected').textContent='Seçili araç: '+vehicle.label+' · '+N.typeName(vehicle.type)+' · '+N.fmt(vehicle.cons,1)+' '+vehicle.unit;
      N.$('vehicleSelected').className='nky-selected ok';loadPrice(false);
    }
  });

  N.$('priceButton').addEventListener('click',()=>loadPrice(true));
  N.$('electricTariff').addEventListener('change',()=>{
    if(N.$('electricTariff').value==='home'){
      N.$('unitPrice').value='';N.showStatus('priceStatus','Evden şarj için faturanızdaki yaklaşık TL/kWh değerini yazın.','warn');
    }else loadPrice(false);
  });
  async function loadPrice(force){
    const type=N.$('fuelType').value,city=N.$('priceCity').value||'Ankara';
    if(type==='elektrik'&&N.$('electricTariff').value==='home'){N.showStatus('priceStatus','Evden şarj fiyatını manuel girin.','warn');return;}
    N.showStatus('priceStatus','Güncel fiyat getiriliyor…');
    try{
      let price;
      if(type==='elektrik'){const charge=await N.loadChargePrices(force);price=N.priceFromPayload(type,null,charge,N.$('electricTariff').value);}
      else{const fuel=await N.loadFuelPrices(city,'',force);price=N.priceFromPayload(type,fuel,null);}
      if(!N.validPositive(price))throw new Error('Fiyat bulunamadı');
      N.$('unitPrice').value=N.fmt(price,2);N.showStatus('priceStatus',city+' için '+N.typeName(type)+' birim fiyatı '+N.fmt(price,2)+' '+(type==='elektrik'?'TL/kWh':'TL/L')+' olarak getirildi.','ok');
    }catch(error){N.showStatus('priceStatus','Fiyat alınamadı: '+error.message+'. Alanı elle doldurabilirsiniz.','error');}
  }

  function calculate(scroll=true){
    const km=N.parseNumber(N.$('monthlyKm').value),cons=N.parseNumber(N.$('consumption').value),price=N.parseNumber(N.$('unitPrice').value);
    const error=N.$('formError');
    if(![km,cons,price].every(N.validPositive)){error.textContent='Aylık kilometre, ortalama tüketim ve birim fiyat alanlarını kontrol edin.';error.classList.remove('nky-hidden');return false;}
    error.classList.add('nky-hidden');
    const energy=km*cons/100,per100=cons*price,monthly=energy*price,yearly=monthly*12;
    const type=N.$('fuelType').value,unit=type==='elektrik'?'kWh':'litre',vehicle=selectedVehicle?.label||N.typeName(type)+' araç';
    N.$('monthlyCost').textContent=N.money(monthly);N.$('yearlyCost').textContent=N.money(yearly);N.$('per100').textContent=N.money(per100);N.$('perKm').textContent=N.fmt(monthly/km,2)+' TL/km';N.$('monthlyEnergy').textContent=N.fmt(energy,2)+' '+unit;N.$('energyLabel').textContent=type==='elektrik'?'Aylık enerji':'Aylık yakıt';
    N.showStatus('resultNote',N.fmt(km,0)+' km/ay ve '+N.fmt(cons,1)+' '+(type==='elektrik'?'kWh/100 km':'L/100 km')+' üzerinden hesaplandı.','warn');
    lastText=vehicle+' için aylık '+N.fmt(km,0)+' km kullanımda tahmini gider '+N.money(monthly)+', yıllık '+N.money(yearly)+'.';
    N.$('result').classList.add('show');if(scroll)N.$('result').scrollIntoView({behavior:'smooth',block:'start'});N.sendHeight();return true;
  }
  N.$('calculateButton').addEventListener('click',()=>calculate(true));
  document.querySelectorAll('[data-km]').forEach(button=>button.addEventListener('click',()=>{N.$('monthlyKm').value=button.dataset.km;if(N.$('result').classList.contains('show'))calculate(false);}));

  N.$('shareButton').addEventListener('click',async()=>{if(lastText){const r=await N.shareText('Aylık araç gideri',lastText,'https://www.arabanekadaryakar.com/p/aylk-yakt-gideri-hesaplama.html');if(r==='copied')N.showStatus('resultNote','Sonuç panoya kopyalandı.','ok');}});
  N.$('whatsappButton').addEventListener('click',()=>{if(lastText)N.openWhatsApp(lastText,'https://www.arabanekadaryakar.com/p/aylk-yakt-gideri-hesaplama.html');});
  N.$('copyButton').addEventListener('click',async()=>{if(lastText){await navigator.clipboard.writeText(lastText);N.showStatus('resultNote','Sonuç panoya kopyalandı.','ok');}});
})();
