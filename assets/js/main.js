
// BUSINESS_NAME is the ONE swappable constant; all visible copy uses it via data attributes where set.
const BUSINESS_NAME = "Soares Encanador & Desentupidora";
document.querySelectorAll('[data-business]').forEach(el=>{el.textContent=BUSINESS_NAME;});
// Mobile nav
const burger=document.querySelector('.burger'), nav=document.querySelector('nav.main');
if(burger&&nav){burger.addEventListener('click',()=>{const open=nav.classList.toggle('open');burger.setAttribute('aria-expanded',open);});}
// FAQ accordions
document.querySelectorAll('.faq-q').forEach(btn=>{btn.addEventListener('click',()=>{const item=btn.closest('.faq-item');const open=item.classList.toggle('open');btn.setAttribute('aria-expanded',open);});});
// Hero chips -> orcamento with pre-selected problem
document.querySelectorAll('[data-problem]').forEach(ch=>{ch.addEventListener('click',()=>{sessionStorage.setItem('soaresProblem',ch.dataset.problem);});});
// Areas filter
const areaForm=document.getElementById('areaFilter');
if(areaForm){areaForm.addEventListener('submit',e=>{e.preventDefault();
 const q=(document.getElementById('areaInput').value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
 const res=document.getElementById('areaResult'); if(!q){res.innerHTML='<span class="warn">Digite um bairro ou cidade para verificar.</span>';return;}
 const neighbours=['aparecida de goiania','aparecida','senador canedo','trindade','goianira','anapolis'];
 if(neighbours.some(n=>q.includes(n))){res.innerHTML='<span class="warn">ESTA CIDADE ESTÁ [SOB CONSULTA] — atendimento fora de Goiânia depende da escala no momento do chamado. Confirme no WhatsApp antes de aguardar.</span>';}
 else if(q.includes('goiania')){res.innerHTML='<span class="ok">GOIÂNIA E REGIÃO — ATENDIMENTO DISPONÍVEL. Chame no WhatsApp e confirme a disponibilidade no momento do chamado.</span>';}
 else{res.innerHTML='<span class="warn">LOCALIDADE [A CONFIRMAR] — não confirmamos cobertura para este local. Envie sua localização no WhatsApp e a central confirma para você.</span>';}
});}
// Contact mini-form -> WhatsApp
const cform=document.getElementById('contactForm');
if(cform){cform.addEventListener('submit',e=>{e.preventDefault();
 const nome=document.getElementById('cNome').value.trim(), prob=document.getElementById('cProb').value.trim(), bairro=document.getElementById('cBairro').value.trim();
 if(!nome||!prob||!bairro){document.getElementById('cErr').style.display='block';return;}
 const msg='Olá, Soares! Meu nome é '+nome+'. Meu problema: '+prob+'. Bairro: '+bairro+', Goiânia — GO. Pode me passar o orçamento?';
 window.open('https://wa.me/5562992606593?text='+encodeURIComponent(msg),'_blank');});}
// ---- Quote bot (/orcamento) : 5 steps ----
const bot=document.getElementById('botPanel');
if(bot){
 const PROBLEMS=['Pia entupida','Vaso sanitário','Ralo de banheiro/área','Esgoto voltando','Vazamento visível','Caixa de gordura cheia','Outro problema hidráulico / encanamento geral'];
 const ROOMS=['Cozinha','Banheiro','Área externa / Quintal','Estabelecimento comercial','Outro cômodo'];
 const state={problem:'',room:'',urgency:'',address:'',photo:false};
 let step=1;
 const body=document.getElementById('botBody'), prog=document.getElementById('botProgress'), stepLabel=document.getElementById('botStepLabel');
 const saved=sessionStorage.getItem('soaresProblem'); if(saved){state.problem=saved;}
 function typing(next){body.innerHTML='<p class="typing">digitando…</p>';setTimeout(next,450);}
 function bubble(text,cls){const d=document.createElement('div');d.className='bubble '+cls;d.innerHTML=text;body.appendChild(d);}
 function userSay(text){bubble(text,'user-b');}
 function setStep(n){step=n;prog.style.width=(n*20)+'%';stepLabel.textContent='PASSO '+n+' DE 5 — TRIAGEM OPERACIONAL';}
 function opts(list,cb){list.forEach(v=>{const b=document.createElement('button');b.type='button';b.className='opt';b.textContent=v;b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>{b.setAttribute('aria-pressed','true');cb(v);});body.appendChild(b);});}
 function render(){
  body.innerHTML='';
  if(step===1){setStep(1);bubble('<span class="tag">[Assistente de plantão]</span>Olá! Sou o assistente de plantão do Soares. Para agilizar seu socorro e o orçamento, selecione o tipo de ocorrência:','bot-b');opts(PROBLEMS,v=>{state.problem=v;userSay(v);step=2;typing(render);});}
  else if(step===2){setStep(2);bubble('<span class="tag">[Passo 2 — Onde?]</span>Onde está o problema?','bot-b');opts(ROOMS,v=>{state.room=v;userSay(v);step=2.5;typing(render);});}
  else if(step===2.5){setStep(2);bubble('<span class="tag">[Foto — opcional]</span>Quer enviar uma foto do problema? A foto ajuda a orçar sem visita — ela vai junto na mensagem.','bot-b');
   const f=document.createElement('div');f.className='bot-field';f.innerHTML='<label for="photoInput">Foto do problema (opcional)</label><input type="file" id="photoInput" accept="image/*"><p class="note">A foto é anexada por você na conversa do WhatsApp, junto com a mensagem pré-preenchida.</p>';body.appendChild(f);
   const go=document.createElement('button');go.type='button';go.className='btn btn-sm';go.style.marginTop='12px';go.textContent='Continuar sem foto / com foto';go.addEventListener('click',()=>{const inp=document.getElementById('photoInput');state.photo=!!(inp&&inp.files&&inp.files.length);userSay(state.photo?'Foto anexada (vou enviar junto na mensagem).':'Sem foto — vou descrever no WhatsApp.');step=3;typing(render);});body.appendChild(go);}
  else if(step===3){setStep(3);bubble('<span class="tag">[Passo 3 — Urgência]</span>Qual é a urgência?','bot-b');opts(['Está voltando água agora — emergência','Dá para esperar até amanhã'],v=>{state.urgency=v;userSay(v);step=4;typing(render);});}
  else if(step===4){setStep(4);bubble('<span class="tag">[Passo 4 — Endereço]</span>Qual é o bairro / endereço do atendimento? Cidade: Goiânia — GO.','bot-b');
   const f=document.createElement('div');f.className='bot-field';f.innerHTML='<label for="addrInput">Bairro / endereço</label><input type="text" id="addrInput" placeholder="Ex.: Residencial Recanto do Bosque, Rua..." autocomplete="street-address"><p class="err" id="addrErr">Informe o bairro/endereço para continuar.</p>';body.appendChild(f);
   const go=document.createElement('button');go.type='button';go.className='btn btn-sm';go.style.marginTop='12px';go.textContent='Ver resumo';go.addEventListener('click',()=>{const v=document.getElementById('addrInput').value.trim();if(!v){document.getElementById('addrErr').style.display='block';document.getElementById('addrInput').focus();return;}state.address=v;userSay(v);step=5;typing(render);});body.appendChild(go);}
  else if(step===5){setStep(5);bubble('<span class="tag">[Passo 5 — Resumo]</span>Confira sua ordem de serviço antes de enviar:','bot-b');
   const photoTxt=state.photo?'Foto anexada, se houver.':'Sem foto.';
   const s=document.createElement('div');s.className='summary';s.innerHTML='<p class="tag">[Ordem de serviço — resumo]</p><dl><dt>Problema</dt><dd>'+state.problem+'</dd><dt>Local</dt><dd>'+state.room+'</dd><dt>Urgência</dt><dd>'+state.urgency+'</dd><dt>Endereço</dt><dd>'+state.address+', Goiânia — GO</dd><dt>Foto</dt><dd>'+photoTxt+'</dd></dl>';body.appendChild(s);
   const a=document.createElement('a');a.className='btn btn-wa';a.style.marginTop='12px';a.textContent='Enviar no WhatsApp';
   const msg='Olá, Soares! Meu problema: '+state.problem+', no '+state.room+'. Urgência: '+state.urgency+'. Endereço: '+state.address+', Goiânia — GO. '+(state.photo?'Foto anexada, se houver. ':'')+'Pode me passar o orçamento?';
   a.href='https://wa.me/5562992606593?text='+encodeURIComponent(msg);a.target='_blank';a.rel='noopener';body.appendChild(a);
   const back=document.createElement('button');back.type='button';back.className='btn btn-ghost btn-sm';back.style.marginTop='12px';back.textContent='← Refazer do início';back.addEventListener('click',()=>{Object.keys(state).forEach(k=>state[k]=k==='photo'?false:'');step=1;render();});body.appendChild(back);}
 }
 render();
}
