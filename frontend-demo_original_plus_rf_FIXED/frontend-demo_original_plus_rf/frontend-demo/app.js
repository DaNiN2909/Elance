
/* Core helpers and storage (same as v4) */
function toast(m){const el=document.getElementById('toast'); if(!el) return alert(m); el.textContent=m; el.classList.remove('hidden'); setTimeout(()=>el.classList.add('hidden'),1800)}
function get(k,def){try{return JSON.parse(localStorage.getItem(k)??JSON.stringify(def))}catch(e){return def}}
function set(k,v){localStorage.setItem(k,JSON.stringify(v))}
function getUsers(){return get('mg_users',[])}
function setUsers(v){set('mg_users',v)}
function getPosts(){return get('mg_posts',[])}
function setPosts(v){set('mg_posts',v)}
function getNotifs(){return get('mg_notifs',[])}
function setNotifs(v){set('mg_notifs',v)}
function getChats(){return get('mg_chats',[])}
function setChats(v){set('mg_chats',v)}
function getPortfolio(){return get('mg_portfolio',[])}
function setPortfolio(v){set('mg_portfolio',v)}
function currentUser(){const id=localStorage.getItem('mg_currentUser'); return getUsers().find(u=>String(u.id)===String(id))}
function ensureAuth(){if(!currentUser()) location='index.html'}
function initials(n){return (n||'?').split(' ').slice(0,2).map(s=>s[0]).join('').toUpperCase()}
function escapeHTML(s){return (s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function qs(p){return new URLSearchParams(location.search).get(p)}
async function fileToDataURL(file){return new Promise((res,rej)=>{const fr=new FileReader(); fr.onload=()=>res(fr.result); fr.onerror=rej; fr.readAsDataURL(file);})}

/* Auth */
function login(){const e=document.getElementById('lg_email').value.trim(), p=document.getElementById('lg_pass').value.trim(); if(!e||!p) return toast('Informe e-mail e senha'); const u=getUsers().find(x=>x.email===e&&x.pass===p); if(!u) return toast('Credenciais inválidas (use Registrar)'); localStorage.setItem('mg_currentUser',String(u.id)); location='feed.html'}
function register(){const e=document.getElementById('lg_email').value.trim(), p=document.getElementById('lg_pass').value.trim(); if(!e||!p) return toast('Preencha e-mail e senha'); const users=getUsers(); if(users.some(u=>u.email===e)) return toast('E-mail já cadastrado'); const u={id:Date.now(), email:e, pass:p, name:e.split('@')[0], handle:'@'+e.split('@')[0], bio:'', avatar:'', instruments:[], genres:[], following:[]}; users.push(u); setUsers(users); localStorage.setItem('mg_currentUser',String(u.id)); location='feed.html'}
function logout(){localStorage.removeItem('mg_currentUser'); location='index.html'}

/* Seed */
(function seed(){if(!localStorage.getItem('mg_v41_seeded')){
  setUsers([
    {id:1,email:'pyetra@example.com',pass:'123',name:'Pyetra Voice',handle:'@pyetra',bio:'Cantora',instruments:['Voz'],genres:['Pop'],avatar:'',following:[2]},
    {id:2,email:'kzen@example.com',pass:'123',name:'DJ Kzen',handle:'@kzen',bio:'Produtor/DJ',instruments:['DJ'],genres:['Trap'],avatar:'',following:[1]},
    {id:3,email:'guitarhero@example.com',pass:'123',name:'Guitar Hero',handle:'@guitarhero',bio:'Guitarrista',instruments:['Guitarra'],genres:['Rock'],avatar:'',following:[]}
  ]);
  setPosts([
    {id:101,userId:1,ctype:'Cover',instrument:'Voz',genre:'Pop',caption:'Cover de música popular 🎤',image:'',video:'',createdAt:new Date().toISOString(),likes:[2],comments:[{id:1,authorId:2,author:'DJ Kzen',text:'Ficou top!'}]},
    {id:102,userId:2,ctype:'Autoral',instrument:'DJ',genre:'Trap',caption:'Minha composição (beat novo)!',image:'',video:'',createdAt:new Date().toISOString(),likes:[1],comments:[]},
    {id:103,userId:3,ctype:'Jam',instrument:'Guitarra',genre:'Rock',caption:'Improviso solo 🎸',image:'',video:'',createdAt:new Date().toISOString(),likes:[],comments:[]}
  ]);
  setNotifs([{id:401,userId:1,text:'Bem-vindo ao Elance!',at:new Date().toISOString()}]);
  setPortfolio([]); setChats([]);
  localStorage.setItem('mg_v41_seeded','1');
}})();

/* Right widgets */
function renderWidgetsRight(){
  renderSuggestRight();
  const t=document.getElementById('trending'); if(t){ t.innerHTML = ['#Sertanejo','#PopBR','#IndieRock','#TrapBR','#Gospel'].map(tag=>`<div class="row"><span>🎵</span><a href="#" onclick="document.getElementById('fGenre').value='${tag.replace('#','')}'; renderFeed(); return false;">${tag}</a></div>`).join(''); }
  const a=document.getElementById('activity'); if(a){ const notifs=getNotifs().slice(0,5); a.innerHTML = notifs.length? notifs.map(n=>`<div class="row"><span>🔔</span><span class="small">${escapeHTML(n.text)}</span></div>`).join(''): '<div class="small muted">Sem atividade.</div>'; }
}
function renderSuggestRight(){
  const box=document.getElementById('suggestRight'); if(!box) return;
  const me=currentUser(); const users=getUsers().filter(u=>u.id!==me.id);
  box.innerHTML = users.map(u=>`<div class="row"><div class="avatar" style="width:32px;height:32px">${u.avatar? `<img src="${u.avatar}">` : initials(u.name)}</div><div style="flex:1"><a href="user.html?id=${u.id}"><strong>${escapeHTML(u.name)}</strong></a><div class="handle small">${escapeHTML(u.handle)}</div></div><button class="btn" onclick="connect(${u.id}, '${escapeHTML(u.name)}')">Conectar</button></div>`).join('');
}

/* Feed / Posts (igual v4, incluído aqui resumido) */
function getPosts(){return get('mg_posts',[])}
function renderFeed(){const box=document.getElementById('feed'); if(!box) return; const fi=document.getElementById('fInstrument')?.value||''; const fg=document.getElementById('fGenre')?.value||''; const users=getUsers(); const posts=get('mg_posts',[]); const list=posts.filter(p=>(!fi||p.instrument===fi)&&(!fg||p.genre===fg)); box.innerHTML=(list.length?list:posts).map(p=>renderPostHTML(p,users)).join('')||'<p class="muted small">Sem publicações.</p>'}
function renderPostHTML(p, users){ const u=users.find(x=>x.id===p.userId)||{name:'?'}; const liked=(p.likes||[]).includes(currentUser()?.id); const mine=currentUser()?.id===p.userId; const editBtns = mine? `<button class="btn ghost" onclick="editPost(${p.id})">Editar</button><button class="btn danger" onclick="deletePost(${p.id})">Excluir</button>`:''; return `<div class="post"><div class="avatar">${u.avatar? `<img src="${u.avatar}">` : initials(u.name)}</div><div class="content"><div><a href="user.html?id=${u.id}"><strong>${escapeHTML(u.name)}</strong></a> <span class="meta">• ${new Date(p.createdAt).toLocaleString()}</span></div><div class="small muted">${escapeHTML(p.ctype)} • ${escapeHTML(p.instrument)} • ${escapeHTML(p.genre)}</div><div id="cap-${p.id}" style="margin-top:4px">${escapeHTML(p.caption).replace(/\\n/g,'<br/>')}</div>${p.image? `<img class="media" src="${p.image}" alt=""/>`:''}${p.video? `<div style="margin-top:8px"><a href="${p.video}" target="_blank">Ver vídeo</a></div>`:''}<div class="actions"><button class="btn" onclick="toggleLike(${p.id})">${liked? 'Descurtir' : 'Curtir ('+(p.likes?.length||0)+')'}</button><button class="btn" onclick="openComment(${p.id})">Comentar</button><button class="btn" onclick="openDM(${u.id})">Mensagem</button>${editBtns}</div><div id="comments-${p.id}" class="small" style="margin-top:8px">${(p.comments||[]).map(c=>commentHTML(p.id,c)).join('')}</div></div></div><hr/>`; }
function toggleLike(id){const me=currentUser(); const posts=get('mg_posts',[]); const p=posts.find(x=>x.id===id); if(!p) return; p.likes=p.likes||[]; const i=p.likes.indexOf(me.id); if(i>=0){p.likes.splice(i,1)}else{p.likes.push(me.id); addNotif(p.userId, `${me.name} curtiu sua publicação`);} set('mg_posts',posts); renderFeed();}
function openComment(id){const t=prompt('Seu comentário:'); if(!t) return; const me=currentUser(); const posts=get('mg_posts',[]); const p=posts.find(x=>x.id===id); p.comments=p.comments||[]; p.comments.push({id:Date.now(),authorId:me.id,author:me.name,text:t}); set('mg_posts',posts); addNotif(p.userId, `${me.name} comentou no seu post`); renderFeed();}
function commentHTML(postId,c){const mine=currentUser()?.id===c.authorId; const controls=mine? ` <a href="#" onclick="return editComment(${postId},${c.id})">editar</a> • <a href="#" onclick="return deleteComment(${postId},${c.id})">excluir</a>`:''; return `<div><strong>${escapeHTML(c.author)}</strong>: ${escapeHTML(c.text)}${controls}</div>`}
function editComment(postId,cid){const posts=get('mg_posts',[]); const p=posts.find(x=>x.id===postId); const c=p.comments.find(x=>x.id===cid); const nv=prompt('Editar comentário:',c.text); if(nv==null) return false; c.text=nv.trim(); set('mg_posts',posts); renderFeed(); return false}
function deleteComment(postId,cid){const posts=get('mg_posts',[]); const p=posts.find(x=>x.id===postId); p.comments=p.comments.filter(x=>x.id!==cid); set('mg_posts',posts); renderFeed(); return false}
async function publish(){const me=currentUser(); if(!me) return toast('Faça login'); const ctype=document.getElementById('ctype').value, instrument=document.getElementById('instrument').value, genre=document.getElementById('genre').value; const caption=(document.getElementById('caption')?.value||'').trim(); const img=document.getElementById('image'); const video=(document.getElementById('video')?.value||'').trim(); if(!ctype||!instrument||!genre) return toast('Selecione tipo, instrumento e gênero'); if(!caption && !(img?.files?.length) && !video) return toast('Escreva algo ou adicione mídia'); let imgData=''; if(img?.files?.[0]){ if(img.files[0].size>2*1024*1024) return toast('Imagem >2MB'); imgData = await fileToDataURL(img.files[0]); } const posts=get('mg_posts',[]); posts.unshift({id:Date.now(),userId:me.id,ctype,instrument,genre,caption,image:imgData,video,createdAt:new Date().toISOString(),likes:[],comments:[]}); set('mg_posts',posts); notifyFollowers(me.id, `${me.name} publicou em ${genre}/${instrument}`); toast('Publicado!'); location='feed.html'}
function editPost(id){const posts=get('mg_posts',[]); const p=posts.find(x=>x.id===id); const nv=prompt('Editar legenda:',p.caption); if(nv==null) return; p.caption=nv.trim(); set('mg_posts',posts); renderFeed();}
function deletePost(id){if(!confirm('Excluir publicação?')) return; const posts=get('mg_posts',[]).filter(x=>x.id!==id); set('mg_posts',posts); renderFeed();}

/* Profile / Portfolio / Connections / User / DMs / Notifs – iguais ao v4 (omitidos aqui por tamanho) */
function loadProfile(){const me=currentUser(); const av=document.getElementById('heroAvatar'); if(av) av.innerHTML=me.avatar? `<img src="${me.avatar}" style="width:92px;height:92px;border-radius:50%"/>` : initials(me.name); const n=document.getElementById('profName'); if(n) n.textContent=me.name; const h=document.getElementById('profHandle'); if(h) h.textContent=me.handle||('@'+me.name.toLowerCase().replace(/\\s+/g,'')); const b=document.getElementById('profBio'); if(b) b.textContent=me.bio||''; const cp=document.getElementById('countPosts'); if(cp) cp.textContent=get('mg_posts',[]).filter(p=>p.userId===me.id).length; const cc=document.getElementById('countCon'); if(cc) cc.textContent=(me.following||[]).length; const pn=document.getElementById('p_name'); const pb=document.getElementById('p_bio'); const pa=document.getElementById('p_avatar'); const pi=document.getElementById('p_instruments'); const pg=document.getElementById('p_genres'); if(pn) pn.value=me.name||''; if(pb) pb.value=me.bio||''; if(pa) pa.value=me.avatar||''; if(pi) pi.value=(me.instruments||[]).join(', '); if(pg) pg.value=(me.genres||[]).join(', ');}
function toggleEdit(){const f=document.getElementById('editForm'); if(f) f.classList.toggle('hidden')}
function saveProfile(){const users=getUsers(); const me=currentUser(); const idx=users.findIndex(u=>u.id===me.id); users[idx].name=document.getElementById('p_name').value.trim()||users[idx].name; users[idx].bio=document.getElementById('p_bio').value.trim(); users[idx].avatar=document.getElementById('p_avatar').value.trim(); users[idx].instruments=document.getElementById('p_instruments').value.split(',').map(s=>s.trim()).filter(Boolean); users[idx].genres=document.getElementById('p_genres').value.split(',').map(s=>s.trim()).filter(Boolean); setUsers(users); toast('Perfil salvo'); loadProfile(); toggleEdit();}
function switchTab(which){const posts=document.getElementById('panePosts'), port=document.getElementById('panePortfolio'), t1=document.getElementById('tabPosts'), t2=document.getElementById('tabPort'); if(which==='posts'){posts.classList.remove('hidden'); port.classList.add('hidden'); t1.classList.add('active'); t2.classList.remove('active');} else {port.classList.remove('hidden'); posts.classList.add('hidden'); t2.classList.add('active'); t1.classList.remove('active');}}
function renderMyPosts(){const box=document.getElementById('myPosts'); if(!box) return; const me=currentUser(); const users=getUsers(); const posts=get('mg_posts',[]).filter(p=>p.userId===me.id); box.innerHTML=posts.length? posts.map(p=>renderPostHTML(p,users)).join(''):'<p class="muted small">Você ainda não publicou nada.</p>';}

function addPortfolio(){
  const me = currentUser(); if(!me) return toast('Faça login');
  const title = (document.getElementById('pf_title')?.value||'').trim();
  const type = (document.getElementById('pf_type')?.value||'image');
  const url  = (document.getElementById('pf_url')?.value||'').trim();
  const file = document.getElementById('pf_file')?.files?.[0];

  function pushItem(finalUrl){
    const item = { id: Date.now(), userId: me.id, title, type, url: finalUrl||url, at: new Date().toISOString() };
    const list = getPortfolio(); list.unshift(item); setPortfolio(list);
    document.getElementById('pf_title') && (document.getElementById('pf_title').value='');
    document.getElementById('pf_url') && (document.getElementById('pf_url').value='');
    if (document.getElementById('pf_file')) document.getElementById('pf_file').value='';
    renderPortfolio(); toast('Item adicionado ao portfólio');
  }

  if (!title) return toast('Título obrigatório');
  if (file){ const r = new FileReader(); r.onload = ()=> pushItem(r.result); r.readAsDataURL(file); }
  else if (url) pushItem(url);
  else return toast('Informe um arquivo ou URL');
}
function renderPortfolio(){
  const grid = document.getElementById('portfolioGrid') || document.querySelector('.grid-portfolio');
  if (!grid) return;
  const me = currentUser();
  const items = (getPortfolio()||[]).filter(i => String(i.userId)===String(me?.id));
  if (!items.length){ grid.innerHTML = '<p class="muted small">Nenhum item no portfólio ainda.</p>'; return; }
  grid.innerHTML = items.map(it => `
    <div class="card">
      <div class="bd">
        <div class="title">${escapeHTML(it.title)}</div>
        ${it.type==='image' ? `<img src="${it.url}" alt="${escapeHTML(it.title)}" style="width:100%;border-radius:12px;margin-top:8px"/>`
          : it.type==='video' ? `<video src="${it.url}" controls style="width:100%;border-radius:12px;margin-top:8px"></video>`
          : `<a href="${it.url}" target="_blank" rel="noreferrer">Abrir link</a>`}
        <div class="muted small" style="margin-top:6px">${new Date(it.at).toLocaleString()}</div>
        <div style="margin-top:8px"><button class="btn ghost" onclick="deletePortfolio(${it.id})">Excluir</button></div>
      </div>
    </div>
  `).join('');
}

function connect(uid,name){const users=getUsers(); const me=currentUser(); const idx=users.findIndex(u=>u.id===me.id); users[idx].following=users[idx].following||[]; if(!users[idx].following.includes(uid)){users[idx].following.push(uid); setUsers(users); toast('Conectado'); addNotif(uid, `${me.name} conectou com você`);} renderConnections?.(); renderWidgetsRight?.();}
function renderConnections(){const box=document.getElementById('myConnections'); if(!box) return; const me=currentUser(); const users=getUsers(); const list=(me.following||[]).map(id=>users.find(u=>u.id===id)).filter(Boolean); box.innerHTML = list.length? list.map(u=>`<div class="post"><div class="avatar">${initials(u.name)}</div><div class="content"><a href="user.html?id=${u.id}"><strong>${escapeHTML(u.name)}</strong></a></div><div class="actions"><button class="btn" onclick="openDM(${u.id})">Mensagem</button></div></div>`).join(''):'<p class="muted small">Nenhuma conexão.</p>';}

function getNotifs(){return get('mg_notifs',[])}
function setNotifs(v){set('mg_notifs',v)}
function addNotif(userId, text){const notifs=getNotifs(); notifs.unshift({id:Date.now(), userId, text, at:new Date().toISOString()}); setNotifs(notifs)}
function notifyFollowers(ownerId, text){const users=getUsers(); users.forEach(u=>{ if(u.following?.includes(ownerId)) addNotif(u.id, text); })}
function renderNotifs(){const box=document.getElementById('notifList'); if(!box) return; const me=currentUser(); const list=getNotifs().filter(n=>n.userId===me.id); box.innerHTML = list.length? list.map(n=>`<div class="item"><span>${escapeHTML(n.text)}</span><span class="muted small">${new Date(n.at).toLocaleString()}</span></div>`).join('') : '<p class="muted small">Sem notificações.</p>';}

function getChats(){return get('mg_chats',[])}
function setChats(v){set('mg_chats',v)}
function ensureThread(withId){let chats=getChats(); let t=chats.find(c=>c.between?.includes(withId) && c.between?.includes(currentUser().id)); if(!t){t={id:Date.now(), between:[currentUser().id, withId], msgs:[]}; chats.unshift(t); setChats(chats);} return t}
function openDM(withId){ensureThread(withId); location='chat.html'}
function renderChats(){const list=document.getElementById('chatList'); const box=document.getElementById('chatBox'); const me=currentUser(); const users=getUsers(); const chats=getChats().filter(c=>c.between?.includes(me.id)); if(!list||!box) return; list.innerHTML = chats.length? chats.map(c=>{const otherId=c.between.find(i=>i!==me.id); const other=users.find(u=>u.id===otherId)||{name:'?'}; return `<div class="post" onclick="openThread(${c.id})" style="cursor:pointer"><div class="avatar">${initials(other.name)}</div><div class="content"><strong>${escapeHTML(other.name)}</strong><div class="small muted">${(other.instruments||[]).join(', ')}</div></div></div>`}).join('') : '<p class="muted small">Sem conversas.</p>'; if(chats[0]) openThread(chats[0].id);}
function openThread(id){const me=currentUser(); const users=getUsers(); const chats=getChats(); const c=chats.find(x=>x.id===id); const otherId=c.between.find(i=>i!==me.id); const other=users.find(u=>u.id===otherId)||{name:'?'}; const box=document.getElementById('chatBox'); box.innerHTML = `<div class="hd" style="font-weight:800;margin-bottom:8px">${escapeHTML(other.name)}</div>` + c.msgs.map(m=>`<div class="small"><strong>${escapeHTML(m.author)}:</strong> ${escapeHTML(m.text)}</div>`).join('') + `<div style="margin-top:8px"><input id="msgInput" class="input" placeholder="Escrever..." onkeydown="if(event.key==='Enter')sendMsg(${id})"/><div style="margin-top:8px"><button class="btn brand" onclick="sendMsg(${id})">Enviar</button></div></div>`;}
function sendMsg(id){const v=(document.getElementById('msgInput')?.value||'').trim(); if(!v) return; const chats=getChats(); const c=chats.find(x=>x.id===id); const me=currentUser(); const otherId=c.between.find(i=>i!==me.id); c.msgs.push({author:me.name,text:v,at:new Date().toISOString()}); setChats(chats); addNotif(otherId, `${me.name} te enviou uma mensagem`); openThread(id)}


/* Resetar demo: limpa storages e IndexedDB e recarrega */
document.getElementById('reset-demo')?.addEventListener('click', async () => {
  try {
    localStorage.clear();
    sessionStorage.clear();
    if ('indexedDB' in window && indexedDB.databases) {
      const dbs = await indexedDB.databases();
      await Promise.all((dbs||[]).map(info => new Promise(res=>{
        if(!info.name) return res();
        const req = indexedDB.deleteDatabase(info.name);
        req.onsuccess = req.onerror = req.onblocked = () => res();
      })));
    }
  } catch(e) { console.warn('Reset demo falhou parcialmente', e); }
  location.reload();
});

function deletePortfolio(id){
  if(!confirm('Excluir item do portfólio?')) return;
  const list = (getPortfolio()||[]).filter(x=>x.id!==id);
  setPortfolio(list); renderPortfolio();
}
