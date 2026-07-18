const q=(s,c=document)=>c.querySelector(s),qa=(s,c=document)=>[...c.querySelectorAll(s)],header=q('.header'),menu=q('.menu'),nav=q('.header nav'),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const setHeader=()=>header?.classList.toggle('scrolled',scrollY>18);setHeader();addEventListener('scroll',setHeader,{passive:true});
menu?.setAttribute('aria-expanded','false');menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',open);});qa('.header nav a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu?.setAttribute('aria-expanded','false')}));
const reveal=qa('.split>*,.process article,.feature>* ,.markets>.kicker,.markets>h2,.market-grid article,.page-hero>*,.service-grid article,.audiences article,.checklist>*,.faq>*,.principles article,.contact-grid>*,.article-grid a,.article-hero>*,.article-body>*,.related>*');reveal.forEach((el,i)=>{el.classList.add('reveal');el.style.setProperty('--delay',`${i%4*75}ms`)});if(reduce)reveal.forEach(el=>el.classList.add('in-view'));else{const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');io.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -45px'});reveal.forEach(el=>io.observe(el))}
qa('[data-count]').forEach(el=>{const end=+el.dataset.count,suffix=el.dataset.suffix||'';el.textContent='0'+suffix;const run=()=>{if(reduce){el.textContent=end+suffix;return}const start=performance.now(),tick=t=>{const p=Math.min((t-start)/950,1),n=Math.round(end*(1-Math.pow(1-p,3)));el.textContent=n+suffix;if(p<1)requestAnimationFrame(tick)};requestAnimationFrame(tick)};const io=new IntersectionObserver(es=>{if(es[0].isIntersecting){run();io.disconnect()}},{threshold:.7});io.observe(el)});
const wa=document.createElement('a');wa.className='whatsapp-float';wa.href='https://wa.me/375297957818';wa.target='_blank';wa.rel='noopener';wa.setAttribute('aria-label','Написать в WhatsApp');wa.textContent='WA';document.body.append(wa);
const article=q('.article-body');if(article){const bar=document.createElement('div');bar.className='reading-progress';document.body.append(bar);const progress=()=>{const start=article.offsetTop-innerHeight*.25,end=article.offsetTop+article.offsetHeight-innerHeight*.75;bar.style.width=Math.max(0,Math.min(1,(scrollY-start)/(end-start)))*100+'%'};progress();addEventListener('scroll',progress,{passive:true})}
const form=q('#profile-form');
if(form){
  const status=q('#form-status'),birth=q('[name="birthYear"]',form),parent=q('#parent-fields'),button=q('button[type="submit"]',form),year=new Date().getFullYear();birth.min=year-60;birth.max=year-8;
  const updateParent=()=>{const year=Number(birth.value),minor=Number.isInteger(year)&&year>=new Date().getFullYear()-18;parent.hidden=!minor;parent.setAttribute('aria-hidden',String(!minor));qa('input',parent).forEach(input=>input.required=minor)};
  birth.addEventListener('input',updateParent);updateParent();
  const params=new URLSearchParams(location.search),utm={utm_source:'utmSource',utm_medium:'utmMedium',utm_campaign:'utmCampaign',utm_content:'utmContent',utm_term:'utmTerm'};
  Object.entries(utm).forEach(([key,name])=>{const input=q(`[name="${name}"]`,form);if(input)input.value=params.get(key)||''});q('[name="referrer"]',form).value=document.referrer||'';
  const clearErrors=()=>{qa('.field-error',form).forEach(el=>el.textContent='');qa('[aria-invalid="true"]',form).forEach(el=>el.removeAttribute('aria-invalid'));status.textContent='';status.className='form-status'};
  const showErrors=(errors={})=>{Object.entries(errors).forEach(([name,message])=>{const output=q(`[data-error-for="${name}"]`,form),input=q(`[name="${name}"]`,form);if(output)output.textContent=message;if(input)input.setAttribute('aria-invalid','true')});const first=q('[aria-invalid="true"]',form);first?.focus()};
  form.addEventListener('submit',async event=>{
    event.preventDefault();clearErrors();button.disabled=true;button.textContent='Отправляем…';status.textContent='Сохраняем заявку и файлы…';
    try{
      const response=await fetch(form.action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}}),data=await response.json().catch(()=>({}));
      if(!response.ok){showErrors(data.errors);status.textContent=data.message||'Проверьте форму и попробуйте ещё раз.';status.classList.add('error');if(window.turnstile)turnstile.reset();return}
      sessionStorage.removeItem('eha-application-draft');location.assign(`/application-success?ref=${encodeURIComponent(data.reference)}`);
    }catch(error){status.textContent='Нет связи с сервером. Данные не отправлены. Попробуйте снова или используйте прямой контакт.';status.classList.add('error');if(window.turnstile)turnstile.reset()}
    finally{button.disabled=false;button.textContent='Отправить заявку'}
  });
}

const reference=q('[data-application-reference]');
if(reference){const value=new URLSearchParams(location.search).get('ref')||'';if(/^EHA-\d{6}-[A-F0-9]{6}$/.test(value)){reference.textContent=value;const link=q('[data-success-whatsapp]');if(link)link.href=`https://wa.me/375297957818?text=${encodeURIComponent(`Здравствуйте! Моя заявка с сайта: ${value}`)}`}else reference.textContent='номер не найден'}
