
const state = {
  route: 'dashboard',
  selectedSlot: null,
  selectedDate: '2026-07-23',
  appointments: [
    {time:'08:00', client:'Juan Pérez', bike:'Yamaha FZ25 · ABC12D', tech:'Carlos Gómez', type:'Cambio de aceite', color:'blue'},
    {time:'10:00', client:'Ana Ruiz', bike:'Pulsar NS200 · JKL48F', tech:'Pedro Sánchez', type:'Sincronización', color:'green'},
    {time:'14:00', client:'Mateo León', bike:'Honda CB190R · MNO75G', tech:'Andrés Mejía', type:'Frenos', color:'yellow'}
  ]
};

const fmt = n => new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n);
const content = document.querySelector('#content');
const modalBackdrop = document.querySelector('#modalBackdrop');
const modalContent = document.querySelector('#modalContent');

function pageHeader(title, subtitle, actions=''){
  return `<div class="page-header"><div><h1>${title}</h1><p>${subtitle}</p></div><div class="page-actions">${actions}</div></div>`;
}

function kpi(label,value,trend,icon='↗',down=false){
  return `<article class="card kpi-card"><div class="kpi-head"><span>${label}</span><span class="kpi-icon">${icon}</span></div><div class="kpi-value">${value}</div><div class="kpi-trend ${down?'down':''}">${trend}</div></article>`;
}

function badge(text,type='blue'){return `<span class="badge ${type}">${text}</span>`}

function dashboard(){
  return `
  ${pageHeader('Buenos días, Juan 👋','Aquí tienes el resumen operativo del taller para hoy, martes 21 de julio.',
    `<button class="btn btn-secondary" data-action="export-report">⇩ Exportar</button><button class="btn btn-primary" data-action="new-reception">＋ Nueva recepción</button>`)}
  <section class="kpi-grid">
    ${kpi('VENTAS DEL MES','$28.540.000','↑ 12,4% vs. mes anterior','＄')}
    ${kpi('MOTOS EN TALLER','18','4 listas para entregar','◉')}
    ${kpi('CITAS DE HOY','12','3 espacios disponibles','▦')}
    ${kpi('TICKET PROMEDIO','$187.300','↑ 6,2% vs. mes anterior','↗')}
  </section>
  <section class="grid-2">
    <article class="card card-pad">
      <div class="card-title"><div><h3>Ingresos del taller</h3><small>Comportamiento de los últimos 7 meses</small></div><div class="legend"><span><i style="background:#2684ff"></i>Ventas</span><span><i style="background:#32d4ff"></i>Meta</span></div></div>
      <div class="chart-wrap"><canvas id="salesChart"></canvas></div>
    </article>
    <article class="card card-pad">
      <div class="card-title"><div><h3>Órdenes por estado</h3><small>Distribución actual</small></div><button class="icon-btn">⋮</button></div>
      <div class="chart-wrap"><canvas id="donutChart"></canvas></div>
    </article>
  </section>
  <section class="grid-2" style="margin-top:18px">
    <article class="card card-pad">
      <div class="card-title"><div><h3>Actividad reciente</h3><small>Últimos movimientos del taller</small></div><button class="btn btn-ghost" data-route="ordenes">Ver todas</button></div>
      <div class="timeline">
        <div class="timeline-item"><strong>OT-1058 cambió a “Lista para entregar”</strong><p>Yamaha FZ25 · Técnico: Carlos Gómez · hace 8 min</p></div>
        <div class="timeline-item"><strong>Nueva cita agendada desde el portal</strong><p>Valentina Ríos · Suzuki Gixxer · mañana 09:00</p></div>
        <div class="timeline-item"><strong>Cotización COT-0361 aprobada</strong><p>Pulsar NS200 · Valor aprobado: $684.000 · hace 42 min</p></div>
        <div class="timeline-item"><strong>Ingreso de inventario registrado</strong><p>Compra CMP-0094 · Motopartes Antioquia · hace 1 h</p></div>
      </div>
    </article>
    <article class="card card-pad">
      <div class="card-title"><div><h3>Próximas citas</h3><small>Agenda de hoy</small></div><button class="btn btn-ghost" data-route="agenda">Abrir agenda</button></div>
      <div class="summary-list">
        <div class="summary-row"><span>08:00 · Juan Pérez</span><strong>FZ25 · Carlos</strong></div>
        <div class="summary-row"><span>10:00 · Ana Ruiz</span><strong>NS200 · Pedro</strong></div>
        <div class="summary-row"><span>14:00 · Mateo León</span><strong>CB190R · Andrés</strong></div>
        <div class="summary-row"><span>16:00</span><strong style="color:#55dda0">Disponible</strong></div>
      </div>
    </article>
  </section>`;
}

function agenda(){
  const days=['Lun 20','Mar 21','Mié 22','Jue 23','Vie 24','Sáb 25'];
  const hours=['08:00','09:00','10:00','11:00','12:00','14:00','15:00','16:00'];
  let cells = `<div class="calendar-head"></div>${days.map(d=>`<div class="calendar-head"><strong>${d.split(' ')[0]}</strong><small>${d.split(' ')[1]} JUL</small></div>`).join('')}`;
  hours.forEach((h,i)=>{
    cells += `<div class="time-cell">${h}</div>`;
    days.forEach((d,j)=>{
      let ap='';
      if(i===0&&j===1) ap=`<div class="appointment"><strong>Juan Pérez</strong>FZ25 · Cambio aceite<br>Carlos Gómez</div>`;
      if(i===2&&j===1) ap=`<div class="appointment green"><strong>Ana Ruiz</strong>NS200 · Sincronización<br>Pedro Sánchez</div>`;
      if(i===5&&j===1) ap=`<div class="appointment yellow"><strong>Mateo León</strong>CB190R · Frenos<br>Andrés Mejía</div>`;
      if(i===1&&j===3) ap=`<div class="appointment"><strong>Valentina Ríos</strong>Gixxer · Revisión general<br>Carlos Gómez</div>`;
      cells += `<div class="calendar-cell available" data-action="calendar-slot" data-time="${h}" data-day="${d}">${ap}</div>`;
    });
  });
  return `
  ${pageHeader('Agenda de taller','Consulta la disponibilidad, asigna técnicos y administra citas del portal.',
    `<button class="btn btn-secondary">Hoy</button><button class="btn btn-secondary">Semana⌄</button><button class="btn btn-primary" data-action="new-appointment">＋ Nueva cita</button>`)}
  <div class="toolbar card card-pad">
    <select class="select"><option>Todos los técnicos</option><option>Carlos Gómez</option><option>Pedro Sánchez</option><option>Andrés Mejía</option></select>
    <select class="select"><option>Todos los servicios</option><option>Cambio de aceite</option><option>Diagnóstico</option><option>Sincronización</option></select>
    <span class="filter-spacer muted">3 espacios disponibles hoy</span>
  </div>
  <article class="card" style="overflow:auto"><div class="calendar-shell">${cells}</div></article>`;
}

function recepcion(){
 return `
 ${pageHeader('Nueva recepción','Registra el ingreso de una motocicleta, su estado y la persona que la recibe.',
 `<button class="btn btn-secondary">Guardar borrador</button><button class="btn btn-primary" data-action="save-reception">Crear recepción</button>`)}
 <div class="grid-2">
  <article class="card card-pad">
   <div class="card-title"><div><h3>Datos de la recepción</h3><small>Información básica del ingreso</small></div>${badge('Borrador','yellow')}</div>
   <div class="form-grid">
    <div class="form-group"><label>Cliente</label><input class="input" value="Juan Pérez" /></div>
    <div class="form-group"><label>Motocicleta</label><input class="input" value="Yamaha FZ25 · ABC12D" /></div>
    <div class="form-group"><label>Fecha y hora</label><input class="input" value="21/07/2026 14:30" /></div>
    <div class="form-group"><label>Recibido por</label><select class="select"><option>Laura Martínez</option><option>Juan Administrador</option></select></div>
    <div class="form-group"><label>Kilometraje</label><input class="input" value="18.450 km" /></div>
    <div class="form-group"><label>Nivel de combustible</label><select class="select"><option>1/4</option><option>1/2</option><option>3/4</option></select></div>
    <div class="form-group full"><label>Motivo de ingreso</label><textarea class="textarea">Ruido en la transmisión, pérdida de fuerza y revisión general.</textarea></div>
   </div>
  </article>
  <article class="card card-pad">
   <div class="card-title"><div><h3>Checklist de ingreso</h3><small>Estado visual y accesorios recibidos</small></div><span class="muted">8/10 revisados</span></div>
   <div class="summary-list">
    ${['Llave principal','Casco','Espejos','Luces delanteras','Direccionales','Pito','Freno delantero','Freno trasero','Rayones visibles','Fuga de fluidos'].map((x,i)=>`<label class="summary-row"><span>${x}</span><input type="checkbox" ${i<8?'checked':''}></label>`).join('')}
   </div>
  </article>
 </div>
 <article class="card card-pad" style="margin-top:18px">
  <div class="card-title"><div><h3>Evidencia fotográfica</h3><small>Fotos de ingreso para trazabilidad</small></div><button class="btn btn-secondary">＋ Agregar fotos</button></div>
  <div class="grid-3">
   <div class="empty-state" style="padding:28px;background:#0c1626;border-radius:14px"><div class="empty-icon">📷</div><strong>Vista frontal</strong><p class="muted">Foto simulada</p></div>
   <div class="empty-state" style="padding:28px;background:#0c1626;border-radius:14px"><div class="empty-icon">📷</div><strong>Lateral izquierdo</strong><p class="muted">Foto simulada</p></div>
   <div class="empty-state" style="padding:28px;background:#0c1626;border-radius:14px"><div class="empty-icon">＋</div><strong>Agregar evidencia</strong><p class="muted">JPG o PNG</p></div>
  </div>
 </article>`;
}

function ordenes(){
 const cols=[
  ['Recibidas','blue',[['OT-1062','Suzuki Gixxer','Laura / Sin asignar'],['OT-1061','Yamaha MT-03','Laura / Carlos']]],
  ['Diagnóstico','purple',[['OT-1060','Honda CB190R','Juan / Pedro'],['OT-1059','Pulsar N250','Laura / Andrés']]],
  ['Esperando aprobación','yellow',[['OT-1057','Pulsar NS200','Laura / Pedro'],['OT-1056','Yamaha XTZ250','Juan / Carlos']]],
  ['En reparación','blue',[['OT-1055','KTM Duke 390','Laura / Andrés'],['OT-1054','Yamaha FZ25','Laura / Carlos']]],
  ['Lista para entregar','green',[['OT-1058','Yamaha FZ25','Laura / Carlos'],['OT-1053','Suzuki DR150','Juan / Pedro']]]
 ];
 return `
 ${pageHeader('Órdenes de trabajo','Visualiza y controla el avance de cada motocicleta.',
 `<button class="btn btn-secondary">Filtros</button><button class="btn btn-primary" data-action="new-reception">＋ Nueva orden</button>`)}
 <div class="toolbar"><input class="input" placeholder="Buscar orden, placa o cliente..."><select class="select"><option>Todos los técnicos</option></select><select class="select"><option>Todos los estados</option></select></div>
 <div class="kanban">${cols.map(([name,color,items])=>`<section class="kanban-col"><div class="kanban-head"><strong>${name}</strong><span class="kanban-count">${items.length}</span></div>${items.map((o,i)=>`
 <article class="order-card" data-action="open-order">
  <div class="order-top"><span>${o[0]}</span><span>${i===0?'hace 18 min':'hace 1 h'}</span></div>
  <h4>${o[1]}</h4><p>Placa: ${['ABC12D','JKL48F','MNO75G'][i%3]}</p><p>Recibe / técnico: ${o[2]}</p>
  <div class="order-footer">${badge(name,color)}<div class="person-avatar">${o[2].split('/').pop().trim().slice(0,2).toUpperCase()}</div></div>
 </article>`).join('')}</section>`).join('')}</div>`;
}

function cotizaciones(){
 return listPage('Cotizaciones','Crea, envía por correo y convierte cotizaciones en órdenes de trabajo.',
 ['Número','Cliente / moto','Fecha','Vigencia','Total','Estado','Acciones'],
 [
  ['COT-0364','Juan Pérez · FZ25','21/07/2026','15 días','$684.000',badge('Aprobada','green'),'⋯'],
  ['COT-0363','Ana Ruiz · NS200','21/07/2026','15 días','$398.500',badge('Enviada','blue'),'⋯'],
  ['COT-0362','Mateo León · CB190R','20/07/2026','15 días','$1.240.000',badge('Pendiente','yellow'),'⋯'],
  ['COT-0361','Valentina Ríos · Gixxer','20/07/2026','15 días','$278.000',badge('Rechazada','red'),'⋯']
 ],`<button class="btn btn-primary" data-action="new-quote">＋ Nueva cotización</button>`);
}

function clientes(){
 return listPage('Clientes','Administra los datos de contacto y el historial de cada cliente.',
 ['Cliente','Documento','Contacto','Motocicletas','Última visita','Estado','Acciones'],
 [
  ['Juan Pérez','CC 1.037.542.198','310 555 0182 · juan@email.com','2','21/07/2026',badge('Activo','green'),'⋯'],
  ['Ana Ruiz','CC 43.820.114','300 812 7750 · ana@email.com','1','21/07/2026',badge('Activo','green'),'⋯'],
  ['Mateo León','CC 1.128.305.744','315 641 2240','3','20/07/2026',badge('Activo','green'),'⋯'],
  ['Valentina Ríos','CC 1.152.744.808','301 900 4451','1','20/07/2026',badge('Nuevo','blue'),'⋯']
 ],`<button class="btn btn-secondary">Importar Excel</button><button class="btn btn-primary">＋ Nuevo cliente</button>`);
}

function motos(){
 return listPage('Motocicletas','Consulta el historial de servicios por placa y controla kilometraje.',
 ['Placa','Motocicleta','Propietario','Kilometraje','Último servicio','Estado','Acciones'],
 [
  ['ABC12D','Yamaha FZ25 · 2022','Juan Pérez','18.450 km','21/07/2026',badge('En taller','blue'),'⋯'],
  ['JKL48F','Pulsar NS200 · 2021','Ana Ruiz','27.100 km','21/07/2026',badge('En taller','yellow'),'⋯'],
  ['MNO75G','Honda CB190R · 2023','Mateo León','8.900 km','20/07/2026',badge('Activo','green'),'⋯'],
  ['QRS83H','Suzuki Gixxer · 2024','Valentina Ríos','4.350 km','20/07/2026',badge('Activo','green'),'⋯']
 ],`<button class="btn btn-primary">＋ Nueva motocicleta</button>`);
}

function tecnicos(){
 return `
 ${pageHeader('Equipo del taller','Administra técnicos, recepcionistas y asignaciones.',
 `<button class="btn btn-primary">＋ Nuevo integrante</button>`)}
 <section class="grid-3">
 ${[
  ['Carlos Gómez','Técnico senior','CG','12','4.8','Motores y diagnóstico'],
  ['Pedro Sánchez','Técnico','PS','9','4.7','Frenos y suspensión'],
  ['Andrés Mejía','Técnico','AM','8','4.9','Alto cilindraje'],
  ['Laura Martínez','Recepcionista','LM','18','—','Recepción y servicio'],
  ['Juan Administrador','Administrador','JA','18','—','Administración']
 ].map(x=>`<article class="card card-pad"><div class="person"><div class="avatar">${x[2]}</div><div><strong>${x[0]}</strong><small class="muted">${x[1]}</small></div>${badge('Activo','green')}</div><div class="summary-list" style="margin-top:18px"><div class="summary-row"><span>Órdenes activas</span><strong>${x[3]}</strong></div><div class="summary-row"><span>Calificación</span><strong>${x[4]}</strong></div><div class="summary-row"><span>Especialidad</span><strong>${x[5]}</strong></div></div><button class="btn btn-secondary" style="width:100%;margin-top:15px">Ver perfil</button></article>`).join('')}
 </section>`;
}

function inventario(){
 return `
 ${pageHeader('Inventario de repuestos','Control de existencias, códigos de barras, referencias y compatibilidades.',
 `<button class="btn btn-secondary">Importar Excel</button><button class="btn btn-primary" data-action="new-part">＋ Nuevo repuesto</button>`)}
 <section class="kpi-grid">
 ${kpi('VALOR DEL INVENTARIO','$46.820.000','1.284 unidades','▣')}
 ${kpi('STOCK CRÍTICO','14','Requieren reposición','! ',true)}
 ${kpi('REPUESTOS SIN MOVIMIENTO','27','Más de 90 días','↘',true)}
 ${kpi('MARGEN PROMEDIO','38,6%','↑ 2,1% este mes','%')}
 </section>
 ${tableCard(['Código','Repuesto','Referencia','Código de barras','Stock','Costo / venta','Estado'],
 [
 ['REP-000481','Aceite Motul 5100 10W40','MOT-5100','3374650247431','42','$36.500 / $58.000',badge('Disponible','green')],
 ['REP-000482','Filtro de aceite HF303','HF303','7701234000482','8','$23.000 / $39.500',badge('Stock bajo','yellow')],
 ['REP-000483','Pastillas FZ25 delanteras','YZFZ25-PD','MM0000000483','3','$42.000 / $68.000',badge('Crítico','red')],
 ['REP-000484','Kit arrastre NS200','DID-NS200','MM0000000484','11','$168.000 / $245.000',badge('Disponible','green')],
 ['REP-000485','Bujía NGK CR8E','CR8E','087295112776','25','$19.000 / $32.000',badge('Disponible','green')]
 ])}`;
}

function compras(){
 return listPage('Compras','Registra compras a proveedores y actualiza automáticamente las existencias.',
 ['Compra','Proveedor','Factura','Fecha','Ítems','Total','Estado'],
 [
 ['CMP-0094','Motopartes Antioquia','FE-90182','21/07/2026','18','$3.420.000',badge('Recibida','green')],
 ['CMP-0093','Distribuciones MotoPro','FV-5531','18/07/2026','12','$1.870.000',badge('Recibida','green')],
 ['CMP-0092','Repuestos del Valle','RV-8821','15/07/2026','8','$945.000',badge('Pendiente','yellow')]
 ],`<button class="btn btn-primary">＋ Nueva compra</button>`);
}

function proveedores(){
 return listPage('Proveedores','Administra proveedores, contactos y condiciones comerciales.',
 ['Proveedor','NIT','Contacto','Teléfono','Compras mes','Saldo','Estado'],
 [
 ['Motopartes Antioquia','900.458.221-4','Diego Muñoz','604 444 5522','$8.240.000','$0',badge('Activo','green')],
 ['Distribuciones MotoPro','901.120.448-7','Carolina Mesa','310 828 1104','$4.780.000','$1.200.000',badge('Activo','green')],
 ['Repuestos del Valle','800.775.390-2','Luis Valencia','315 920 0018','$2.310.000','$0',badge('Activo','green')]
 ],`<button class="btn btn-primary">＋ Nuevo proveedor</button>`);
}

function facturas(){
 return `
 ${pageHeader('Facturas y pagos','Facturación comercial en PDF y registro de pagos, sin facturación electrónica.',
 `<button class="btn btn-primary">＋ Nueva factura</button>`)}
 <section class="kpi-grid">
 ${kpi('FACTURADO ESTE MES','$28.540.000','152 facturas','▥')}
 ${kpi('RECAUDADO','$26.980.000','94,5% del total','✓')}
 ${kpi('POR COBRAR','$1.560.000','6 facturas pendientes','⌛',true)}
 ${kpi('PAGO MÁS USADO','Transferencia','42% de los pagos','⇄')}
 </section>
 ${tableCard(['Factura','Cliente / moto','Fecha','Total','Pagado','Forma de pago','Estado'],
 [
 ['FAC-001258','Juan Pérez · FZ25','21/07/2026','$684.000','$684.000','Transferencia + efectivo',badge('Pagada','green')],
 ['FAC-001257','Ana Ruiz · NS200','21/07/2026','$398.500','$200.000','Nequi',badge('Abono parcial','yellow')],
 ['FAC-001256','Mateo León · CB190R','20/07/2026','$1.240.000','$1.240.000','Tarjeta',badge('Pagada','green')],
 ['FAC-001255','Valentina Ríos · Gixxer','20/07/2026','$278.000','$0','Pendiente',badge('Pendiente','red')]
 ])}`;
}

function reportes(){
 return `
 ${pageHeader('Reportes y analítica','Filtra, visualiza gráficas y exporta los resultados.',
 `<button class="btn btn-secondary" data-action="export-report">⇩ Excel</button><button class="btn btn-secondary">⇩ CSV</button><button class="btn btn-primary">Generar reporte</button>`)}
 <div class="toolbar card card-pad">
  <input class="input" type="date" value="2026-07-01"><input class="input" type="date" value="2026-07-21">
  <select class="select"><option>Todos los reportes</option><option>Ventas</option><option>Órdenes</option><option>Inventario</option></select>
  <select class="select"><option>Todos los técnicos</option><option>Carlos Gómez</option><option>Pedro Sánchez</option></select>
  <select class="select"><option>Todos los estados</option></select>
 </div>
 <section class="kpi-grid">
  ${kpi('VENTAS','$19.840.000','↑ 11,8% en el periodo','＄')}
  ${kpi('ÓRDENES TERMINADAS','104','87% de cumplimiento','✓')}
  ${kpi('REPUESTO MÁS VENDIDO','Aceite Motul','86 unidades','▣')}
  ${kpi('TÉCNICO DESTACADO','Carlos Gómez','42 órdenes terminadas','★')}
 </section>
 <section class="grid-equal">
  <article class="card card-pad"><div class="card-title"><div><h3>Ventas por día</h3><small>Periodo seleccionado</small></div></div><div class="chart-wrap"><canvas id="reportSales"></canvas></div></article>
  <article class="card card-pad"><div class="card-title"><div><h3>Tipos de pago</h3><small>Participación en recaudo</small></div></div><div class="chart-wrap"><canvas id="paymentChart"></canvas></div></article>
 </section>
 <article class="card card-pad" style="margin-top:18px"><div class="card-title"><h3>Detalle de resultados</h3><small>104 registros</small></div>${tableCardInner(['Fecha','Orden','Cliente','Moto','Técnico','Total','Estado'],[
 ['21/07/2026','OT-1058','Juan Pérez','FZ25','Carlos Gómez','$684.000',badge('Terminada','green')],
 ['21/07/2026','OT-1057','Ana Ruiz','NS200','Pedro Sánchez','$398.500',badge('En proceso','blue')],
 ['20/07/2026','OT-1056','Mateo León','CB190R','Andrés Mejía','$1.240.000',badge('Terminada','green')]
 ])}</article>`;
}

function contai(){
 return `
 ${pageHeader('Exportación para Contai','Genera archivos Excel o CSV para entregar al contador.',
 `<button class="btn btn-primary" data-action="generate-contai">Generar archivo Contai</button>`)}
 <div class="grid-2">
  <article class="card card-pad">
   <div class="card-title"><div><h3>Configurar exportación</h3><small>Selecciona el periodo y la información requerida</small></div>${badge('MVP','blue')}</div>
   <div class="form-grid">
    <div class="form-group"><label>Fecha inicial</label><input class="input" type="date" value="2026-07-01"></div>
    <div class="form-group"><label>Fecha final</label><input class="input" type="date" value="2026-07-31"></div>
    <div class="form-group"><label>Formato</label><select class="select"><option>Excel (.xlsx)</option><option>CSV (.csv)</option></select></div>
    <div class="form-group"><label>Tipo de información</label><select class="select"><option>Paquete completo</option><option>Ventas</option><option>Compras</option><option>Pagos</option><option>Inventario</option></select></div>
    <div class="form-group full"><label>Contenido incluido</label>
      <div class="summary-list">
       ${['Ventas y facturas comerciales','Compras y proveedores','Pagos y formas de pago','Movimientos de inventario'].map(x=>`<label class="summary-row"><span>${x}</span><input type="checkbox" checked></label>`).join('')}
      </div>
    </div>
   </div>
  </article>
  <article class="card card-pad">
   <div class="card-title"><div><h3>Vista previa</h3><small>Resumen del archivo a generar</small></div></div>
   <div class="summary-list">
    <div class="summary-row"><span>Periodo</span><strong>Julio 2026</strong></div>
    <div class="summary-row"><span>Facturas de venta</span><strong>152</strong></div>
    <div class="summary-row"><span>Compras</span><strong>23</strong></div>
    <div class="summary-row"><span>Pagos registrados</span><strong>161</strong></div>
    <div class="summary-row"><span>Movimientos inventario</span><strong>438</strong></div>
    <div class="summary-row"><span>Formato</span><strong>Excel</strong></div>
   </div>
   <div style="padding:14px;background:rgba(242,184,75,.09);border:1px solid rgba(242,184,75,.22);border-radius:12px;margin-top:18px;font-size:11px;color:#e8c372">
    La estructura podrá ajustarse posteriormente al formato definitivo solicitado por Contai.
   </div>
  </article>
 </div>`;
}

function portal(){
 const slots=['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00'];
 return `
 ${pageHeader('Portal del cliente','Vista pública simulada para agendamiento y consulta del estado.',
 `<button class="btn btn-secondary" data-action="copy-link">Copiar enlace</button><button class="btn btn-primary">Abrir en nueva pestaña</button>`)}
 <div class="portal-shell">
  <header class="portal-header"><div class="portal-logo"><img src="assets/motomanager-logo.png"><span>${badge('Portal cliente','blue')}</span></div><nav class="portal-nav"><span>Inicio</span><span>Agendar cita</span><span>Consultar estado</span><span>Mis documentos</span></nav></header>
  <section class="portal-hero"><span class="badge blue">TALLER DEMO MEDELLÍN</span><h2>Tu moto siempre en buenas manos.</h2><p>Agenda una cita, consulta el avance del servicio y descarga tus documentos desde un solo lugar.</p></section>
  <div class="section-tabs" style="margin:22px 22px 0"><button class="tab active" data-portal-tab="booking">Agendar cita</button><button class="tab" data-portal-tab="status">Consultar estado</button></div>
  <section id="portalBooking" class="portal-grid">
   <article class="portal-card">
    <div class="card-title"><div><h3>1. Selecciona el servicio</h3><small>Elige el motivo principal de tu visita</small></div></div>
    <div class="form-grid">
     <div class="form-group"><label>Servicio</label><select class="select" style="width:100%"><option>Mantenimiento general</option><option>Cambio de aceite</option><option>Diagnóstico</option><option>Frenos</option></select></div>
     <div class="form-group"><label>Motocicleta</label><select class="select" style="width:100%"><option>Yamaha FZ25 · ABC12D</option></select></div>
     <div class="form-group"><label>Fecha</label><input class="input" type="date" value="2026-07-23" style="width:100%"></div>
     <div class="form-group"><label>Técnico</label><select class="select" style="width:100%"><option>Cualquier técnico disponible</option><option>Carlos Gómez</option><option>Pedro Sánchez</option></select></div>
    </div>
    <h3 style="font-size:13px;margin-top:22px">2. Horarios disponibles</h3>
    <div class="slot-grid">${slots.map((s,i)=>`<button class="slot ${[2,5].includes(i)?'disabled':''}" ${[2,5].includes(i)?'disabled':''} data-slot="${s}">${s}</button>`).join('')}</div>
    <div class="form-group" style="margin-top:18px"><label>Observaciones</label><textarea class="textarea" placeholder="Cuéntanos brevemente qué necesita tu moto..."></textarea></div>
   </article>
   <aside class="portal-card">
    <div class="card-title"><div><h3>Resumen de la cita</h3><small>Confirma antes de agendar</small></div></div>
    <div class="summary-list">
     <div class="summary-row"><span>Servicio</span><strong>Mantenimiento general</strong></div>
     <div class="summary-row"><span>Moto</span><strong>Yamaha FZ25</strong></div>
     <div class="summary-row"><span>Fecha</span><strong>23 de julio</strong></div>
     <div class="summary-row"><span>Hora</span><strong id="portalSelectedTime">Selecciona una hora</strong></div>
     <div class="summary-row"><span>Duración estimada</span><strong>1 hora</strong></div>
    </div>
    <button class="btn btn-primary" style="width:100%;margin-top:20px" data-action="confirm-booking">Confirmar cita</button>
    <p class="muted" style="font-size:10px;text-align:center">Recibirás la confirmación en tu correo electrónico.</p>
   </aside>
  </section>
  <section id="portalStatus" class="portal-grid hidden">
   <article class="portal-card"><div class="card-title"><div><h3>Consulta tu motocicleta</h3><small>Ingresa la placa o el número de orden</small></div></div><div class="toolbar"><input class="input" value="ABC12D" style="flex:1"><button class="btn btn-primary" data-action="search-status">Consultar</button></div>
   <div class="timeline" style="margin-top:22px">
    <div class="timeline-item"><strong>Motocicleta recibida</strong><p>21/07/2026 · 08:02 · Recibió Laura Martínez</p></div>
    <div class="timeline-item"><strong>Diagnóstico completado</strong><p>21/07/2026 · 09:15 · Técnico Carlos Gómez</p></div>
    <div class="timeline-item"><strong>Cotización aprobada</strong><p>21/07/2026 · 10:02</p></div>
    <div class="timeline-item"><strong>En reparación</strong><p>Estado actual · Técnico Carlos Gómez</p></div>
   </div></article>
   <aside class="portal-card"><h3 style="margin-top:0">Yamaha FZ25 · ABC12D</h3><p class="muted">Orden OT-1058</p><div style="font-size:24px;font-weight:850;margin:24px 0;color:#61adff">En reparación</div><div class="summary-list"><div class="summary-row"><span>Recibió</span><strong>Laura Martínez</strong></div><div class="summary-row"><span>Técnico responsable</span><strong>Carlos Gómez</strong></div><div class="summary-row"><span>Entrega estimada</span><strong>Hoy, 5:00 p. m.</strong></div></div></aside>
  </section>
 </div>`;
}

function listPage(title,sub,headers,rows,actions=''){
 return `${pageHeader(title,sub,actions)}
 <div class="toolbar"><input class="input" placeholder="Buscar..."><select class="select"><option>Todos los estados</option></select><span class="filter-spacer muted">${rows.length} registros</span></div>
 ${tableCard(headers,rows)}`;
}
function tableCard(headers,rows){return `<article class="card card-pad">${tableCardInner(headers,rows)}</article>`}
function tableCardInner(headers,rows){return `<div class="table-wrap"><table class="data-table"><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`}

const routes={dashboard,agenda,recepcion,ordenes,cotizaciones,clientes,motos,tecnicos,inventario,compras,proveedores,facturas,reportes,contai,portal};

function render(route){
 state.route=route||'dashboard';
 content.innerHTML=(routes[state.route]||dashboard)();
 document.querySelectorAll('.nav-item').forEach(a=>a.classList.toggle('active',a.dataset.route===state.route));
 document.title=`MotoManager | ${document.querySelector('.page-header h1')?.textContent||'Prototipo Premium'}`;
 window.scrollTo({top:0});
 setTimeout(drawCharts,30);
}

function drawLineChart(canvas, data, labels){
 if(!canvas)return; const dpr=devicePixelRatio||1,rect=canvas.getBoundingClientRect(); canvas.width=rect.width*dpr;canvas.height=rect.height*dpr;
 const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);const w=rect.width,h=rect.height,p=35,max=Math.max(...data)*1.2;
 ctx.clearRect(0,0,w,h);ctx.strokeStyle='#23334c';ctx.lineWidth=1;
 for(let i=0;i<5;i++){let y=p+(h-p*2)*i/4;ctx.beginPath();ctx.moveTo(p,y);ctx.lineTo(w-p,y);ctx.stroke()}
 const pts=data.map((v,i)=>[p+(w-p*2)*i/(data.length-1),h-p-(v/max)*(h-p*2)]);
 const grad=ctx.createLinearGradient(0,0,0,h);grad.addColorStop(0,'rgba(38,132,255,.34)');grad.addColorStop(1,'rgba(38,132,255,0)');
 ctx.beginPath();ctx.moveTo(pts[0][0],h-p);pts.forEach(q=>ctx.lineTo(q[0],q[1]));ctx.lineTo(pts.at(-1)[0],h-p);ctx.closePath();ctx.fillStyle=grad;ctx.fill();
 ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.strokeStyle='#3b91ff';ctx.lineWidth=3;ctx.stroke();
 pts.forEach(q=>{ctx.beginPath();ctx.arc(q[0],q[1],4,0,Math.PI*2);ctx.fillStyle='#0d1727';ctx.fill();ctx.strokeStyle='#6bb2ff';ctx.lineWidth=2;ctx.stroke()});
 ctx.fillStyle='#71839b';ctx.font='10px Inter';ctx.textAlign='center';labels.forEach((l,i)=>ctx.fillText(l,pts[i][0],h-10));
}
function drawDonut(canvas, values, colors){
 if(!canvas)return;const dpr=devicePixelRatio||1,rect=canvas.getBoundingClientRect();canvas.width=rect.width*dpr;canvas.height=rect.height*dpr;const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);
 const cx=rect.width/2,cy=rect.height/2-8,r=Math.min(rect.width,rect.height)*.31,total=values.reduce((a,b)=>a+b,0);let start=-Math.PI/2;
 values.forEach((v,i)=>{const angle=v/total*Math.PI*2;ctx.beginPath();ctx.arc(cx,cy,r,start,start+angle);ctx.strokeStyle=colors[i];ctx.lineWidth=24;ctx.stroke();start+=angle});
 ctx.fillStyle='#fff';ctx.font='800 24px Inter';ctx.textAlign='center';ctx.fillText(total,cx,cy+4);ctx.fillStyle='#8192a9';ctx.font='10px Inter';ctx.fillText('ÓRDENES',cx,cy+22);
}
function drawBars(canvas, values, labels){
 if(!canvas)return;const dpr=devicePixelRatio||1,rect=canvas.getBoundingClientRect();canvas.width=rect.width*dpr;canvas.height=rect.height*dpr;const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);const p=35,w=rect.width,h=rect.height,max=Math.max(...values)*1.15,bw=(w-p*2)/values.length*.55;
 ctx.strokeStyle='#23334c';for(let i=0;i<5;i++){let y=p+(h-p*2)*i/4;ctx.beginPath();ctx.moveTo(p,y);ctx.lineTo(w-p,y);ctx.stroke()}
 values.forEach((v,i)=>{let x=p+(w-p*2)*(i+.5)/values.length-bw/2,y=h-p-v/max*(h-p*2);let g=ctx.createLinearGradient(0,y,0,h-p);g.addColorStop(0,'#4da3ff');g.addColorStop(1,'#1763ce');ctx.fillStyle=g;roundRect(ctx,x,y,bw,h-p-y,7);ctx.fill();ctx.fillStyle='#71839b';ctx.font='10px Inter';ctx.textAlign='center';ctx.fillText(labels[i],x+bw/2,h-10)})
}
function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,r):(ctx.rect(x,y,w,h))}
function drawCharts(){
 drawLineChart(document.querySelector('#salesChart'),[18,21,19,25,23,28,31],['ENE','FEB','MAR','ABR','MAY','JUN','JUL']);
 drawDonut(document.querySelector('#donutChart'),[4,5,3,4,2],['#2684ff','#9b7cff','#f2b84b','#32d4ff','#20c77a']);
 drawBars(document.querySelector('#reportSales'),[2.2,3.1,2.7,4.2,3.6,4.8,5.1],['15','16','17','18','19','20','21']);
 drawDonut(document.querySelector('#paymentChart'),[42,24,18,10,6],['#2684ff','#20c77a','#9b7cff','#f2b84b','#ff5d68']);
}

function showModal(html){modalContent.innerHTML=html;modalBackdrop.classList.remove('hidden')}
function closeModal(){modalBackdrop.classList.add('hidden')}
function toast(title,msg='Acción simulada correctamente.'){
 const t=document.createElement('div');t.className='toast';t.innerHTML=`<strong>${title}</strong><span>${msg}</span>`;document.querySelector('#toastStack').appendChild(t);setTimeout(()=>t.remove(),3500)
}

document.addEventListener('click',e=>{
 const routeEl=e.target.closest('[data-route]');if(routeEl){e.preventDefault();location.hash=routeEl.dataset.route;return}
 const action=e.target.closest('[data-action]')?.dataset.action;
 if(action==='new-reception'){showModal(`<h2>Nueva recepción</h2><p class="muted">Inicia el registro de ingreso de una motocicleta.</p><div class="form-grid"><div class="form-group"><label>Placa</label><input class="input" placeholder="ABC12D"></div><div class="form-group"><label>Cliente</label><input class="input" placeholder="Buscar cliente..."></div><div class="form-group"><label>Recibido por</label><select class="select"><option>Laura Martínez</option><option>Juan Administrador</option></select></div><div class="form-group"><label>Fecha</label><input class="input" type="datetime-local"></div></div><div class="modal-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="closeModal();location.hash='recepcion'">Continuar</button></div>`)}
 if(action==='new-appointment'||action==='calendar-slot'){showModal(`<h2>Nueva cita de taller</h2><p class="muted">Asigna fecha, hora, servicio y técnico disponible.</p><div class="form-grid"><div class="form-group"><label>Cliente</label><input class="input" value="Valentina Ríos"></div><div class="form-group"><label>Moto</label><input class="input" value="Suzuki Gixxer · QRS83H"></div><div class="form-group"><label>Fecha</label><input class="input" type="date" value="2026-07-23"></div><div class="form-group"><label>Hora disponible</label><select class="select"><option>09:00</option><option>11:00</option><option>16:00</option></select></div><div class="form-group"><label>Servicio</label><select class="select"><option>Revisión general</option><option>Cambio de aceite</option></select></div><div class="form-group"><label>Técnico</label><select class="select"><option>Carlos Gómez</option><option>Pedro Sánchez</option></select></div></div><div class="modal-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="closeModal();toast('Cita creada','La cita quedó visible en la agenda del administrador.')">Guardar cita</button></div>`)}
 if(action==='open-order'){showModal(`<h2>Orden OT-1058</h2><div class="grid-equal"><div><p>${badge('En reparación','blue')}</p><div class="summary-list"><div class="summary-row"><span>Cliente</span><strong>Juan Pérez</strong></div><div class="summary-row"><span>Moto</span><strong>Yamaha FZ25</strong></div><div class="summary-row"><span>Placa</span><strong>ABC12D</strong></div><div class="summary-row"><span>Recibió</span><strong>Laura Martínez</strong></div><div class="summary-row"><span>Técnico</span><strong>Carlos Gómez</strong></div></div></div><div><h3>Progreso</h3><div class="progress"><span style="width:72%"></span></div><p class="muted">Diagnóstico y cotización aprobados. Reparación en curso.</p></div></div><div class="modal-actions"><button class="btn btn-secondary" onclick="closeModal()">Cerrar</button><button class="btn btn-primary" onclick="toast('Estado actualizado')">Cambiar estado</button></div>`)}
 if(action==='new-part'){showModal(`<h2>Nuevo repuesto</h2><p class="muted">Si no ingresas código de barras, MotoManager generará uno automáticamente.</p><div class="form-grid"><div class="form-group full"><label>Nombre</label><input class="input" value="Retén suspensión 41 mm"></div><div class="form-group"><label>Referencia</label><input class="input" value="RET-41MM"></div><div class="form-group"><label>Código de barras</label><input class="input" placeholder="Vacío = automático"></div><div class="form-group"><label>Costo</label><input class="input" value="$18.000"></div><div class="form-group"><label>Precio</label><input class="input" value="$32.000"></div></div><div class="modal-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="closeModal();toast('Repuesto creado','Código generado: MM0000000486')">Guardar repuesto</button></div>`)}
 if(action==='save-reception')toast('Recepción creada','Se generó la orden OT-1063 y quedó registrada Laura Martínez como receptora.');
 if(action==='export-report')toast('Archivo generado','El reporte se descargó en formato Excel.');
 if(action==='generate-contai')toast('Exportación Contai generada','Paquete Julio_2026.xlsx listo para el contador.');
 if(action==='copy-link')toast('Enlace copiado','El vínculo público del portal quedó en el portapapeles.');
 if(action==='confirm-booking'){if(!state.selectedSlot){toast('Selecciona una hora','Solo puedes confirmar un horario disponible.');return}toast('Cita confirmada',`Agendaste el 23 de julio a las ${state.selectedSlot}. Se enviará correo de confirmación.`)}
 if(e.target.matches('.slot:not(.disabled)')){document.querySelectorAll('.slot').forEach(s=>s.classList.remove('selected'));e.target.classList.add('selected');state.selectedSlot=e.target.dataset.slot;document.querySelector('#portalSelectedTime').textContent=state.selectedSlot}
 if(e.target.dataset.portalTab){document.querySelectorAll('[data-portal-tab]').forEach(t=>t.classList.toggle('active',t===e.target));document.querySelector('#portalBooking').classList.toggle('hidden',e.target.dataset.portalTab!=='booking');document.querySelector('#portalStatus').classList.toggle('hidden',e.target.dataset.portalTab!=='status')}
});
document.querySelector('#modalClose').addEventListener('click',closeModal);modalBackdrop.addEventListener('click',e=>{if(e.target===modalBackdrop)closeModal()});
document.querySelector('#menuToggle').addEventListener('click',()=>document.querySelector('#sidebar').classList.toggle('open'));
window.addEventListener('hashchange',()=>render(location.hash.slice(1)||'dashboard'));
window.addEventListener('resize',drawCharts);
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();document.querySelector('#globalSearch').focus()}if(e.key==='Escape')closeModal()});
window.closeModal=closeModal;window.toast=toast;
render(location.hash.slice(1)||'dashboard');
