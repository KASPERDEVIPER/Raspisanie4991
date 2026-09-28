const daysOrder=["понедельник","вторник","среда","четверг","пятница","суббота"];
const pretty={понедельник:"Понедельник",вторник:"Вторник",среда:"Среда",четверг:"Четверг",пятница:"Пятница",суббота:"Суббота"};

// 28.09.2026 — ВЕРХНЯЯ неделя. Каждая следующая неделя переключается автоматически:
// верхняя → нижняя → верхняя → нижняя и так далее.
const upperAnchor=new Date(2026,8,28);

function getAutoWeek(){
  const now=new Date();
  const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const diff=Math.floor((today-upperAnchor)/86400000);
  const week=Math.floor(diff/7);
  return ((week%2+2)%2===0)?"upper":"lower";
}

function splitSubject(value){
  if(!value || value==="----") return {name:"Нет занятий",info:""};
  const parts=value.split(", ");
  const name=parts.shift();
  return {name,info:parts.join(", ")};
}
function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}

let selectedDay=(()=>{
  const n=new Date().getDay();
  return n===0?"понедельник":daysOrder[n-1] || "понедельник";
})();

let selectedWeek=getAutoWeek();

function render(){
  const week=selectedWeek;
  document.getElementById("weekName").textContent=week==="upper"?"Верхняя":"Нижняя";
  const now=new Date();
  document.getElementById("dateText").textContent=now.toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"});

  document.querySelectorAll("#daySelector button").forEach(btn=>{
    btn.classList.toggle("active",btn.dataset.day===selectedDay);
  });
  document.querySelectorAll("#weekSwitch button").forEach(btn=>{
    btn.classList.toggle("active",btn.dataset.week===selectedWeek);
  });

  const root=document.getElementById("schedule");
  root.innerHTML="";
  const slots=window.SCHEDULE[selectedDay]||[];
  const dayEl=document.createElement("section");
  dayEl.className="day";
  dayEl.innerHTML=`<div class="day-title"><h2>${pretty[selectedDay]}</h2><span>${slots.length} пар</span></div>`;

  slots.forEach(slot=>{
    const value=slot[week];
    const lesson=splitSubject(value);
    const hasLesson=!!value && value!=="----";
    const card=document.createElement("article");
    card.className="card";
    let out=`<div class="time">${escapeHtml(slot.time)}</div>`;
    if(hasLesson){
      out+=`<div class="lesson"><div class="tag ${week}">${week==="upper"?"Верхняя":"Нижняя"}</div><div class="lesson-name">${escapeHtml(lesson.name)}</div>${lesson.info?`<div class="lesson-info">${escapeHtml(lesson.info)}</div>`:""}</div>`;
    }else{
      out+=`<div class="lesson empty">Нет занятий</div>`;
    }
    card.innerHTML=out;
    dayEl.appendChild(card);
  });
  root.appendChild(dayEl);
}

document.querySelectorAll("#daySelector button").forEach(btn=>{
  btn.addEventListener("click",()=>{
    selectedDay=btn.dataset.day;
    render();
    window.scrollTo({top:0,behavior:"smooth"});
  });
});

document.querySelectorAll("#weekSwitch button").forEach(btn=>{
  btn.addEventListener("click",()=>{
    selectedWeek=btn.dataset.week;
    render();
    window.scrollTo({top:0,behavior:"smooth"});
  });
});

document.getElementById("refresh").onclick=()=>{render()};

if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("service-worker.js"));
render();

// If the page stays open, reload at the next Monday so the week changes automatically.
function scheduleWeekRefresh(){
  const now=new Date();
  const day=now.getDay();
  const daysUntilMonday=day===0?1:8-day;
  const nextMonday=new Date(now.getFullYear(),now.getMonth(),now.getDate()+daysUntilMonday,0,0,1);
  setTimeout(()=>location.reload(),Math.max(1000,nextMonday-now));
}
scheduleWeekRefresh();
