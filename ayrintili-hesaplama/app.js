(function(){
  'use strict';
  const N=window.NKY;
  let selectedVehicle=null;
  let lastResultText='';
  let lastRoute=null;
  const initialParams=new URLSearchParams(location.search);
  const initialConsumption=N.parseNumber(initialParams.get('consumption'));
  const initialFuel=N.normalizeFuelType(initialParams.get('fuel'));
  let useInitialConsumption=N.validPositive(initialConsumption);

  N.fillLocationSelects('fromCity','fromDistrict');
  N.fillLocationSelects('toCity','toDistrict');
  N.fillLocationSelects('priceCity',document.createElement('select'),'Ankara');

  const initialCity=String(initialParams.get('city')||'').trim();
  if(initialCity&&Array.from(N.$('priceCity').options).some(option=>option.value===initialCity))N.$('priceCity').value=initialCity;
  const initialDistance=N.parseNumber(initialParams.get('distance'));
  if(N.validPositive(initialDistance))N.$('distance').value=N.fmt(initialDistance,0);

  function syncPriceCity(){
    const from=N.$('fromCity').value;
    if(from)N.$('priceCity').value=from;
  }
  N.$('fromCity').addEventListener('change',syncPriceCity);

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
      selectedVehicle=vehicle;
      N.$('fuelType').value=vehicle.type;
      N.$('consumption').value=useInitialConsumption?N.fmt(initialConsumption,1):N.fmt(vehicle.cons,1);useInitialConsumption=false;
      updateUnits();
      N.$('vehicleSelected').textContent='Seçili araç: '+vehicle.label+' · '+N.typeName(vehicle.type)+' · '+N.fmt(vehicle.cons,1)+' '+vehicle.unit;
      N.$('vehicleSelected').className='nky-selected ok';
      loadPrice(false);
    }
  });

  N.$('routeButton').addEventListener('click',async()=>{
    const status=N.$('routeStatus');
    const data={fromCity:N.$('fromCity').value,fromDistrict:N.$('fromDistrict').value,toCity:N.$('toCity').value,toDistrict:N.$('toDistrict').value};
    N.showStatus(status,'Rota ve yaklaşık sürüş süresi hesaplanıyor…');
    try{
      const route=await N.calculateRoute(data);lastRoute=route;
      N.$('distance').value=route.distanceKm;
      N.$('mapsLink').href=N.mapsUrl(route.fromLabel,route.toLabel);
      N.$('mapsLink').classList.remove('nky-hidden');
      N.showStatus(status,route.fromLabel+' → '+route.toLabel+': yaklaşık '+N.fmt(route.distanceKm,0)+' km · '+N.durationText(route.durationMin)+'. Rota servisine göre değişebilir.','ok');
      syncPriceCity();
      loadPrice(false);
    }catch(error){N.showStatus(status,error.message+'. Mesafeyi elle yazabilirsiniz.','error');}
  });

  N.$('electricTariff').addEventListener('change',()=>{
    if(N.$('electricTariff').value==='home'){
      N.$('unitPrice').value='';
      N.showStatus('priceStatus','Evden şarj için elektrik faturanızdaki yaklaşık TL/kWh değerini yazın.','warn');
    }else loadPrice(false);
  });
  N.$('priceButton').addEventListener('click',()=>loadPrice(true));

  async function loadPrice(force){
    const type=N.$('fuelType').value;
    const city=N.$('priceCity').value||N.$('fromCity').value||'Ankara';
    const district=city===N.$('fromCity').value?N.$('fromDistrict').value:'';
    if(type==='elektrik'&&N.$('electricTariff').value==='home'){
      N.showStatus('priceStatus','Evden şarj fiyatını manuel girin.','warn');return;
    }
    N.showStatus('priceStatus','Güncel fiyat getiriliyor…');
    try{
      let price,source='',updated='';
      if(type==='elektrik'){
        const charge=await N.loadChargePrices(force);
        price=N.priceFromPayload(type,null,charge,N.$('electricTariff').value);source=charge.source||'şarj fiyat servisi';updated=charge.updatedAt||'';
      }else{
        const fuel=await N.loadFuelPrices(city,district,force);
        price=N.priceFromPayload(type,fuel,null);source=fuel.source||'yakıt fiyat servisi';updated=fuel.updatedAt||'';
      }
      if(!N.validPositive(price))throw new Error('Bu tür için fiyat bulunamadı');
      N.$('unitPrice').value=N.fmt(price,2);
      N.showStatus('priceStatus',city+(district?' / '+district:'')+' için '+N.typeName(type)+' fiyatı '+N.fmt(price,2)+' '+(type==='elektrik'?'TL/kWh':'TL/L')+' olarak getirildi'+(source?' · '+source:'')+(updated?' · '+updated:''),'ok');
    }catch(error){N.showStatus('priceStatus','Fiyat alınamadı: '+error.message+'. Alanı elle doldurabilirsiniz.','error');}
  }

  N.$('calculateButton').addEventListener('click',()=>{
    const distance=N.parseNumber(N.$('distance').value);
    const consumption=N.parseNumber(N.$('consumption').value);
    const price=N.parseNumber(N.$('unitPrice').value);
    const passengers=Math.max(1,parseInt(N.$('passengers').value,10)||1);
    const toll=Math.max(0,N.parseNumber(N.$('tollCost').value)||0);
    const parking=Math.max(0,N.parseNumber(N.$('parkingCost').value)||0);
    const other=Math.max(0,N.parseNumber(N.$('otherCost').value)||0);
    const error=N.$('formError');
    if(!N.validPositive(distance)||!N.validPositive(consumption)||!N.validPositive(price)){
      error.textContent='Mesafe, ortalama tüketim ve birim fiyat alanlarını geçerli biçimde doldurun.';error.classList.remove('nky-hidden');return;
    }
    error.classList.add('nky-hidden');
    const effective=distance*(N.$('roundTrip').checked?2:1);
    const energy=effective*consumption/100;
    const energyCost=energy*price;
    const extras=toll+parking+other;
    const total=energyCost+extras;
    const per100=consumption*price;
    const type=N.$('fuelType').value;
    const unit=type==='elektrik'?'kWh':'litre';
    const routeLabel=lastRoute?lastRoute.fromLabel+' → '+lastRoute.toLabel:N.fmt(effective,0)+' km yolculuk';
    const vehicleLabel=selectedVehicle?.label||N.typeName(type)+' araç';

    N.$('totalCost').textContent=N.money(total);
    N.$('effectiveDistance').textContent=N.fmt(effective,0)+' km';
    N.$('energyAmount').textContent=N.fmt(energy,2)+' '+unit;
    N.$('energyCost').textContent=N.money(energyCost);
    N.$('extraCost').textContent=N.money(extras);
    N.$('per100').textContent=N.money(per100);
    N.$('perKm').textContent=N.fmt(total/effective,2)+' TL/km';
    N.$('perPerson').textContent=N.money(total/passengers);
    N.$('resultVehicle').textContent=vehicleLabel;
    N.$('energyLabel').textContent=type==='elektrik'?'Harcanacak enerji':'Harcanacak yakıt';
    N.$('resultNote').textContent=(N.$('roundTrip').checked?'Gidiş-dönüş':'Tek yön')+' hesaplandı. Ek giderler '+N.money(extras)+' olarak dahil edildi.';
    lastResultText=vehicleLabel+' ile '+routeLabel+' için tahmini toplam '+N.money(total)+'. '+N.fmt(effective,0)+' km, '+N.fmt(energy,2)+' '+unit+', kişi başı '+N.money(total/passengers)+'.';
    N.$('result').classList.add('show');
    N.$('result').scrollIntoView({behavior:'smooth',block:'start'});
    N.sendHeight();
  });

  N.$('shareButton').addEventListener('click',async()=>{
    if(!lastResultText)return N.showStatus('formError','Önce hesaplama yapın.','error');
    const result=await N.shareText('Yolculuk maliyeti',lastResultText,'https://www.arabanekadaryakar.com/p/ayrntl-yakt-maliyeti-hesaplama.html');
    if(result==='copied')N.showStatus('resultNote','Sonuç panoya kopyalandı.','ok');
  });
  N.$('whatsappButton').addEventListener('click',()=>{if(lastResultText)N.openWhatsApp(lastResultText,'https://www.arabanekadaryakar.com/p/ayrntl-yakt-maliyeti-hesaplama.html');});
  N.$('copyButton').addEventListener('click',async()=>{if(lastResultText){await navigator.clipboard.writeText(lastResultText);N.showStatus('resultNote','Sonuç panoya kopyalandı.','ok');}});
})();
