const LANG=document.documentElement.lang==='en'?'en':'ru';
const T={
  ru:{waAria:'Написать в WhatsApp',submitting:'Отправляем…',saving:'Сохраняем заявку и файлы…',clubSending:'Отправляем запрос клуба…',clubSuccess:v=>`Запрос отправлен. Номер: ${v}`,checkForm:'Проверьте форму и попробуйте ещё раз.',noConn:'Нет связи с сервером. Данные не отправлены. Попробуйте снова или используйте прямой контакт.',submit:'Отправить заявку',clubSubmit:'Отправить запрос',countryPrefix:'Интересующая страна',notFound:'номер не найден',waGreeting:v=>`Здравствуйте! Моя заявка с сайта: ${v}`},
  en:{waAria:'Message us on WhatsApp',submitting:'Sending…',saving:'Saving your application and files…',clubSending:'Sending the club request…',clubSuccess:v=>`Request sent. Reference: ${v}`,checkForm:'Check the form and try again.',noConn:'No connection to the server. Nothing was sent. Try again or use direct contact.',submit:'Send application',clubSubmit:'Send request',countryPrefix:'Target country',notFound:'reference not found',waGreeting:v=>`Hi! My application reference: ${v}`}
}[LANG];
const q=(s,c=document)=>c.querySelector(s),qa=(s,c=document)=>[...c.querySelectorAll(s)],header=q('.header'),menu=q('.menu'),nav=q('.header nav'),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const setHeader=()=>header?.classList.toggle('scrolled',scrollY>18);setHeader();addEventListener('scroll',setHeader,{passive:true});
menu?.setAttribute('aria-expanded','false');menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',open);});qa('.header nav a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu?.setAttribute('aria-expanded','false')}));
const reveal=qa('.split>*,.process article,.feature>* ,.markets>.kicker,.markets>h2,.market-grid article,.page-hero>*,.service-grid article,.audiences article,.checklist>*,.faq>*,.principles article,.contact-grid>*,.article-grid a,.article-hero>*,.article-body>*,.related>*');reveal.forEach((el,i)=>{el.classList.add('reveal');el.style.setProperty('--delay',`${i%4*75}ms`)});if(reduce)reveal.forEach(el=>el.classList.add('in-view'));else{const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');io.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -45px'});reveal.forEach(el=>io.observe(el));const show=()=>{let left=0;reveal.forEach(el=>{if(el.classList.contains('in-view'))return;if(el.getBoundingClientRect().top<innerHeight*.95){el.classList.add('in-view');io.unobserve(el)}else left++});return left};show();addEventListener('scroll',show,{passive:true});addEventListener('resize',show,{passive:true});setTimeout(()=>reveal.forEach(el=>el.classList.add('in-view')),6000)}
qa('[data-count]').forEach(el=>{const end=+el.dataset.count,suffix=el.dataset.suffix||'';el.textContent='0'+suffix;const run=()=>{if(reduce){el.textContent=end+suffix;return}const start=performance.now(),tick=t=>{const p=Math.min((t-start)/950,1),n=Math.round(end*(1-Math.pow(1-p,3)));el.textContent=n+suffix;if(p<1)requestAnimationFrame(tick)};requestAnimationFrame(tick)};const io=new IntersectionObserver(es=>{if(es[0].isIntersecting){run();io.disconnect()}},{threshold:.7});io.observe(el)});
const wa=document.createElement('a');wa.className='whatsapp-float';wa.href='https://wa.me/375297957818';wa.target='_blank';wa.rel='noopener';wa.setAttribute('aria-label',T.waAria);wa.textContent='WA';document.body.append(wa);
const article=q('.article-body');if(article){const bar=document.createElement('div');bar.className='reading-progress';document.body.append(bar);const progress=()=>{const start=article.offsetTop-innerHeight*.25,end=article.offsetTop+article.offsetHeight-innerHeight*.75;bar.style.width=Math.max(0,Math.min(1,(scrollY-start)/(end-start)))*100+'%'};progress();addEventListener('scroll',progress,{passive:true})}
const form=q('#profile-form');
if(form){
  const status=q('#form-status'),birth=q('[name="birthYear"]',form),parent=q('#parent-fields'),button=q('button[type="submit"]',form),year=new Date().getFullYear();birth.min=year-60;birth.max=year-8;
  const updateParent=()=>{const year=Number(birth.value),minor=Number.isInteger(year)&&year>=new Date().getFullYear()-18;parent.hidden=!minor;parent.setAttribute('aria-hidden',String(!minor));qa('input',parent).forEach(input=>input.required=minor)};
  birth.addEventListener('input',updateParent);updateParent();
  const params=new URLSearchParams(location.search),utm={utm_source:'utmSource',utm_medium:'utmMedium',utm_campaign:'utmCampaign',utm_content:'utmContent',utm_term:'utmTerm'};
  Object.entries(utm).forEach(([key,name])=>{const input=q(`[name="${name}"]`,form);if(input)input.value=params.get(key)||''});q('[name="referrer"]',form).value=document.referrer||'';
  const country=(params.get('country')||'').trim().slice(0,100),message=q('[name="message"]',form);
  if(country&&message&&!message.value.trim())message.value=`${T.countryPrefix}: ${country}`;
  const clearErrors=()=>{qa('.field-error',form).forEach(el=>el.textContent='');qa('[aria-invalid="true"]',form).forEach(el=>el.removeAttribute('aria-invalid'));status.textContent='';status.className='form-status'};
  const showErrors=(errors={})=>{Object.entries(errors).forEach(([name,message])=>{const output=q(`[data-error-for="${name}"]`,form),input=q(`[name="${name}"]`,form);if(output)output.textContent=message;if(input)input.setAttribute('aria-invalid','true')});const first=q('[aria-invalid="true"]',form);first?.focus()};
  form.addEventListener('submit',async event=>{
    event.preventDefault();clearErrors();button.disabled=true;button.textContent=T.submitting;status.textContent=T.saving;
    try{
      const response=await fetch(form.action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}}),data=await response.json().catch(()=>({}));
      if(!response.ok){showErrors(data.errors);status.textContent=data.message||T.checkForm;status.classList.add('error');if(window.turnstile)turnstile.reset();return}
      const enPrefix=location.pathname.startsWith('/en/')||location.pathname==='/en'?'/en':'';
      sessionStorage.removeItem('eha-application-draft');location.assign(`${enPrefix}/application-success?ref=${encodeURIComponent(data.reference)}`);
    }catch(error){status.textContent=T.noConn;status.classList.add('error');if(window.turnstile)turnstile.reset()}
    finally{button.disabled=false;button.textContent=T.submit}
  });
}

const clubForm=q('#club-request-form');
if(clubForm){
  const status=q('#club-form-status'),button=q('button[type="submit"]',clubForm),countryInput=q('[name="country"]',clubForm);
  const requestedCountry=(new URLSearchParams(location.search).get('country')||'').trim().slice(0,100);
  if(requestedCountry&&countryInput&&!countryInput.value)countryInput.value=requestedCountry;
  const clearErrors=()=>{qa('.field-error',clubForm).forEach(el=>el.textContent='');qa('[aria-invalid="true"]',clubForm).forEach(el=>el.removeAttribute('aria-invalid'));status.textContent='';status.className='form-status'};
  const showErrors=(errors={})=>{Object.entries(errors).forEach(([name,message])=>{const output=q(`[data-error-for="${name}"]`,clubForm),input=q(`[name="${name}"]`,clubForm);if(output)output.textContent=message;if(input)input.setAttribute('aria-invalid','true')});q('[aria-invalid="true"]',clubForm)?.focus()};
  clubForm.addEventListener('submit',async event=>{
    event.preventDefault();clearErrors();button.disabled=true;button.textContent=T.submitting;status.textContent=T.clubSending;
    const formData=new FormData(clubForm),payload=Object.fromEntries(formData.entries());
    payload.dataConsent=formData.has('dataConsent');payload.locale=LANG;payload.turnstileToken=formData.get('cf-turnstile-response')||'';
    try{
      const response=await fetch(clubForm.action,{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify(payload)}),data=await response.json().catch(()=>({}));
      if(!response.ok){showErrors(data.errors);status.textContent=data.message||T.checkForm;status.classList.add('error');if(window.turnstile)turnstile.reset();return}
      status.textContent=T.clubSuccess(data.reference);clubForm.reset();if(countryInput)countryInput.value=requestedCountry;if(window.turnstile)turnstile.reset();
    }catch(error){status.textContent=T.noConn;status.classList.add('error');if(window.turnstile)turnstile.reset()}
    finally{button.disabled=false;button.textContent=T.clubSubmit}
  });
}

const reference=q('[data-application-reference]');
if(reference){const value=new URLSearchParams(location.search).get('ref')||'';if(/^EHA-\d{6}-[A-F0-9]{6}$/.test(value)){reference.textContent=value;const link=q('[data-success-whatsapp]');if(link)link.href=`https://wa.me/375297957818?text=${encodeURIComponent(T.waGreeting(value))}`}else reference.textContent=T.notFound}
