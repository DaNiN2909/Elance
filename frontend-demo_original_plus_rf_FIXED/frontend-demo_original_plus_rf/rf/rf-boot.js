(function(){
  try{
    var a=document.createElement('a');
    a.href='rf/index.html';
    a.textContent='Abrir Camada RF';
    a.className='rf-fab';
    a.style.position='fixed';a.style.right='14px';a.style.bottom='14px';
    a.style.background='#1a2532';a.style.border='1px solid #1f2a36';a.style.borderRadius='999px';a.style.padding='10px 14px';a.style.fontWeight='600';a.style.boxShadow='0 6px 20px rgba(0,0,0,.35)';
    document.body.appendChild(a);
  }catch(e){}
})();
