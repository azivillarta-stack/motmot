const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hero=document.querySelector('#home');
const experience=document.querySelector('#experience');
const chapterNav=document.querySelector('#chapter-nav');
const siteFooter=document.querySelector('#site-footer');
const openCardButton=document.querySelector('#open-card');

function enterExperience(){
  hero.classList.add('hero-exit');
  window.setTimeout(()=>{
    hero.hidden=true;
    experience.hidden=false;
    chapterNav.hidden=false;
    siteFooter.hidden=false;
    experience.classList.remove('experience-enter');
    void experience.offsetWidth;
    experience.classList.add('experience-enter');
    window.scrollTo({top:0,behavior:'auto'});
    history.replaceState(null,'','#memories');
    const firstCard=experience.querySelector('.gift-card');
    if(firstCard)window.setTimeout(()=>firstCard.focus({preventScroll:true}),reducedMotion?0:500);
  },reducedMotion?0:520);
}

function returnHome(event){
  if(event)event.preventDefault();
  if(surpriseDialog.open)closeSurprise();
  experience.hidden=true;
  chapterNav.hidden=true;
  siteFooter.hidden=true;
  hero.hidden=false;
  requestAnimationFrame(()=>hero.classList.remove('hero-exit'));
  window.scrollTo({top:0,behavior:'auto'});
  history.replaceState(null,'','#home');
  openCardButton.focus({preventScroll:true});
}

openCardButton.addEventListener('click',enterExperience);
document.querySelectorAll('[data-home]').forEach(link=>link.addEventListener('click',returnHome));
const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>reducedMotion?el.classList.add('visible'):revealObserver.observe(el));
document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{const target=document.querySelector(link.getAttribute('href'));if(!target)return;event.preventDefault();target.scrollIntoView({behavior:reducedMotion?'auto':'smooth',block:'start'})}));
const navLinks=[...document.querySelectorAll('.chapter-links a')];
const chapterObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;navLinks.forEach(link=>{const active=link.dataset.section===entry.target.id;link.classList.toggle('active',active);active?link.setAttribute('aria-current','true'):link.removeAttribute('aria-current')})}),{rootMargin:'-42% 0px -48% 0px'});
document.querySelectorAll('.chapter').forEach(chapter=>chapterObserver.observe(chapter));

const surpriseDialog=document.querySelector('#surprise-dialog');
const promptView=document.querySelector('#prompt-view');
const revealView=document.querySelector('#reveal-view');
const revealContent=document.querySelector('#reveal-content');
const revealButton=document.querySelector('#reveal-surprise');
let activeTemplate='';
let lastCard=null;

document.querySelectorAll('.gift-card').forEach(card=>card.addEventListener('click',()=>{
  activeTemplate=card.dataset.surprise;
  lastCard=card;
  promptView.hidden=false;
  revealView.hidden=true;
  revealView.classList.remove('boom');
  revealContent.replaceChildren();
  surpriseDialog.showModal();
  document.body.classList.add('modal-open');
  revealButton.focus();
}));

revealButton.addEventListener('click',()=>{
  const template=document.querySelector('#'+activeTemplate);
  if(!template)return;
  revealContent.replaceChildren(template.content.cloneNode(true));
  promptView.hidden=true;
  revealView.hidden=false;
  void revealView.offsetWidth;
  revealView.classList.add('boom');
  launchMagic();
  bindMemoryPhotos();
  bindVirtualDate();
  revealView.querySelector('.modal-close').focus();
});

function bindVirtualDate(){
  const invitation=revealContent.querySelector('.virtual-date');
  if(!invitation)return;
  const question=invitation.querySelector('.date-question-view');
  const planner=invitation.querySelector('.date-planner');
  const yesButton=invitation.querySelector('.date-yes');
  const noButton=invitation.querySelector('.date-no');
  const noReply=invitation.querySelector('.no-reply');
  const form=invitation.querySelector('.date-form');
  const confirmation=invitation.querySelector('.date-confirmation');
  const dateInput=form.elements.date;
  let noCount=0;
  const playfulReplies=['Are you sure, baby? The YES button is waiting for you.','Okay, you can still choose NO... but look how excited YES is!','No pressure, baby. I will keep asking sweetly.'];

  dateInput.min=new Date().toISOString().split('T')[0];
  noButton.addEventListener('click',()=>{
    noCount+=1;
    yesButton.style.setProperty('--yes-scale',String(Math.min(1+noCount*.1,1.45)));
    noReply.textContent=playfulReplies[Math.min(noCount-1,playfulReplies.length-1)];
  });

  yesButton.addEventListener('click',()=>{
    question.hidden=true;
    planner.hidden=false;
    launchMagic();
    planner.scrollIntoView({behavior:reducedMotion?'auto':'smooth',block:'start'});
    planner.querySelector('input[name="activity"]').focus({preventScroll:true});
  });

  form.addEventListener('submit',event=>{
    event.preventDefault();
    if(!form.reportValidity())return;
    const data=new FormData(form);
    const chosenDate=new Date(`${data.get('date')}T00:00:00`);
    const readableDate=chosenDate.toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'});
    const readableTime=new Date(`2000-01-01T${data.get('time')}`).toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'});
    confirmation.innerHTML=`<h3>Our virtual date plan &#9825;</h3><p><strong>Activity:</strong> ${escapeHtml(data.get('activity'))}</p><p><strong>Date:</strong> ${escapeHtml(readableDate)}</p><p><strong>Time:</strong> ${escapeHtml(readableTime)}</p><p>Screenshot this card and send it to me, baby. I can't wait for our time together.</p>`;
    form.hidden=true;
    confirmation.hidden=false;
    launchMagic();
    confirmation.focus?.();
  });
}

function escapeHtml(value){
  const element=document.createElement('span');
  element.textContent=String(value);
  return element.innerHTML;
}

function closeSurprise(){
  surpriseDialog.close();
  document.body.classList.remove('modal-open');
  const video=revealContent.querySelector('video');
  if(video)video.pause();
  revealContent.replaceChildren();
  if(lastCard)lastCard.focus();
}
document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',closeSurprise));
surpriseDialog.addEventListener('cancel',event=>{event.preventDefault();closeSurprise()});
surpriseDialog.addEventListener('click',event=>{if(event.target===surpriseDialog)closeSurprise()});

function launchMagic(){
  if(reducedMotion)return;
  const layer=document.querySelector('#magic-layer');
  for(let i=0;i<28;i++){
    const sparkle=document.createElement('i');
    sparkle.textContent=i%3===0?'✦':'♡';
    sparkle.style.setProperty('--x',`${(Math.random()-.5)*92}vw`);
    sparkle.style.setProperty('--y',`${(Math.random()-.5)*92}vh`);
    sparkle.style.setProperty('--r',`${Math.random()*360}deg`);
    layer.append(sparkle);
    window.setTimeout(()=>sparkle.remove(),1800);
  }
}

const lightbox=document.querySelector('#lightbox');
const lightboxImage=document.querySelector('#lightbox-image');
const lightboxCaption=document.querySelector('#lightbox-caption');
const previousPhoto=document.querySelector('#previous-photo');
const nextPhoto=document.querySelector('#next-photo');
let memoryPhotos=[];
let currentPhotoIndex=0;

function showLightboxPhoto(index){
  if(!memoryPhotos.length)return;
  currentPhotoIndex=(index+memoryPhotos.length)%memoryPhotos.length;
  const photo=memoryPhotos[currentPhotoIndex];
  const image=photo.querySelector('img');
  lightboxImage.animate([{opacity:.25,transform:'scale(.985)'},{opacity:1,transform:'scale(1)'}],{duration:reducedMotion?0:260,easing:'ease-out'});
  lightboxImage.src=image.src;
  lightboxImage.alt=image.alt;
  lightboxCaption.textContent=photo.dataset.caption;
}

function bindMemoryPhotos(){
  memoryPhotos=[...revealContent.querySelectorAll('.memory-photo')];
  memoryPhotos.forEach((photo,index)=>photo.addEventListener('click',()=>{
    showLightboxPhoto(index);
    lightbox.showModal();
  }));
}
previousPhoto.addEventListener('click',()=>showLightboxPhoto(currentPhotoIndex-1));
nextPhoto.addEventListener('click',()=>showLightboxPhoto(currentPhotoIndex+1));
document.querySelector('#close-lightbox').addEventListener('click',()=>lightbox.close());
lightbox.addEventListener('click',event=>{if(event.target===lightbox)lightbox.close()});
document.addEventListener('keydown',event=>{
  if(!lightbox.open)return;
  if(event.key==='ArrowLeft')showLightboxPhoto(currentPhotoIndex-1);
  if(event.key==='ArrowRight')showLightboxPhoto(currentPhotoIndex+1);
});

const music=document.querySelector('#music');
const soundButton=document.querySelector('#sound-button');
function showMusicPlaying(){
  soundButton.textContent='Ⅱ';
  soundButton.classList.add('playing');
  soundButton.setAttribute('aria-label','Pause background music');
  soundButton.setAttribute('aria-pressed','true');
}
function showMusicPaused(){
  soundButton.textContent='♪';
  soundButton.classList.remove('playing');
  soundButton.setAttribute('aria-label','Play background music');
  soundButton.setAttribute('aria-pressed','false');
}
async function playMusicFromPageClick(event){
  if(event.target.closest('#sound-button')||!music.paused)return;
  try{await music.play();showMusicPlaying()}catch{showMusicPaused()}
}
document.addEventListener('click',playMusicFromPageClick);
soundButton.addEventListener('click',async()=>{
  if(music.paused){
    try{await music.play();showMusicPlaying()}catch{showMusicPaused()}
  }else{music.pause();showMusicPaused()}
});
