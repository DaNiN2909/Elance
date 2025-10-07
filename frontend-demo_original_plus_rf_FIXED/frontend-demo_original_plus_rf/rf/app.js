// ===== Helpers =====
function get(k, d){ try{ return JSON.parse(localStorage.getItem(k) || JSON.stringify(d)); }catch(e){ return d; } }
function set(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
function toast(msg){ alert(msg); }
function escapeHTML(s){ return String(s||'').replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;' }[m])); }
function initials(n){ n=String(n||''); const p=n.trim().split(/\s+/); return (p[0]?.[0]||'')+(p[1]?.[0]||''); }

function getUsers(){ return get('mg_users', []); }
function setUsers(v){ set('mg_users', v); }
function currentUser(){ const id = Number(localStorage.getItem('mg_currentUser')); if(!id) return null; return getUsers().find(u=>u.id===id)||null; }
function ensureAuth(){ if(!currentUser()){ location='login.html'; } }

// ===== RF001: Cadastro =====
function register(){
  const name = (document.getElementById('rg_name')?.value || '').trim();
  const email = (document.getElementById('rg_email')?.value || '').trim().toLowerCase();
  const phone = (document.getElementById('rg_phone')?.value || '').trim();
  const type  = (document.getElementById('rg_type')?.value || 'Músico');
  const cep   = (document.getElementById('rg_cep')?.value || '').trim();
  const num   = (document.getElementById('rg_num')?.value || '').trim();
  const city  = (document.getElementById('rg_city')?.value || '').trim();
  const street= (document.getElementById('rg_street')?.value || '').trim();
  const district=(document.getElementById('rg_district')?.value || '').trim();
  const pass  = (document.getElementById('rg_pass')?.value || '');
  if(!name || !email || !pass) return toast('Preencha nome, e-mail e senha.');
  const users = getUsers();
  if(users.some(u => u.email === email)) return toast('E-mail já cadastrado.');
  const id = Date.now();
  const user = { id, name, email, pass, phone, type, address:{cep,num,city,street,district}, bio:'', instruments:[], genres:[], avatar:'', following:[], portfolio:[] };
  users.push(user); setUsers(users); localStorage.setItem('mg_currentUser', String(id)); location='feed.html';
}

// ===== RF002: Login =====
function login(){
  const e = (document.getElementById('lg_email')?.value || '').trim().toLowerCase();
  const p = (document.getElementById('lg_pass')?.value || '');
  if(!e || !p) return toast('Informe e-mail e senha');
  const u = getUsers().find(u => u.email === e && u.pass === p);
  if(!u) return toast('Credenciais inválidas');
  localStorage.setItem('mg_currentUser', String(u.id)); location='feed.html';
}

// ===== RF003: Perfil =====
function saveProfile(){
  const me=currentUser(); if(!me) return ensureAuth();
  const users=getUsers(); const u=users.find(x=>x.id===me.id);
  u.bio = document.getElementById('pf_bio')?.value||'';
  u.instruments = (document.getElementById('pf_instruments')?.value||'').split(',').map(x=>x.trim()).filter(Boolean);
  u.genres = (document.getElementById('pf_genres')?.value||'').split(',').map(x=>x.trim()).filter(Boolean);
  u.avatar = document.getElementById('pf_avatar')?.value||'';
  setUsers(users); toast('Perfil salvo');
}
function loadProfile(){
  const me=currentUser(); if(!me) return ensureAuth();
  document.getElementById('pf_bio').value = me.bio||'';
  document.getElementById('pf_instruments').value = (me.instruments||[]).join(', ');
  document.getElementById('pf_genres').value = (me.genres||[]).join(', ');
  document.getElementById('pf_avatar').value = me.avatar||'';
}

// ===== RF004: Portfólio =====
function renderPortfolio(){
  const me=currentUser(); if(!me) return;
  const box=document.getElementById('portfolioList'); if(!box) return;
  const u = getUsers().find(x=>x.id===me.id);
  const items=(u.portfolio||[]).map(p=>`<div class="card"><strong>${escapeHTML(p.title)}</strong><div class="small muted">${escapeHTML(p.url)}</div><p>${escapeHTML(p.desc||'')}</p></div>`);
  box.innerHTML = items.join('') || '<p class="small muted">Sem itens.</p>';
}
function addPortfolio(){
  const me=currentUser(); if(!me) return ensureAuth();
  const users=getUsers(); const u=users.find(x=>x.id===me.id);
  const title=(document.getElementById('pf_port_title')?.value||'').trim();
  const url=(document.getElementById('pf_port_url')?.value||'').trim();
  const desc=(document.getElementById('pf_port_desc')?.value||'').trim();
  if(!title || !url) return toast('Informe título e URL');
  u.portfolio = u.portfolio||[]; u.portfolio.unshift({ id:Date.now(), title, url, desc });
  setUsers(users); renderPortfolio();
}

// ===== RF005/006/007: Feed/curtidas/comentários =====
function getPosts(){ return get('mg_posts', []); }
function setPosts(v){ set('mg_posts', v); }
function createPost(){
  const me=currentUser(); if(!me) return ensureAuth();
  const txt=(document.getElementById('postText')?.value||'').trim();
  if(!txt) return;
  const ps=getPosts();
  ps.unshift({ id:Date.now(), userId:me.id, text:txt, likes:[], comments:[], at:new Date().toISOString() });
  setPosts(ps);
  document.getElementById('postText').value='';
  renderFeed();
}
function toggleLike(postId){
  const me=currentUser(); if(!me) return ensureAuth();
  const ps=getPosts(); const p=ps.find(x=>x.id===postId); if(!p) return;
  p.likes = p.likes||[];
  if(p.likes.includes(me.id)) p.likes = p.likes.filter(x=>x!==me.id);
  else p.likes.push(me.id);
  setPosts(ps); renderFeed();
}
function addComment(postId){
  const me=currentUser(); if(!me) return ensureAuth();
  const t=prompt('Comentário:'); if(!t) return;
  const ps=getPosts(); const p=ps.find(x=>x.id===postId); if(!p) return;
  p.comments = p.comments||[]; p.comments.push({ id:Date.now(), userId:me.id, text:t, at:new Date().toISOString() });
  setPosts(ps); renderFeed();
}
function renderFeed(){
  const me=currentUser(); if(!me) return;
  const box=document.getElementById('feedBox'); if(!box) return;
  const users=getUsers();
  box.innerHTML = getPosts().map(p=>{
    const u=users.find(x=>x.id===p.userId);
    return `<div class="card">
      <div class="row">
        <div class="avatar">${initials(u?.name||'')}</div>
        <div class="grow">
          <div><strong>${escapeHTML(u?.name||'')}</strong></div>
          <div class="small muted">${new Date(p.at).toLocaleString()}</div>
        </div>
        <div><button class="btn ghost" onclick="reportPost(${p.id})">Denunciar</button></div>
      </div>
      <p>${escapeHTML(p.text)}</p>
      <div class="row">
        <button class="btn" onclick="toggleLike(${p.id})">Curtir (${p.likes?.length||0})</button>
        <button class="btn ghost" onclick="addComment(${p.id})">Comentar (${p.comments?.length||0})</button>
      </div>
      ${(p.comments||[]).map(c=>{
        const cu=users.find(x=>x.id===c.userId);
        return `<blockquote><strong>${escapeHTML(cu?.name||'')}:</strong> ${escapeHTML(c.text)}</blockquote>`
      }).join('')}
    </div>`;
  }).join('') || '<p class="small muted">Sem publicações ainda.</p>';
}

// ===== RF008/RF009: conexões =====
function getRequests(){ return get('mg_requests', []); }
function setRequests(v){ set('mg_requests', v); }
function sendFriendRequest(toUserId){
  const me=currentUser(); if(!me) return toast('Faça login');
  if(toUserId === me.id) return;
  let reqs=getRequests();
  if(reqs.some(r=>r.fromId===me.id && r.toId===toUserId && r.status==='pending')) return toast('Solicitação já enviada.');
  reqs.unshift({ id:Date.now(), fromId:me.id, toId:toUserId, status:'pending', at:new Date().toISOString() });
  setRequests(reqs); toast('Solicitação enviada!'); renderRequestsUI?.();
}
function getIncomingRequests(){ const me=currentUser(); if(!me) return []; return getRequests().filter(r=>r.toId===me.id && r.status==='pending'); }
function acceptFriend(reqId){
  const me=currentUser(); let reqs=getRequests();
  const r=reqs.find(x=>x.id===reqId && x.toId===me.id && x.status==='pending'); if(!r) return;
  r.status='accepted'; setRequests(reqs);
  const users=getUsers(); const a=users.find(u=>u.id===me.id); const b=users.find(u=>u.id===r.fromId);
  a.following=Array.from(new Set([...(a.following||[]), b.id])); b.following=Array.from(new Set([...(b.following||[]), a.id])); setUsers(users);
  renderConnections?.(); renderRequestsUI?.();
}
function rejectFriend(reqId){
  let reqs=getRequests(); const r=reqs.find(x=>x.id===reqId && x.status==='pending'); if(!r) return;
  r.status='rejected'; setRequests(reqs); renderRequestsUI?.();
}
function renderConnections(){
  const me=currentUser(); if(!me) return; const box=document.getElementById('myConnections'); if(!box) return;
  const users=getUsers(); const u=users.find(x=>x.id===me.id); const ids=u.following||[];
  const list=ids.map(id=>users.find(x=>x.id===id)).filter(Boolean);
  box.innerHTML = list.map(x=>`<div class="row"><div class="avatar">${initials(x.name)}</div><div class="grow">${escapeHTML(x.name)}</div><div><button class="btn ghost" onclick="reportUser(${x.id})">Denunciar</button></div></div>`).join('') || '<p class="small muted">Sem conexões.</p>';
}
function renderRequestsUI(){
  const box=document.getElementById('incomingRequests'); if(!box) return;
  const reqs=getIncomingRequests(); const users=getUsers();
  box.innerHTML = (reqs.length? reqs.map(r=>{
    const from=users.find(u=>u.id===r.fromId);
    return `<div class="row">
      <div class="grow"><strong>${escapeHTML(from?.name||'')}</strong> quer se conectar</div>
      <div><button class="btn" onclick="acceptFriend(${r.id})">Aceitar</button> <button class="btn ghost" onclick="rejectFriend(${r.id})">Recusar</button></div>
    </div>`;
  }).join('') : '<p class="muted small">Sem solicitações.</p>');
}

// ===== RF010: mensagens + solicitação p/ não-amigos =====
function getThreads(){ return get('mg_threads', []); }
function setThreads(v){ set('mg_threads', v); }
function getMsgRequests(){ return get('mg_msg_requests', []); }
function setMsgRequests(v){ set('mg_msg_requests', v); }
function areFriends(aId,bId){ const users=getUsers(); const a=users.find(u=>u.id===aId), b=users.find(u=>u.id===bId); return !!(a && b && a.following?.includes(b.id) && b.following?.includes(a.id)); }
function ensureThread(aId,bId){
  let th=getThreads(); let t=th.find(x=>(x.aId===aId && x.bId===bId) || (x.aId===bId && x.bId===aId));
  if(!t){ t={ id:Date.now()+Math.random(), aId, bId, msgs:[] }; th.unshift(t); setThreads(th); }
  return t;
}
function sendMsg(withId){
  const me=currentUser(); if(!me) return toast('Faça login');
  const v=(document.getElementById('msgInput')?.value||'').trim(); if(!v) return;
  if(!areFriends(me.id, withId)){
    const reqs=getMsgRequests(); reqs.unshift({ id:Date.now(), fromId:me.id, toId:withId, text:v, status:'pending', at:new Date().toISOString() });
    setMsgRequests(reqs); toast('Sua mensagem foi enviada como solicitação.'); document.getElementById('msgInput').value=''; renderMsgRequests?.(); return;
  }
  const t=ensureThread(me.id, withId); t.msgs.push({ from:me.id, text:v, at:new Date().toISOString() }); setThreads(getThreads()); document.getElementById('msgInput').value=''; renderThreads?.();
}
function acceptMsgRequest(reqId){
  const me=currentUser(); let reqs=getMsgRequests(); const r=reqs.find(x=>x.id===reqId && x.toId===me.id && x.status==='pending'); if(!r) return;
  r.status='accepted'; setMsgRequests(reqs);
  const t=ensureThread(r.fromId, r.toId); t.msgs.push({ from:r.fromId, text:r.text, at:r.at }); setThreads(getThreads());
  renderMsgRequests?.(); renderThreads?.();
}
function rejectMsgRequest(reqId){ let reqs=getMsgRequests(); const r=reqs.find(x=>x.id===reqId); if(!r) return; r.status='rejected'; setMsgRequests(reqs); renderMsgRequests?.(); }
function renderThreads(){
  const me=currentUser(); if(!me) return; const box=document.getElementById('threads'); if(!box) return; const users=getUsers();
  const html=getThreads().filter(t=>t.aId===me.id||t.bId===me.id).map(t=>{
    const otherId=t.aId===me.id? t.bId: t.aId; const other=users.find(u=>u.id===otherId); const last=t.msgs[t.msgs.length-1];
    return `<div class="card"><div class="row"><div class="avatar">${initials(other?.name||'')}</div><div class="grow"><strong>${escapeHTML(other?.name||'')}</strong><div class="small muted">${escapeHTML(last? last.text : 'Sem mensagens')}</div></div></div></div>`;
  }).join('');
  box.innerHTML = html || '<p class="small muted">Sem conversas.</p>';
}
function renderMsgRequests(){
  const me=currentUser(); if(!me) return; const box=document.getElementById('msgRequests'); if(!box) return; const users=getUsers();
  const reqs=getMsgRequests().filter(r=>r.toId===me.id && r.status==='pending');
  box.innerHTML = (reqs.length? reqs.map(r=>{ const from=users.find(u=>u.id===r.fromId);
    return `<div class="row"><div class="grow"><strong>${escapeHTML(from?.name||'')}</strong>: ${escapeHTML(r.text)}</div><div><button class="btn" onclick="acceptMsgRequest(${r.id})">Aceitar</button> <button class="btn ghost" onclick="rejectMsgRequest(${r.id})">Recusar</button></div></div>`;
  }).join('') : '<p class="small muted">Sem solicitações.</p>');
}

// ===== RF011: sugestões =====
function renderSuggestRight(){
  const box=document.getElementById('suggestRight'); if(!box) return; const me=currentUser(); if(!me){ box.innerHTML=''; return; }
  const users=getUsers().filter(u=>u.id!==me.id);
  function score(u){ let s=0; if(me.type && u.type && me.type!==u.type) s+=1; const interI=(me.instruments||[]).filter(x=>u.instruments?.includes(x)).length; const interG=(me.genres||[]).filter(x=>u.genres?.includes(x)).length; s+=interI*2+interG; return s; }
  const ordered=users.sort((a,b)=>score(b)-score(a)).slice(0,5);
  box.innerHTML = ordered.map(u=>`<div class="row"><div class="avatar">${initials(u.name)}</div><div class="grow"><div><strong>${escapeHTML(u.name)}</strong></div><div class="small muted">${escapeHTML((u.instruments||[]).join(', ')||'')}</div></div><div><button class="btn" onclick="sendFriendRequest(${u.id})">Conectar</button></div></div>`).join('') || '<p class="small muted">Sem sugestões.</p>';
}

// ===== RF012/RF013: denúncias =====
function getReports(){ return get('mg_reports', []); }
function setReports(v){ set('mg_reports', v); }
function reportPost(postId, reason='Conteúdo inapropriado'){ const me=currentUser(); if(!me) return ensureAuth(); const reps=getReports(); reps.unshift({ id:Date.now(), type:'post', postId, by:me.id, reason, status:'pending', at:new Date().toISOString() }); setReports(reps); toast('Denúncia enviada.'); renderReports?.(); }
function reportUser(userId, reason='Perfil inadequado'){ const me=currentUser(); if(!me) return ensureAuth(); const reps=getReports(); reps.unshift({ id:Date.now(), type:'user', userId, by:me.id, reason, status:'pending', at:new Date().toISOString() }); setReports(reps); toast('Denúncia enviada.'); renderReports?.(); }
function renderReports(){
  const box=document.getElementById('reportsBox'); if(!box) return; const reps=getReports();
  box.innerHTML = (reps.length? reps.map(r=>`<div class="row"><div class="grow"><strong>${r.type==='post'?'Post':'Usuário'}</strong> — ${escapeHTML(r.reason)} <span class="small muted">(${new Date(r.at).toLocaleString()})</span> — <span class="badge">${r.status}</span></div><div><button class="btn" onclick="r.status='resolved'; setReports([...getReports()]); renderReports();">Resolver</button> <button class="btn ghost" onclick="r.status='dismissed'; setReports([...getReports()]); renderReports();">Arquivar</button></div></div>`).join('') : '<p class="muted small">Sem denúncias.</p>');
}

// ---- Seed de usuários fakes (executa uma única vez) ----
(function seedUsers(){
  try{
    var existing = JSON.parse(localStorage.getItem('mg_users') || '[]');
    if (Array.isArray(existing) && existing.length === 0){
      var base = Date.now();
      var users = [
        {id: base+1, name:"Ana Souza", email:"ana@example.com", pass:"123456", phone:"11999990001", type:"Músico",
          address:{cep:"01001-000",num:"100",city:"São Paulo",street:"Rua A",district:"Centro"},
          bio:"Vocalista e compositora", instruments:["Voz","Violão"], genres:["Pop","MPB"], avatar:"", following:[], portfolio:[]},
        {id: base+2, name:"Bruno Lima", email:"bruno@example.com", pass:"123456", phone:"21999990002", type:"Contratante",
          address:{cep:"20010-000",num:"200",city:"Rio de Janeiro",street:"Rua B",district:"Centro"},
          bio:"Produtor de eventos", instruments:[], genres:["Sertanejo","Pop"], avatar:"", following:[], portfolio:[]},
        {id: base+3, name:"Carla Mendes", email:"carla@example.com", pass:"123456", phone:"31999990003", type:"Músico",
          address:{cep:"30110-000",num:"300",city:"Belo Horizonte",street:"Rua C",district:"Savassi"},
          bio:"Guitarrista", instruments:["Guitarra"], genres:["Rock","Blues"], avatar:"", following:[], portfolio:[]},
        {id: base+4, name:"Diego Nogueira", email:"diego@example.com", pass:"123456", phone:"41999990004", type:"Músico",
          address:{cep:"80010-000",num:"400",city:"Curitiba",street:"Rua D",district:"Centro"},
          bio:"Baterista", instruments:["Bateria"], genres:["Rock"], avatar:"", following:[], portfolio:[]}
      ];
      localStorage.setItem('mg_users', JSON.stringify(users));
      console.log("[RF] Seed de usuários aplicado");
    }
  }catch(e){ console.warn("Seed falhou", e); }
})();