const LANG=document.documentElement.lang==='en'?'en':'ru';
const T={
  ru:{waAria:'Написать в WhatsApp',submitting:'Отправляем…',saving:'Сохраняем заявку и файлы…',clubSending:'Отправляем запрос клуба…',clubSuccess:v=>`Запрос отправлен. Номер: ${v}`,checkForm:'Проверьте форму и попробуйте ещё раз.',noConn:'Нет связи с сервером. Данные не отправлены. Попробуйте снова или используйте прямой контакт.',unconfirmed:'Не удалось подтвердить результат отправки. Не отправляйте форму повторно — свяжитесь с нами, чтобы проверить заявку.',submit:'Отправить заявку',clubSubmit:'Отправить запрос',countryPrefix:'Интересующая страна',notFound:'номер не найден',waGreeting:v=>`Здравствуйте! Моя заявка с сайта: ${v}`,cookieText:'Мы используем cookies для аналитики, чтобы понимать, какие материалы полезны, и делать сайт лучше.',cookieAccept:'Принять',cookieDecline:'Отклонить'},
  en:{waAria:'Message us on WhatsApp',submitting:'Sending…',saving:'Saving your application and files…',clubSending:'Sending the club request…',clubSuccess:v=>`Request sent. Reference: ${v}`,checkForm:'Check the form and try again.',noConn:'No connection to the server. Nothing was sent. Try again or use direct contact.',unconfirmed:'We could not confirm the submission result. Do not submit again — contact us to check the application.',submit:'Send application',clubSubmit:'Send request',countryPrefix:'Target country',notFound:'reference not found',waGreeting:v=>`Hi! My application reference: ${v}`,cookieText:'We use cookies for analytics, to understand which guides are useful and make the site better.',cookieAccept:'Accept',cookieDecline:'Decline'}
}[LANG];
const q=(s,c=document)=>c.querySelector(s),qa=(s,c=document)=>[...c.querySelectorAll(s)],header=q('.header'),menu=q('.menu'),nav=q('.header nav'),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
// One rAF-throttled scroll handler for all scroll-driven classes (header state,
// header auto-hide, reading progress) instead of several listeners each doing
// work on every scroll event.
const onScrollFns=[];let scrollQueued=false;
const onScroll=()=>{if(scrollQueued)return;scrollQueued=true;requestAnimationFrame(()=>{scrollQueued=false;const y=scrollY;onScrollFns.forEach(f=>f(y))})};
addEventListener('scroll',onScroll,{passive:true});
const setHeader=y=>header?.classList.toggle('scrolled',y>18);setHeader(scrollY);onScrollFns.push(setHeader);
// Mobile menu: one source of truth for open/closed state, label, aria-controls,
// Escape to close, and auto-close when the layout switches to desktop.
const uiLang=(document.documentElement.lang||'en').slice(0,2),ruUI=uiLang==='ru',origMenuLabel=menu?.getAttribute('aria-label')||'Menu';
const menuLabels=ruUI?['Открыть меню','Закрыть меню']:uiLang==='en'?['Open menu','Close menu']:[origMenuLabel,origMenuLabel];
if(nav&&!nav.id)nav.id='site-nav';
if(nav&&!nav.getAttribute('aria-label'))nav.setAttribute('aria-label',ruUI?'Основное меню':uiLang==='en'?'Main menu':'Menu');
const setMenu=(open,returnFocus)=>{if(!nav||!menu)return;nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',menuLabels[open?1:0]);if(!open&&returnFocus)menu.focus();};
if(menu){menu.setAttribute('aria-controls',nav?.id||'site-nav');setMenu(false);menu.addEventListener('click',()=>setMenu(!nav.classList.contains('open')));}
qa('.header nav a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('open'))setMenu(false,true);});
const deskMQ=window.matchMedia('(min-width:851px)');deskMQ.addEventListener?.('change',e=>{if(e.matches)setMenu(false);});
const reveal=qa('.split>*,.process article,.feature>* ,.markets>.kicker,.markets>h2,.market-grid article,.page-hero>*,.service-grid article,.audiences article,.checklist>*,.faq>*,.principles article,.contact-grid>*,.article-grid a,.article-hero>*,.article-body>*,.related>*,.section-intro>*,.case-row a,.cases-link,.case-grid article,.country-card,.fact-grid article,.evidence-legend>div,.criteria-columns>div,.cta>*');reveal.forEach((el,i)=>{el.classList.add('reveal');el.style.setProperty('--delay',`${i%4*75}ms`)});if(reduce)reveal.forEach(el=>el.classList.add('in-view'));else{const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');io.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -45px'});reveal.forEach(el=>io.observe(el));// Elements already on screen at load: read all positions first, then write
// classes (no read/write interleaving). Later reveals come from the observer
// only, so scrolling no longer forces layout on every event.
const vh=innerHeight*.95,first=reveal.filter(el=>el.getBoundingClientRect().top<vh);first.forEach(el=>{el.classList.add('in-view');io.unobserve(el)});addEventListener('beforeprint',()=>reveal.forEach(el=>el.classList.add('in-view')))}
// Design system: theme toggle, header auto-hide, self-drawing hairlines, hero traces.
// The first-paint theme is set by the inline boot script in <head> (src/app.js);
// this only handles the visitor's later choice, stored under THEME_KEY.
const root=document.documentElement,THEME_KEY='eha-theme';
if(header){
  const label=()=>{const light=root.dataset.theme==='light';return LANG==='ru'?(light?'Включить тёмную тему':'Включить светлую тему'):(light?'Switch to dark theme':'Switch to light theme')};
  const tb=document.createElement('button');tb.type='button';tb.className='theme-toggle';
  tb.innerHTML='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><mask id="theme-cut"><rect width="24" height="24" fill="#fff"/><circle class="t-cut" cx="24" cy="10" r="7" fill="#000"/></mask><circle class="t-core" cx="12" cy="12" r="4.6" fill="currentColor" mask="url(#theme-cut)"/><path class="t-rays" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" d="M12 2.2v2.3M12 19.5v2.3M2.2 12h2.3M19.5 12h2.3M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M5.1 18.9l1.6-1.6M17.3 6.7l1.6-1.6"/></svg>';
  const sync=()=>{tb.setAttribute('aria-label',label());tb.title=label()};sync();
  tb.addEventListener('click',()=>{
    const next=root.dataset.theme==='light'?'dark':'light',apply=()=>{root.dataset.theme=next;try{localStorage.setItem(THEME_KEY,next)}catch(error){}sync()};
    if(reduce||!document.startViewTransition){root.classList.add('theme-fade');apply();setTimeout(()=>root.classList.remove('theme-fade'),600);return}
    const r=tb.getBoundingClientRect();root.style.setProperty('--tx',`${r.left+r.width/2}px`);root.style.setProperty('--ty',`${r.top+r.height/2}px`);
    root.classList.add('theme-vt');document.startViewTransition(apply).finished.finally(()=>root.classList.remove('theme-vt'));
  });
  header.append(tb);
  let lastY=scrollY;onScrollFns.push(y=>{header.classList.toggle('is-hidden',y>lastY&&y>420);lastY=y});
}
const draw=qa('.split,.page-hero,.related-head,.process,footer small,.country-guide>section:not(.sources-block):not(.country-action):not(.club-country-cta)');draw.forEach(el=>el.classList.add('draw'));
if(reduce||!('IntersectionObserver' in window))draw.forEach(el=>el.classList.add('drawn'));
else{const dio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('drawn');dio.unobserve(e.target)}}),{rootMargin:'0px 0px -12% 0px'});draw.forEach(el=>dio.observe(el))}
// Hero traces: thin puck paths drawn on a canvas over the photo. Desktop only,
// off for reduced motion, and paused whenever the hero is out of view.
const heroEl=q('.hero');
if(heroEl&&!reduce&&matchMedia('(min-width: 851px)').matches){
  const cv=document.createElement('canvas');cv.className='hero-fx';cv.setAttribute('aria-hidden','true');heroEl.prepend(cv);
  const cx=cv.getContext('2d');let w=0,h=0,running=false,raf=0,traces=[];
  const size=()=>{const d=Math.min(devicePixelRatio||1,1.5);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*d;cv.height=h*d;cx.setTransform(d,0,0,d,0,0)};
  const rnd=(a,b)=>a+Math.random()*(b-a);
  const make=()=>{const y0=h*rnd(.3,.85),y1=h*rnd(.2,.8);return{p:[w*rnd(.36,.5),y0,w*rnd(.52,.66),y0-h*rnd(.05,.35),w*rnd(.7,.86),y1+h*rnd(.05,.3),w*1.02,y1],t:0,v:rnd(.007,.013),life:1}};
  const at=(p,t)=>{const u=1-t;return[u*u*u*p[0]+3*u*u*t*p[2]+3*u*t*t*p[4]+t*t*t*p[6],u*u*u*p[1]+3*u*u*t*p[3]+3*u*t*t*p[5]+t*t*t*p[7]]};
  // Drawn at ~30 fps (speeds doubled to keep the same motion); when no trace is
  // on screen the loop sleeps until the next one is due instead of clearing an
  // empty canvas every frame.
  // Traces play in a ~15 s burst each time the hero comes into view, then the
  // loop stops completely until the hero is scrolled away and back.
  let lastDraw=0,spawnTimer=0,burstEnd=0;
  const wake=()=>{spawnTimer=0;if(running&&!raf)raf=requestAnimationFrame(frame)};
  const frame=now=>{
    raf=0;
    if(now-lastDraw<31){if(running)raf=requestAnimationFrame(frame);return}
    lastDraw=now;
    cx.clearRect(0,0,w,h);
    traces.forEach(o=>{
      if(o.t<1)o.t=Math.min(1,o.t+o.v);else o.life-=.024;
      cx.beginPath();for(let i=0;i<=48;i++){const[x,y]=at(o.p,o.t*i/48);i?cx.lineTo(x,y):cx.moveTo(x,y)}
      cx.strokeStyle=`rgba(247,251,255,${.3*Math.max(o.life,0)})`;cx.lineWidth=1;cx.stroke();
      if(o.t<1){const[x,y]=at(o.p,o.t);cx.beginPath();cx.arc(x,y,2.5,0,6.3);cx.fillStyle='rgba(247,251,255,.9)';cx.fill()}
    });
    traces=traces.filter(o=>o.life>0);
    const live=now<burstEnd;
    if(live&&traces.length<3&&Math.random()<.04)traces.push(make());
    if(!running)return;
    if(traces.length)raf=requestAnimationFrame(frame);
    else if(live&&!spawnTimer)spawnTimer=setTimeout(()=>{traces.push(make());wake()},rnd(400,1600));
  };
  size();addEventListener('resize',size,{passive:true});
  let heroVisible=false;
  const setRun=()=>{const on=heroVisible&&!document.hidden;if(on&&!running){running=true;burstEnd=performance.now()+15000;wake()}else if(!on&&running){running=false;cancelAnimationFrame(raf);raf=0;clearTimeout(spawnTimer);spawnTimer=0}};
  new IntersectionObserver(es=>{heroVisible=es[0].isIntersecting;setRun()}).observe(heroEl);
  document.addEventListener('visibilitychange',setRun);
}
// Decorative CSS loops run only while their block is on screen.
if('IntersectionObserver' in window){const loopIO=new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle('fx-on',e.isIntersecting)));qa('.cta,.hero').forEach(el=>loopIO.observe(el))}
// Counters: the final value is in the HTML and is never rewritten (a count-up from 0 froze at "0+" whenever rAF was paused: background tabs, previews, slow devices). The only motion is a one-off CSS accent, skipped with reduced motion.
if(!reduce&&'IntersectionObserver' in window){const cio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('count-in');cio.unobserve(e.target)}}),{threshold:.6});qa('[data-count]').forEach(el=>cio.observe(el))}
const wa=document.createElement('a');wa.className='whatsapp-float';wa.href='https://wa.me/375297957818';wa.target='_blank';wa.rel='noopener';wa.setAttribute('aria-label',T.waAria);wa.textContent='WA';document.body.append(wa);

// Consent Mode default (set server-side in <head>, before gtag.js loads) is
// analytics_storage: denied. A stored "granted" choice from an earlier visit
// must be re-applied every load, since the default resets on each page.
const CONSENT_KEY='eha-cookie-consent';
const updateConsent=granted=>{if(typeof gtag==='function')gtag('consent','update',{analytics_storage:granted?'granted':'denied'})};
const initYandex=()=>{if(typeof ym==='function')ym(110889446,'init',{ssr:true,webvisor:true,clickmap:true,ecommerce:'dataLayer',accurateTrackBounce:true,trackLinks:true})};
const consent=localStorage.getItem(CONSENT_KEY);
if(consent==='granted'){updateConsent(true);initYandex()}
else if(!consent){
  const banner=document.createElement('div');banner.className='cookie-banner';banner.setAttribute('role','dialog');banner.setAttribute('aria-label','Cookies');
  banner.innerHTML=`<p>${T.cookieText}</p><div class="cookie-actions"><button type="button" class="btn ghost" data-cookie="decline">${T.cookieDecline}</button><button type="button" class="btn primary" data-cookie="accept">${T.cookieAccept}</button></div>`;
  document.body.append(banner);
  banner.addEventListener('click',event=>{
    const choice=event.target.closest('[data-cookie]')?.dataset.cookie;
    if(!choice)return;
    localStorage.setItem(CONSENT_KEY,choice==='accept'?'granted':'denied');
    updateConsent(choice==='accept');
    if(choice==='accept'){initYandex();try{attribution=readAttribution(sessionStorage,location.pathname,new URLSearchParams(location.search),document.referrer)}catch(error){}}
    banner.remove();
  });
}
// Reading progress: article geometry is measured on load/resize only; on scroll
// the bar is moved with transform (compositor-only), never width.
const article=q('.article-body');if(article){const bar=document.createElement('div');bar.className='reading-progress';document.body.append(bar);let start=0,span=1;const measure=()=>{const top=article.getBoundingClientRect().top+scrollY;start=top-innerHeight*.25;span=Math.max(1,article.offsetHeight-innerHeight*.5)};const progress=y=>{bar.style.transform=`scaleX(${Math.max(0,Math.min(1,(y-start)/span))})`};measure();progress(scrollY);onScrollFns.push(progress);addEventListener('resize',()=>{measure();progress(scrollY)},{passive:true});if('ResizeObserver' in window)new ResizeObserver(()=>{measure();progress(scrollY)}).observe(article)}
// Session attribution is collected only after analytics consent. Store paths,
// never URL queries/fragments, and keep the landing page distinct from sourcePage.
function readAttribution(storage, pathname, params, referrer) {
  let value={};try{value=JSON.parse(storage.getItem('eha-attribution')||'{}')||{}}catch(error){}
  const cleanPath=v=>typeof v==='string'&&/^\/(?!\/)[^?#\\]*$/.test(v)?v.slice(0,300):'';
  const prior=cleanPath(value.lastPage),landing=cleanPath(value.landingPage)||cleanPath(pathname);
  const utm={};['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(key=>{utm[key]=String(value[key]||params.get(key)||'').slice(0,160)});
  let referrerHost=String(value.referrerHost||'').slice(0,200);if(!referrerHost){try{referrerHost=new URL(referrer).hostname}catch(error){}}
  const result={...utm,landingPage:landing,previousPage:prior,referrerHost,lastPage:cleanPath(pathname)};
  try{storage.setItem('eha-attribution',JSON.stringify(result))}catch(error){}
  return result;
}
let attribution={};
try{if(localStorage.getItem(CONSENT_KEY)==='granted')attribution=readAttribution(sessionStorage,location.pathname,new URLSearchParams(location.search),document.referrer)}catch(error){}

const form=q('#profile-form');
if(form){
  const status=q('#form-status'),birth=q('[name="birthYear"]',form),parent=q('#parent-fields'),button=q('button[type="submit"]',form),year=new Date().getFullYear(),applicants=qa('[name="applicantType"]',form),height=q('[name="heightCm"]',form),weight=q('[name="weightKg"]',form),stick=q('[name="stickHand"]',form),intentInput=q('[name="intent"]',form);birth.min=year-60;birth.max=year-8;
  const applicantType=()=>q('[name="applicantType"]:checked',form)?.value||'player';
  const isMinor=()=>{const y=Number(birth.value);return Number.isInteger(y)&&y>=new Date().getFullYear()-18};
  const updateApplicant=()=>{const parentApplicant=applicantType()==='parent_guardian',minor=isMinor(),needsParent=minor||parentApplicant,title=q('#parent-section-title',form),consentCopy=q('#parent-consent-copy',form);parent.hidden=!needsParent;parent.setAttribute('aria-hidden',String(!needsParent));qa('input',parent).forEach(input=>input.required=needsParent);[height,weight,stick].forEach(input=>{if(input)input.required=form.dataset.measurements==='required'&&!parentApplicant});if(title)title.textContent=minor?(LANG==='en'?'For a player under 18':'Для игрока младше 18 лет'):(LANG==='en'?'Parent / guardian contact':'Контакт родителя / представителя');if(consentCopy)consentCopy.textContent=minor?(LANG==='en'?'I am the parent or legal guardian and consent to the processing of the player\'s data.':'Я являюсь родителем или законным представителем и согласен на обработку данных игрока.'):(LANG==='en'?'I confirm I have the adult player\'s permission to submit this profile and contact information.':'Подтверждаю, что взрослый игрок разрешил мне отправить его профиль и контактные данные.')};
  birth.addEventListener('input',updateApplicant);applicants.forEach(input=>input.addEventListener('change',updateApplicant));
  const params=new URLSearchParams(location.search),utm={utm_source:'utmSource',utm_medium:'utmMedium',utm_campaign:'utmCampaign',utm_content:'utmContent',utm_term:'utmTerm'};
  const requestedType=(params.get('type')||'').trim(),requestedIntent=(params.get('intent')||'').trim(),parentEntry=['parent','parent_guardian'].includes(requestedType),analysisEntry=requestedIntent==='player-analysis',europeRouteEntry=requestedIntent==='europe_route';if(parentEntry){const radio=q('[name="applicantType"][value="parent_guardian"]',form);if(radio)radio.checked=true}
  if(intentInput)intentInput.value=requestedIntent.slice(0,60);
  if(parentEntry){const kicker=q('#contact-kicker'),title=q('#contact-title'),lead=q('#contact-lead');if(kicker)kicker.textContent=LANG==='en'?'Parent / guardian enquiry':'Обращение родителя / представителя';if(title)title.innerHTML=LANG==='en'?'Request a<br><em>junior assessment</em>':'Запросите<br><em>оценку юниорского маршрута</em>';if(lead)lead.textContent=LANG==='en'?'Send the player’s core details and your goal. EHA will review the sporting profile first and explain the next step and what still needs official confirmation.':'Пришлите основные данные игрока и цель семьи. EHA сначала оценит спортивный профиль, затем объяснит следующий шаг и что ещё нужно подтвердить официально.'}
  else if(analysisEntry){const kicker=q('#contact-kicker'),title=q('#contact-title'),lead=q('#contact-lead');if(kicker)kicker.textContent=LANG==='en'?'Full player analysis':'Полный анализ игрока';if(title)title.innerHTML=LANG==='en'?'Request a<br><em>player analysis</em>':'Запросите<br><em>анализ игрока</em>';if(lead)lead.textContent=LANG==='en'?'Send the player profile and recent full-game video. EHA will first confirm whether the material is sufficient and agree the scope before any paid work starts.':'Пришлите профиль игрока и свежее видео полного матча. EHA сначала подтвердит, достаточно ли материалов, и согласует объём до начала платной работы.'}
  else if(europeRouteEntry){const kicker=q('#contact-kicker'),title=q('#contact-title'),lead=q('#contact-lead');if(kicker)kicker.textContent=LANG==='en'?'European hockey route':'Маршрут в европейский хоккей';if(title)title.innerHTML=LANG==='en'?'Assess your route<br><em>to European hockey</em>':'Оцените свой путь<br><em>в европейский хоккей</em>';if(lead)lead.textContent=LANG==='en'?'Send your player profile, recent statistics and video. EHA will assess realistic league levels and explain the next steps without guaranteeing a club decision.':'Пришлите профиль игрока, свежую статистику и видео. EHA оценит реалистичные уровни лиг и объяснит следующие шаги без гарантии решения клуба.'}
  updateApplicant();
  Object.entries(utm).forEach(([key,name])=>{const input=q(`[name="${name}"]`,form);if(input)input.value=params.get(key)||attribution[key]||''});q('[name="referrer"]',form).value=document.referrer||'';const sourcePageInput=q('[name="sourcePage"]',form);if(sourcePageInput){let sourcePage=(params.get('source_page')||'').trim();if(!sourcePage&&document.referrer){try{const ref=new URL(document.referrer);if(ref.origin===location.origin)sourcePage=ref.pathname}catch(error){}}if(!sourcePage&&attribution.previousPage&&attribution.previousPage!==location.pathname)sourcePage=attribution.previousPage;sourcePageInput.value=sourcePage.slice(0,300)}
  [['landingPage',attribution.landingPage],['initialReferrerHost',attribution.referrerHost]].forEach(([name,value])=>{if(!value)return;const input=document.createElement('input');input.type='hidden';input.name=name;input.value=value;form.append(input)});
  const country=(params.get('country')||'').trim().slice(0,100),league=(params.get('league')||'').trim().slice(0,100),note=(params.get('note')||'').trim().slice(0,300),message=q('[name="message"]',form);
  const displayCountry=LANG==='ru'&&country.toLowerCase()==='austria'?'Австрия':country;
  const displayLeague=LANG==='ru'&&league.toLowerCase()==='austria junior'?'Юниорский хоккей Австрии':league;
  const context=[displayCountry?`${T.countryPrefix}: ${displayCountry}`:'',displayLeague?`${LANG==='en'?'Target league':'Интересующая лига'}: ${displayLeague}`:''].filter(Boolean).join('\n');
  if(context&&message&&!message.value.trim())message.value=context;
  else if(note&&message&&!message.value.trim())message.value=note;
  const calcBand=params.get('calc_band')||'',calcScore=params.get('calc_score')||'',calcLeagues=(params.get('calc_leagues')||'').slice(0,300);
  const fromCalc=['top','mid','low'].includes(calcBand)&&/^\d{1,3}$/.test(calcScore);
  try{fromCalc?sessionStorage.setItem('eha-from-calc','1'):sessionStorage.removeItem('eha-from-calc')}catch(error){}
  if(fromCalc){[['calcBand',calcBand],['calcScore',calcScore],['calcLeagues',calcLeagues]].forEach(([name,value])=>{const input=q(`[name="${name}"]`,form);if(input)input.value=value});
    const position=q('[name="position"]',form),pos=params.get('pos'),year=params.get('year');
    if(position&&!position.value&&['forward','defense','goalie'].includes(pos))position.value=pos;
    if(!birth.value&&/^\d{4}$/.test(year||'')&&year>=birth.min&&year<=birth.max){birth.value=year;updateApplicant()}}
  const funnelContext=()=>({from_calculator:fromCalc,applicant_type:applicantType(),player_minor:isMinor(),intent:intentInput?.value||'',entry_page:location.pathname});
  let formStarted=false;form.addEventListener('focusin',()=>{if(formStarted)return;formStarted=true;track('form_start',funnelContext())});
  const clearErrors=()=>{qa('.field-error',form).forEach(el=>el.textContent='');qa('[aria-invalid="true"]',form).forEach(el=>el.removeAttribute('aria-invalid'));status.textContent='';status.className='form-status'};
  const showErrors=(errors={})=>{Object.entries(errors).forEach(([name,message])=>{const output=q(`[data-error-for="${name}"]`,form),input=q(`[name="${name}"]`,form);if(output)output.textContent=message;if(input)input.setAttribute('aria-invalid','true')});const first=q('[aria-invalid="true"]',form);const more=first&&first.closest('details');if(more)more.open=true;first?.focus()};
  // A field with a wrong value inside the closed optional block cannot be focused by the browser: open the block first.
  form.addEventListener('invalid',event=>{const more=event.target.closest&&event.target.closest('details');if(more)more.open=true},true);
  form.addEventListener('submit',async event=>{
    event.preventDefault();clearErrors();button.disabled=true;button.textContent=T.submitting;status.textContent=T.saving;
    // Consent may have been accepted after form initialisation.
    [['landingPage',attribution.landingPage],['initialReferrerHost',attribution.referrerHost]].forEach(([name,value])=>{if(!value)return;let input=q(`[name="${name}"]`,form);if(!input){input=document.createElement('input');input.type='hidden';input.name=name;form.append(input)}input.value=value});
    Object.entries(utm).forEach(([key,name])=>{const input=q(`[name="${name}"]`,form);if(input&&!input.value)input.value=attribution[key]||''});

    try{
      const response=await fetch(form.action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}}),data=await response.json().catch(()=>({}));
      if(!response.ok){showErrors(data.errors);status.textContent=data.message||T.checkForm;status.classList.add('error');if(window.turnstile)turnstile.reset();return}
      const localePrefix=location.pathname.startsWith('/ru/')||location.pathname==='/ru'?'/ru':location.pathname.startsWith('/en/')||location.pathname==='/en'?'/en':'';
      if(!data.ok||!/^EHA-\d{6}-[A-F0-9]{6}$/.test(data.reference||''))throw new Error('unconfirmed_submission');form.dispatchEvent(new CustomEvent('eha:submitted',{detail:{reference:data.reference,ownerToken:data.ownerToken||null,feedback:data.feedback||null,duplicate:Boolean(data.duplicate)}}));
      try{sessionStorage.setItem('eha-last-funnel',JSON.stringify(funnelContext()))}catch(error){}
      try{sessionStorage.removeItem('eha-application-draft')}catch(error){}
      if(window.turnstile)turnstile.reset();location.assign(`${localePrefix}/application-success?ref=${encodeURIComponent(data.reference)}`);
    }catch(error){status.textContent=T.unconfirmed;status.classList.add('error');if(window.turnstile)turnstile.reset()}
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

// Conversion funnel events (page view -> calculator_start -> calculator_done ->
// form_start -> application_sent). Sent to Yandex Metrika (JS-event goals) and
// GA4 (events). Both stay consent-gated: Metrika is only initialised after the
// visitor accepts cookies, and GA4 runs in Consent Mode.
const track=(name,params={})=>{try{if(typeof ym==='function')ym(110889446,'reachGoal',name,params);if(typeof gtag==='function')gtag('event',name,params)}catch(error){}};
window.ehaTrack=track;
// WhatsApp clicks (floating button and any wa.me link). Only the page path is sent, never the number or message text.
document.addEventListener('click',event=>{const link=event.target.closest&&event.target.closest('a[href*="wa.me/"]');if(link)track('whatsapp_click',{entry_page:location.pathname,placement:link.classList.contains('whatsapp-float')?'float':'inline'})});
const isParentHub=location.pathname.endsWith('/junior-hockey-for-parents')||location.pathname.endsWith('/yuniorskij-hokkej-roditelyam');
if(isParentHub)track('parent_hub_view',{entry_page:location.pathname});
document.addEventListener('click',event=>{const link=event.target.closest('a[href*="/contact?"]');if(!link)return;let url;try{url=new URL(link.href,location.href)}catch(error){return}const type=url.searchParams.get('type'),intent=url.searchParams.get('intent')||'';if(type==='parent'||type==='parent_guardian')track('parent_cta_click',{entry_page:location.pathname,intent,destination:url.pathname})});

// Turnstile tokens are single-use and expire after a few minutes. When the
// browser restores a submitted form from the back/forward cache, the widget
// still holds the token that was already redeemed, so the next submit is
// rejected with timeout-or-duplicate. Issue a fresh challenge on restore.
addEventListener('pageshow',event=>{if(event.persisted&&window.turnstile&&q('.cf-turnstile'))turnstile.reset()});

const reference=q('[data-application-reference]');
if(reference){const value=new URLSearchParams(location.search).get('ref')||'';if(/^EHA-\d{6}-[A-F0-9]{6}$/.test(value)){reference.textContent=value;try{const key=`eha-sent-${value}`;if(!sessionStorage.getItem(key)){sessionStorage.setItem(key,'1');let context={from_calculator:sessionStorage.getItem('eha-from-calc')==='1'};try{context={...context,...JSON.parse(sessionStorage.getItem('eha-last-funnel')||'{}')}}catch(error){}track('application_sent',context);sessionStorage.removeItem('eha-last-funnel')}}catch(error){track('application_sent')}const link=q('[data-success-whatsapp]');if(link)link.href=`https://wa.me/375297957818?text=${encodeURIComponent(T.waGreeting(value))}`}else reference.textContent=T.notFound}

// Copy buttons for free templates (guides): copies the <pre> named in data-copy
// and announces the result in its role=status element.
document.querySelectorAll('[data-copy]').forEach(btn=>{btn.addEventListener('click',async()=>{const el=document.getElementById(btn.dataset.copy);if(!el)return;const text=el.innerText;let ok=false;try{await navigator.clipboard.writeText(text);ok=true}catch(e){try{const r=document.createRange();r.selectNodeContents(el);const sel=getSelection();sel.removeAllRanges();sel.addRange(r);ok=document.execCommand('copy');sel.removeAllRanges()}catch(_){}}const st=document.getElementById(btn.dataset.copy+'-status');if(st){st.textContent='';setTimeout(()=>{st.textContent=ok?btn.dataset.ok:btn.dataset.fail},30)}if(ok&&window.ehaTrack)window.ehaTrack('template_copy',{template:btn.dataset.copy})})});
// Download buttons for the same templates: saves the <pre> as a UTF-8 text file (works offline, no form or sign-up). Hidden without JavaScript, the text stays copyable.
document.querySelectorAll('[data-download]').forEach(btn=>{btn.hidden=false;btn.addEventListener('click',()=>{const el=document.getElementById(btn.dataset.download);if(!el)return;const blob=new Blob(['\ufeff'+el.innerText.replace(/\n/g,'\r\n')],{type:'text/plain;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=btn.dataset.filename||'template.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);const st=document.getElementById(btn.dataset.download+'-status');if(st){st.textContent='';setTimeout(()=>{st.textContent=btn.dataset.ok||''},30)}if(window.ehaTrack)window.ehaTrack('template_download',{template:btn.dataset.download})})});
// Print buttons: prints only the target block (see .printing-one in styles.css).
document.querySelectorAll('[data-print]').forEach(btn=>{btn.hidden=false;btn.addEventListener('click',()=>{const el=document.getElementById(btn.dataset.print);if(!el)return;el.classList.add('print-target');document.body.classList.add('printing-one');const done=()=>{document.body.classList.remove('printing-one');el.classList.remove('print-target');window.removeEventListener('afterprint',done)};window.addEventListener('afterprint',done);window.print();setTimeout(done,1500);if(window.ehaTrack)window.ehaTrack('template_print',{template:btn.dataset.print})})});

// Free CV downloads: count clicks only (file type and language).
document.querySelectorAll('[data-cv-download]').forEach(a=>a.addEventListener('click',()=>{if(window.ehaTrack)window.ehaTrack('cv_download',{file:a.dataset.cvDownload})}));
