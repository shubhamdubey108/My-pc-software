
const K='inst_manager_v1';
const D={session:{loggedIn:false,darkMode:false},settings:{instituteName:'My Computer Institute',instituteContact:'+91 90000 00000',adminUser:'admin',adminPass:'admin123',pinLock:''},counters:{student:1,course:1,batch:1,payment:1},courses:[{id:'COURSE-1',name:'DCA',duration:'6 Months',fees:6000,description:'Diploma in Computer Applications'},{id:'COURSE-2',name:'Tally',duration:'3 Months',fees:4500,description:'Tally with GST'}],batches:[{id:'BATCH-1',name:'Morning Batch',time:'08:00'},{id:'BATCH-2',name:'Afternoon Batch',time:'14:00'},{id:'BATCH-3',name:'Evening Batch',time:'17:00'}],students:[],payments:[],attendance:[]};
let s=load();let view='dashboard';let editStu=null;
const T=[['dashboard','Dashboard'],['students','Students'],['fees','Fees'],['attendance','Attendance'],['batches','Batches'],['courses','Courses'],['reports','Reports'],['certificates','Certificates'],['settings','Settings']];
init();
function init(){bind();tabs();theme();gate();}
function load(){const r=localStorage.getItem(K);if(!r)return structuredClone(D);try{return m(JSON.parse(r));}catch{return structuredClone(D)}}
function m(x){return{...structuredClone(D),...x,session:{...D.session,...(x.session||{})},settings:{...D.settings,...(x.settings||{})},counters:{...D.counters,...(x.counters||{})},courses:x.courses||D.courses,batches:x.batches||D.batches,students:x.students||[],payments:x.payments||[],attendance:x.attendance||[]}}
function save(){localStorage.setItem(K,JSON.stringify(s));}
function bind(){document.getElementById('loginForm').addEventListener('submit',login);document.getElementById('logoutBtn').addEventListener('click',()=>{s.session.loggedIn=false;save();gate();});document.getElementById('darkToggle').addEventListener('click',()=>{s.session.darkMode=!s.session.darkMode;save();theme();});}
function theme(){document.body.classList.toggle('dark',!!s.session.darkMode)}
function gate(){const i=s.session.loggedIn;document.getElementById('loginPage').classList.toggle('hidden',i);document.getElementById('mainPage').classList.toggle('hidden',!i);if(i){document.getElementById('instituteTitle').textContent=s.settings.instituteName;document.getElementById('todayLine').textContent=new Date().toLocaleDateString();render();}}
function login(e){e.preventDefault();const u=username.value.trim(),p=password.value.trim();if(u===s.settings.adminUser&&p===s.settings.adminPass){s.session.loggedIn=true;save();gate();return;}alert('Invalid credentials.');}
function tabs(){const h=document.getElementById('tabs');h.innerHTML=T.map(([id,l])=>`<button class="tab-btn ${id===view?'active':''}" data-v="${id}">${l}</button>`).join('');h.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{view=b.dataset.v;tabs();render();}));}
function render(){T.forEach(([id])=>document.getElementById(`view-${id}`).classList.toggle('hidden',id!==view));dash();students();fees();attendance();batches();courses();reports();certs();settings();}
function paid(id){return s.payments.filter(p=>p.studentId===id).reduce((a,p)=>a+Number(p.amount||0),0)}
function pending(st){return Math.max(0,Number(st.totalFees||0)-paid(st.id))}
function ddate(st){const i=Number(st.installments||1);if(i<=1)return st.admissionDate||'';const done=s.payments.filter(p=>p.studentId===st.id).length;const d=new Date(st.admissionDate||Date.now());d.setMonth(d.getMonth()+Math.min(done,i-1));return d.toISOString().slice(0,10)}
function cOpts(raw=false){return s.courses.map(c=>`<option value="${c.id}">${raw?c.name:`${c.name} (Rs ${c.fees})`}</option>`).join('')}
function bOpts(raw=false){return s.batches.map(b=>`<option value="${b.id}">${raw?b.name:`${b.name} (${b.time})`}</option>`).join('')}
function stOpts(){return s.students.map(st=>`<option value="${st.id}">${st.name} (${st.id})</option>`).join('')}
function esc(t){return String(t||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;')}
function dash(){const e=document.getElementById('view-dashboard');const t=s.students.length,a=s.students.filter(x=>x.status==='active').length,today=new Date().toISOString().slice(0,10),att=s.attendance.filter(x=>x.date===today&&x.status==='present').length,pf=s.students.reduce((z,x)=>z+pending(x),0),mk=new Date().toISOString().slice(0,7),me=s.payments.filter(p=>p.date.startsWith(mk)).reduce((z,p)=>z+Number(p.amount),0),r=[...s.payments].sort((x,y)=>y.date.localeCompare(x.date)).slice(0,5);e.innerHTML=`<div class='grid'><div class='card'><div class='muted'>Total Students</div><div class='kpi'>${t}</div></div><div class='card'><div class='muted'>Active Students</div><div class='kpi'>${a}</div></div><div class='card'><div class='muted'>Today's Attendance</div><div class='kpi'>${att}</div></div><div class='card'><div class='muted'>Pending Fees</div><div class='kpi'>Rs ${pf}</div></div><div class='card'><div class='muted'>Monthly Earnings</div><div class='kpi'>Rs ${me}</div></div></div><div class='grid' style='margin-top:10px;'><div class='card'><h3>Recent Payments</h3>${r.length?r.map(p=>{const st=s.students.find(x=>x.id===p.studentId);return `<div>${p.date} - ${st?st.name:'Unknown'}: Rs ${p.amount}</div>`}).join(''):`<p class='muted'>No payments yet.</p>`}</div><div class='card'><h3>Pending / Overdue</h3>${pendingHTML(true)}</div></div><div class='grid' style='margin-top:10px;'><div class='card'><h3>Monthly Income</h3><canvas id='incomeChart' height='200'></canvas></div><div class='card'><h3>Course Distribution</h3><canvas id='courseChart' height='200'></canvas></div></div>`;income();courseChart();}

function students(){const e=document.getElementById('view-students');e.innerHTML=`<div class='panel'><h3>${editStu?'Edit Student':'Add New Student'}</h3><form id='stuForm' class='grid'><input name='name' placeholder='Student Name' required/><input name='photo' placeholder='Student Photo URL'/><input name='guardian' placeholder='Father/Guardian Name' required/><input name='phone' placeholder='Phone Number' required/><input name='altPhone' placeholder='Alternate Phone'/><input name='address' placeholder='Address'/><input name='email' type='email' placeholder='Email (optional)'/><input name='dob' type='date'/><input name='admissionDate' type='date' required/><select name='courseId'>${cOpts()}</select><input name='courseDuration' placeholder='Course Duration'/><input name='totalFees' type='number' placeholder='Total Fees' required/><input name='installments' type='number' min='1' value='1' placeholder='Installments' required/><select name='batchId'>${bOpts()}</select><select name='status'><option value='active'>Active</option><option value='completed'>Completed</option></select><input name='notes' placeholder='Notes'/><button class='btn primary' type='submit'>${editStu?'Update Student':'Save Student'}</button></form></div><div class='panel' style='margin-top:10px;'><div class='row'><input id='ss' placeholder='Search student'/><select id='fc'><option value=''>All Courses</option>${cOpts(true)}</select><select id='fb'><option value=''>All Batches</option>${bOpts(true)}</select><select id='fs'><option value=''>All Status</option><option value='active'>Active</option><option value='completed'>Completed</option></select></div><div class='table-wrap' style='margin-top:10px;'><table><thead><tr><th>ID</th><th>Student</th><th>Course</th><th>Batch</th><th>Total</th><th>Paid</th><th>Pending</th><th>Status</th><th>Actions</th></tr></thead><tbody id='stuRows'></tbody></table></div></div>`;
const f=document.getElementById('stuForm');if(editStu){const st=s.students.find(x=>x.id===editStu);if(st)[...f.elements].forEach(x=>{if(x.name&&st[x.name]!==undefined)x.value=st[x.name];});}
f.addEventListener('submit',ev=>{ev.preventDefault();const p=Object.fromEntries(new FormData(f).entries());p.totalFees=Number(p.totalFees||0);p.installments=Number(p.installments||1);if(editStu){const i=s.students.findIndex(x=>x.id===editStu);s.students[i]={...s.students[i],...p};editStu=null;}else{s.students.push({id:`STU-${String(s.counters.student++).padStart(4,'0')}`,...p});}save();render();});['ss','fc','fb','fs'].forEach(id=>{document.getElementById(id).addEventListener('input',rows);document.getElementById(id).addEventListener('change',rows);});rows();}
function rows(){const q=(document.getElementById('ss')?.value||'').toLowerCase(),c=document.getElementById('fc')?.value||'',b=document.getElementById('fb')?.value||'',st=document.getElementById('fs')?.value||'';const r=s.students.filter(x=>(!q||x.name.toLowerCase().includes(q)||x.id.toLowerCase().includes(q)||(x.phone||'').includes(q))&&(!c||x.courseId===c)&&(!b||x.batchId===b)&&(!st||x.status===st));document.getElementById('stuRows').innerHTML=r.map(x=>{const co=s.courses.find(z=>z.id===x.courseId)?.name||'-',ba=s.batches.find(z=>z.id===x.batchId)?.name||'-',pa=paid(x.id),pe=pending(x),cl=x.status==='completed'?'green':'orange';return `<tr><td>${x.id}</td><td>${x.name}<br/><small>${x.phone||''}</small></td><td>${co}</td><td>${ba}</td><td>${x.totalFees}</td><td>${pa}</td><td>${pe}</td><td><span class='badge ${cl}'>${x.status}</span></td><td><button class='btn' onclick="editStudent('${x.id}')">Edit</button><button class='btn danger' onclick="deleteStudent('${x.id}')">Delete</button></td></tr>`}).join('')||"<tr><td colspan='9'>No students found.</td></tr>"}
window.editStudent=id=>{editStu=id;render();};
window.deleteStudent=id=>{if(!confirm('Delete this student?'))return;s.students=s.students.filter(x=>x.id!==id);s.payments=s.payments.filter(x=>x.studentId!==id);s.attendance=s.attendance.filter(x=>x.studentId!==id);save();render();};

function fees(){const e=document.getElementById('view-fees');e.innerHTML=`<div class='grid'><div class='panel'><h3>Fee Collection</h3><form id='payForm' class='stack'><select name='studentId' required><option value=''>Select Student</option>${stOpts()}</select><input name='amount' type='number' placeholder='Payment Amount' required/><input name='date' type='date' value='${new Date().toISOString().slice(0,10)}' required/><select name='method'><option>Cash</option><option>UPI</option><option>Bank transfer</option></select><button class='btn primary' type='submit'>Mark as Paid + Receipt</button></form></div><div class='panel'><h3>Pending & Overdue</h3><div>${pendingHTML(false)}</div></div></div><div class='panel' style='margin-top:10px;'><h3>Payment History</h3><div class='table-wrap'><table><thead><tr><th>Date</th><th>Student</th><th>Amount</th><th>Method</th></tr></thead><tbody>${[...s.payments].sort((x,y)=>y.date.localeCompare(x.date)).map(p=>{const st=s.students.find(z=>z.id===p.studentId);return `<tr><td>${p.date}</td><td>${st?st.name:'-'}</td><td>${p.amount}</td><td>${p.method}</td></tr>`}).join('')||"<tr><td colspan='4'>No payments yet.</td></tr>"}</tbody></table></div></div>`;
document.getElementById('payForm').addEventListener('submit',ev=>{ev.preventDefault();const p=Object.fromEntries(new FormData(ev.target).entries());p.id=`PAY-${String(s.counters.payment++).padStart(5,'0')}`;p.amount=Number(p.amount||0);s.payments.push(p);save();receipt(p);render();});}
function pendingHTML(rem){const t=new Date().toISOString().slice(0,10);const r=s.students.map(st=>{const p=pending(st),d=ddate(st),o=p>0&&d<t;return {st,p,d,o};}).filter(x=>x.p>0).sort((a,b)=>(a.o===b.o?b.p-a.p:a.o?-1:1));if(!r.length)return "<p class='muted'>No pending fees.</p>";return r.map(x=>{const msg=`Reminder: Your course installment of Rs ${Math.ceil(x.p/Math.max(1,Number(x.st.installments||1)))} is due.`;const wa=`https://wa.me/91${(x.st.phone||'').replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`;return `<div class='card' style='margin-bottom:8px;${x.o?'border-color:#b42318;':''}'><b>${x.st.name}</b> (${x.st.id})<br/>Pending: Rs ${x.p} | Due: ${x.d} ${x.o?"<span class='badge red'>Overdue</span>":''}${rem?`<div class='row' style='margin-top:6px;'><a href='${wa}' target='_blank' class='btn'>WhatsApp</a><button class='btn' onclick="copyReminder('${x.st.id}')">Copy SMS</button></div>`:''}</div>`;}).join('')}
window.copyReminder=id=>{const st=s.students.find(x=>x.id===id);if(!st)return;const p=pending(st);const msg=`Reminder: Your course installment of Rs ${Math.ceil(p/Math.max(1,Number(st.installments||1)))} is due.`;navigator.clipboard.writeText(msg);alert('Reminder copied.');};
function receipt(p){const st=s.students.find(x=>x.id===p.studentId);if(!st)return;const w=window.open('','_blank');w.document.write(`<html><body><h2>${s.settings.instituteName} - Fee Receipt</h2><p>Receipt ID: ${p.id}</p><p>Student: ${st.name} (${st.id})</p><p>Date: ${p.date}</p><p>Amount: Rs ${p.amount}</p><p>Method: ${p.method}</p><p>Contact: ${s.settings.instituteContact}</p><button onclick='window.print()'>Print / Save as PDF</button></body></html>`);w.document.close();}
function attendance(){const e=document.getElementById('view-attendance');e.innerHTML=`<div class='panel'><h3>Mark Daily Attendance</h3><div class='row'><select id='ab'><option value=''>All Batches</option>${bOpts(true)}</select><input id='ad' type='date' value='${new Date().toISOString().slice(0,10)}'/><button id='sa' class='btn primary'>Save Attendance</button></div><div id='al' class='grid' style='margin-top:10px;'></div></div><div class='panel' style='margin-top:10px;'><h3>Attendance Report (Monthly)</h3><input id='am' type='month' value='${new Date().toISOString().slice(0,7)}'/><button id='lar' class='btn'>Load Report</button><div id='ar' style='margin-top:10px;'></div></div>`;
const draw=()=>{const d=ad.value,b=ab.value,list=s.students.filter(x=>!b||x.batchId===b);al.innerHTML=list.map(st=>{const ex=s.attendance.find(a=>a.date===d&&a.studentId===st.id)?.status||'present';return `<div class='card'><b>${st.name}</b><br/><small>${st.id}</small><select data-stu='${st.id}' class='as'><option value='present' ${ex==='present'?'selected':''}>Present</option><option value='absent' ${ex==='absent'?'selected':''}>Absent</option></select></div>`}).join('')||'<p>No students in this batch.</p>';};
ab.addEventListener('change',draw);ad.addEventListener('change',draw);sa.addEventListener('click',()=>{const d=ad.value;document.querySelectorAll('.as').forEach(sel=>{const sid=sel.getAttribute('data-stu');const i=s.attendance.findIndex(a=>a.date===d&&a.studentId===sid);const p={date:d,studentId:sid,status:sel.value};if(i>=0)s.attendance[i]=p;else s.attendance.push(p);});save();alert('Attendance saved.');render();});lar.addEventListener('click',()=>{const m=am.value;ar.innerHTML=s.students.map(st=>{const en=s.attendance.filter(a=>a.studentId===st.id&&a.date.startsWith(m));if(!en.length)return `<div>${st.name}: 0%</div>`;const pr=en.filter(a=>a.status==='present').length,p=Math.round((pr/en.length)*100);return `<div>${st.name}: ${p}% (${pr}/${en.length})</div>`;}).join('')||'No data';});draw();}

function batches(){const e=document.getElementById('view-batches');e.innerHTML=`<div class='panel'><h3>Create Batch</h3><form id='bf' class='grid'><input name='name' placeholder='Batch Name' required/><input name='time' type='time' required/><button class='btn primary' type='submit'>Save Batch</button></form></div><div class='panel' style='margin-top:10px;'><h3>Batch List</h3>${s.batches.map(b=>`<div class='card' style='margin-bottom:8px;'><b>${b.name}</b> (${b.time}) - Students: ${s.students.filter(x=>x.batchId===b.id).length}</div>`).join('')}</div>`;bf.addEventListener('submit',ev=>{ev.preventDefault();const p=Object.fromEntries(new FormData(bf).entries());p.id=`BATCH-${String(s.counters.batch++).padStart(3,'0')}`;s.batches.push(p);save();render();});}
function courses(){const e=document.getElementById('view-courses');e.innerHTML=`<div class='panel'><h3>Create Course</h3><form id='cf' class='grid'><input name='name' placeholder='Course Name' required/><input name='duration' placeholder='Duration' required/><input name='fees' type='number' placeholder='Fees' required/><input name='description' placeholder='Description'/><button class='btn primary' type='submit'>Save Course</button></form></div><div class='panel' style='margin-top:10px;'><h3>Course List</h3>${s.courses.map(c=>`<div class='card' style='margin-bottom:8px;'><b>${c.name}</b> - ${c.duration} - Rs ${c.fees}<br/><small>${c.description||''}</small></div>`).join('')}</div>`;cf.addEventListener('submit',ev=>{ev.preventDefault();const p=Object.fromEntries(new FormData(cf).entries());p.id=`COURSE-${String(s.counters.course++).padStart(3,'0')}`;p.fees=Number(p.fees||0);s.courses.push(p);save();render();});}
function reports(){const e=document.getElementById('view-reports');e.innerHTML=`<div class='panel'><h3>Reports & Analytics</h3><div class='row'><button class='btn' id='es'>Export Students (Excel/CSV)</button><button class='btn' id='epf'>Export Pending Fees</button><button class='btn' id='eph'>Export Payment History</button><button class='btn' id='pr'>Print Report (PDF)</button></div><div class='grid' style='margin-top:10px;'><div class='card'><b>Total Earnings</b><div>Rs ${s.payments.reduce((a,p)=>a+Number(p.amount),0)}</div></div><div class='card'><b>Pending Fees</b><div>Rs ${s.students.reduce((a,st)=>a+pending(st),0)}</div></div><div class='card'><b>Course Wise Students</b><div>${s.courses.map(c=>`${c.name}: ${s.students.filter(st=>st.courseId===c.id).length}`).join('<br/>')}</div></div></div></div>`;
es.addEventListener('click',()=>csv('students.csv',['id','name','phone','courseId','batchId','totalFees','status'],s.students));epf.addEventListener('click',()=>csv('pending-fees.csv',['id','name','pending','dueDate'],s.students.map(st=>({id:st.id,name:st.name,pending:pending(st),dueDate:ddate(st)})).filter(x=>x.pending>0)));eph.addEventListener('click',()=>csv('payments.csv',['id','studentId','amount','date','method'],s.payments));pr.addEventListener('click',()=>window.print());}
function certs(){const e=document.getElementById('view-certificates'),c=s.students.filter(x=>x.status==='completed');e.innerHTML=`<div class='panel'><h3>Certificate Generator</h3><div class='row'><select id='cs'><option value=''>Select Completed Student</option>${c.map(st=>`<option value='${st.id}'>${st.name}</option>`).join('')}</select><input id='cd' type='date' value='${new Date().toISOString().slice(0,10)}'/><button id='gc' class='btn primary'>Generate Certificate (PDF/Print)</button></div></div><div class='panel' style='margin-top:10px;'><h3>ID Card Generator</h3><div class='row'><select id='ids'><option value=''>Select Student</option>${stOpts()}</select><button id='gid' class='btn'>Generate ID Card (PDF/Print)</button></div></div>`;
gc.addEventListener('click',()=>{const id=cs.value,d=cd.value,st=s.students.find(x=>x.id===id);if(!st)return alert('Select student.');const co=s.courses.find(x=>x.id===st.courseId)?.name||st.courseId,w=window.open('','_blank');w.document.write(`<html><body style='font-family:Georgia;text-align:center;padding:24px;'><h1>Course Completion Certificate</h1><p>This is to certify that</p><h2>${st.name}</h2><p>has successfully completed</p><h3>${co}</h3><p>on ${d}</p><br/><p>${s.settings.instituteName}</p><p>Authorized Signature</p><button onclick='window.print()'>Print / Save PDF</button></body></html>`);w.document.close();});
gid.addEventListener('click',()=>{const id=ids.value,st=s.students.find(x=>x.id===id);if(!st)return alert('Select student.');const co=s.courses.find(x=>x.id===st.courseId)?.name||'-',ba=s.batches.find(x=>x.id===st.batchId)?.name||'-',w=window.open('','_blank');w.document.write(`<html><body><div style='max-width:340px;border:2px solid #000;padding:12px;border-radius:8px;font-family:sans-serif;'><h3>${s.settings.instituteName}</h3>${st.photo?`<img src='${st.photo}' style='width:80px;height:80px;object-fit:cover;border-radius:50%;'/>`:''}<p><b>${st.name}</b></p><p>ID: ${st.id}</p><p>Course: ${co}</p><p>Batch: ${ba}</p><p>Contact: ${s.settings.instituteContact}</p><button onclick='window.print()'>Print / Save PDF</button></div></body></html>`);w.document.close();});}
function settings(){const e=document.getElementById('view-settings');e.innerHTML=`<div class='panel'><h3>Admin & Security</h3><form id='sf' class='grid'><input name='instituteName' value='${esc(s.settings.instituteName)}' placeholder='Institute Name'/><input name='instituteContact' value='${esc(s.settings.instituteContact)}' placeholder='Contact'/><input name='adminUser' value='${esc(s.settings.adminUser)}' placeholder='Admin Username'/><input name='adminPass' value='${esc(s.settings.adminPass)}' placeholder='Admin Password'/><input name='pinLock' value='${esc(s.settings.pinLock||'')}' placeholder='PIN lock (optional)'/><button class='btn primary' type='submit'>Save Settings</button></form><div class='row' style='margin-top:10px;'><button id='bb' class='btn'>Backup Data</button><label class='btn' for='rf'>Restore Data</label><input id='rf' type='file' accept='application/json' class='hidden'/></div></div>`;
sf.addEventListener('submit',ev=>{ev.preventDefault();s.settings={...s.settings,...Object.fromEntries(new FormData(sf).entries())};save();render();alert('Settings saved.');});bb.addEventListener('click',()=>{const blob=new Blob([JSON.stringify(s,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='institute-backup.json';a.click();URL.revokeObjectURL(url);});rf.addEventListener('change',ev=>{const f=ev.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{s=m(JSON.parse(r.result));save();render();alert('Data restored.');}catch{alert('Invalid backup file.');}};r.readAsText(f);});}
function income(){const c=document.getElementById('incomeChart');if(!c)return;const x=c.getContext('2d'),n=new Date(),m6=Array.from({length:6}).map((_,i)=>{const d=new Date(n.getFullYear(),n.getMonth()-(5-i),1);return d.toISOString().slice(0,7)}),v=m6.map(mo=>s.payments.filter(p=>p.date.startsWith(mo)).reduce((a,p)=>a+Number(p.amount),0));bars(x,c,m6.map(mo=>mo.slice(5)),v,'#0f7a6c');}
function courseChart(){const c=document.getElementById('courseChart');if(!c)return;const x=c.getContext('2d'),l=s.courses.map(co=>co.name),v=s.courses.map(co=>s.students.filter(st=>st.courseId===co.id).length);bars(x,c,l,v,'#b54708');}
function bars(x,c,l,v,col){x.clearRect(0,0,c.width,c.height);const w=c.width,h=c.height,max=Math.max(1,...v),g=w/(v.length*1.5+1);v.forEach((n,i)=>{const xx=g+i*g*1.5,bh=(n/max)*(h-40);x.fillStyle=col;x.fillRect(xx,h-bh-20,g,bh);x.fillStyle='#666';x.font='10px sans-serif';x.fillText(l[i]||'',xx,h-6);x.fillText(String(n),xx,h-bh-24);});}
function csv(fn,f,rows){const h=f.join(','),b=rows.map(r=>f.map(k=>`"${String(r[k]??'').replaceAll('"','""')}"`).join(',')).join('\n');const blob=new Blob([`${h}\n${b}`],{type:'text/csv;charset=utf-8;'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=fn;a.click();URL.revokeObjectURL(url);}

// --- Upgraded modules (overrides) ---
function batches(){
  const e=document.getElementById('view-batches');
  e.innerHTML=`<div class='panel'><h3>Create Batch</h3><form id='bf' class='grid'><input name='name' placeholder='Batch Name' required/><input name='time' type='time' required/><button class='btn primary' type='submit'>Save Batch</button></form></div><div class='panel' style='margin-top:10px;'><h3>Batch List</h3>${s.batches.map(b=>`<div class='card' style='margin-bottom:8px;'><b>${b.name}</b> (${b.time}) - Students: ${s.students.filter(x=>x.batchId===b.id).length}<div class='row' style='margin-top:8px;'><button class='btn' onclick="editBatch('${b.id}')">Edit</button><button class='btn danger' onclick="deleteBatch('${b.id}')">Delete</button></div></div>`).join('')}</div>`;

  document.getElementById('bf').addEventListener('submit',ev=>{
    ev.preventDefault();
    const p=Object.fromEntries(new FormData(ev.target).entries());
    p.id=`BATCH-${String(s.counters.batch++).padStart(3,'0')}`;
    s.batches.push(p);
    save();
    render();
  });
}

window.editBatch=function(id){
  const b=s.batches.find(x=>x.id===id);
  if(!b) return;
  const name=prompt('Batch name',b.name);
  if(name===null) return;
  const time=prompt('Batch time (HH:MM)',b.time);
  if(time===null) return;
  b.name=name.trim()||b.name;
  b.time=time.trim()||b.time;
  save();
  render();
};

window.deleteBatch=function(id){
  const assigned=s.students.some(st=>st.batchId===id);
  if(assigned){ alert('Cannot delete: students are assigned to this batch.'); return; }
  if(!confirm('Delete this batch?')) return;
  s.batches=s.batches.filter(x=>x.id!==id);
  save();
  render();
};

function courses(){
  const e=document.getElementById('view-courses');
  e.innerHTML=`<div class='panel'><h3>Create Course</h3><form id='cf' class='grid'><input name='name' placeholder='Course Name' required/><input name='duration' placeholder='Duration' required/><input name='fees' type='number' placeholder='Fees' required/><input name='description' placeholder='Description'/><button class='btn primary' type='submit'>Save Course</button></form></div><div class='panel' style='margin-top:10px;'><h3>Course List</h3>${s.courses.map(c=>`<div class='card' style='margin-bottom:8px;'><b>${c.name}</b> - ${c.duration} - Rs ${c.fees}<br/><small>${c.description||''}</small><div class='row' style='margin-top:8px;'><button class='btn' onclick="editCourse('${c.id}')">Edit</button><button class='btn danger' onclick="deleteCourse('${c.id}')">Delete</button></div></div>`).join('')}</div>`;

  document.getElementById('cf').addEventListener('submit',ev=>{
    ev.preventDefault();
    const p=Object.fromEntries(new FormData(ev.target).entries());
    p.id=`COURSE-${String(s.counters.course++).padStart(3,'0')}`;
    p.fees=Number(p.fees||0);
    s.courses.push(p);
    save();
    render();
  });
}

window.editCourse=function(id){
  const c=s.courses.find(x=>x.id===id);
  if(!c) return;
  const name=prompt('Course name',c.name); if(name===null) return;
  const duration=prompt('Course duration',c.duration); if(duration===null) return;
  const fees=prompt('Course fees',String(c.fees)); if(fees===null) return;
  const description=prompt('Course description',c.description||''); if(description===null) return;
  c.name=name.trim()||c.name;
  c.duration=duration.trim()||c.duration;
  c.fees=Number(fees)||c.fees;
  c.description=description;
  save();
  render();
};

window.deleteCourse=function(id){
  const assigned=s.students.some(st=>st.courseId===id);
  if(assigned){ alert('Cannot delete: students are assigned to this course.'); return; }
  if(!confirm('Delete this course?')) return;
  s.courses=s.courses.filter(x=>x.id!==id);
  save();
  render();
};

function settings(){
  const e=document.getElementById('view-settings');
  e.innerHTML=`<div class='panel'><h3>Admin & Security</h3><form id='sf' class='grid'><input name='instituteName' value='${esc(s.settings.instituteName)}' placeholder='Institute Name'/><input name='instituteContact' value='${esc(s.settings.instituteContact)}' placeholder='Contact'/><input name='adminUser' value='${esc(s.settings.adminUser)}' placeholder='Admin Username'/><input name='adminPass' value='${esc(s.settings.adminPass)}' placeholder='Admin Password'/><input name='pinLock' value='${esc(s.settings.pinLock||'')}' placeholder='PIN lock (optional)'/><button class='btn primary' type='submit'>Save Settings</button></form><div class='row' style='margin-top:10px;'><button id='bb' class='btn'>Backup Data</button><label class='btn' for='rf'>Restore Data</label><input id='rf' type='file' accept='application/json' class='hidden'/></div></div>`;

  document.getElementById('sf').addEventListener('submit',ev=>{
    ev.preventDefault();
    s.settings={...s.settings,...Object.fromEntries(new FormData(ev.target).entries())};
    save();
    document.getElementById('instituteTitle').textContent=s.settings.instituteName;
    render();
    alert('Settings saved.');
  });

  document.getElementById('bb').addEventListener('click',()=>{
    const blob=new Blob([JSON.stringify(s,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url; a.download='institute-backup.json'; a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('rf').addEventListener('change',ev=>{
    const f=ev.target.files[0]; if(!f) return;
    const r=new FileReader();
    r.onload=()=>{try{ s=m(JSON.parse(r.result)); save(); document.getElementById('instituteTitle').textContent=s.settings.instituteName; render(); alert('Data restored.'); }catch{ alert('Invalid backup file.'); }};
    r.readAsText(f);
  });
}

function certs(){
  const e=document.getElementById('view-certificates');
  const c=s.students.filter(x=>x.status==='completed');
  e.innerHTML=`<div class='panel'><h3>Certificate Generator</h3><div class='row'><select id='cs'><option value=''>Select Completed Student</option>${c.map(st=>`<option value='${st.id}'>${st.name}</option>`).join('')}</select><input id='cd' type='date' value='${new Date().toISOString().slice(0,10)}'/><button id='gc' class='btn primary'>Generate Certificate (PDF/Print)</button></div></div><div class='panel' style='margin-top:10px;'><h3>ID Card Generator</h3><div class='row'><select id='ids'><option value=''>Select Student</option>${stOpts()}</select><button id='gid' class='btn'>Generate Beautiful ID Card</button></div></div>`;

  document.getElementById('gc').addEventListener('click',()=>{
    const id=document.getElementById('cs').value;
    const d=document.getElementById('cd').value;
    const st=s.students.find(x=>x.id===id);
    if(!st)return alert('Select student.');
    const co=s.courses.find(x=>x.id===st.courseId)?.name||st.courseId;
    const w=window.open('','_blank');
    w.document.write(`<html><body style='font-family:Georgia;text-align:center;padding:24px;'><h1>Course Completion Certificate</h1><p>This is to certify that</p><h2>${st.name}</h2><p>has successfully completed</p><h3>${co}</h3><p>on ${d}</p><br/><p>${s.settings.instituteName}</p><p>Authorized Signature</p><button onclick='window.print()'>Print / Save PDF</button></body></html>`);
    w.document.close();
  });

  document.getElementById('gid').addEventListener('click',()=>{
    const id=document.getElementById('ids').value;
    const st=s.students.find(x=>x.id===id);
    if(!st)return alert('Select student.');
    const co=s.courses.find(x=>x.id===st.courseId)?.name||'-';
    const ba=s.batches.find(x=>x.id===st.batchId)?.name||'-';
    const initials=(st.name||'S').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();
    const photoBlock=st.photo?`<img src='${st.photo}' style='width:86px;height:86px;border-radius:50%;object-fit:cover;border:3px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,.25);'/>`:`<div style='width:86px;height:86px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#eaf3ff;color:#0c2f66;font-size:30px;font-weight:700;border:3px solid #fff;'>${initials}</div>`;
    const w=window.open('','_blank');
    w.document.write(`<html><body style='font-family:Segoe UI,Arial;background:#f2f6ff;padding:24px;'><div style='width:340px;border-radius:16px;overflow:hidden;box-shadow:0 14px 30px rgba(9,30,66,.2);border:1px solid #c8d7ef;background:#fff;'><div style='background:linear-gradient(135deg,#0f7a6c,#1f6feb);padding:14px;color:#fff;'><div style='font-size:12px;opacity:.95;'>STUDENT ID CARD</div><div style='font-size:20px;font-weight:700;'>${s.settings.instituteName}</div></div><div style='padding:14px;display:flex;gap:12px;align-items:flex-start;'>${photoBlock}<div style='flex:1;'><div style='font-size:17px;font-weight:700;color:#0f172a;'>${st.name}</div><div style='font-size:12px;color:#475569;margin-top:2px;'>${st.id}</div><div style='margin-top:8px;font-size:13px;line-height:1.6;'><div><b>Course:</b> ${co}</div><div><b>Batch:</b> ${ba}</div><div><b>Guardian:</b> ${st.guardian||'-'}</div><div><b>Phone:</b> ${st.phone||'-'}</div></div></div></div><div style='border-top:1px dashed #c8d7ef;padding:10px 14px;background:#f8fbff;color:#334155;font-size:12px;'>Institute Contact: ${s.settings.instituteContact}</div></div><div style='margin-top:12px;'><button onclick='window.print()' style='padding:10px 14px;border:0;border-radius:10px;background:#0f7a6c;color:#fff;cursor:pointer;'>Print / Save PDF</button></div></body></html>`);
    w.document.close();
  });
}

// --- Fees reprint override ---
function fees(){
  const e=document.getElementById('view-fees');
  e.innerHTML=`<div class='grid'><div class='panel'><h3>Fee Collection</h3><form id='payForm' class='stack'><select name='studentId' required><option value=''>Select Student</option>${stOpts()}</select><input name='amount' type='number' placeholder='Payment Amount' required/><input name='date' type='date' value='${new Date().toISOString().slice(0,10)}' required/><select name='method'><option>Cash</option><option>UPI</option><option>Bank transfer</option></select><button class='btn primary' type='submit'>Mark as Paid + Receipt</button></form></div><div class='panel'><h3>Pending & Overdue</h3><div>${pendingHTML(false)}</div></div></div><div class='panel' style='margin-top:10px;'><h3>Payment History</h3><div class='table-wrap'><table><thead><tr><th>Date</th><th>Student</th><th>Amount</th><th>Method</th><th>Receipt</th></tr></thead><tbody>${[...s.payments].sort((x,y)=>y.date.localeCompare(x.date)).map(p=>{const st=s.students.find(z=>z.id===p.studentId);return `<tr><td>${p.date}</td><td>${st?st.name:'-'}</td><td>${p.amount}</td><td>${p.method}</td><td><button class='btn' onclick="reprintReceipt('${p.id}')">Reprint</button></td></tr>`}).join('')||"<tr><td colspan='5'>No payments yet.</td></tr>"}</tbody></table></div></div>`;

  document.getElementById('payForm').addEventListener('submit',ev=>{
    ev.preventDefault();
    const p=Object.fromEntries(new FormData(ev.target).entries());
    p.id=`PAY-${String(s.counters.payment++).padStart(5,'0')}`;
    p.amount=Number(p.amount||0);
    s.payments.push(p);
    save();
    receipt(p);
    render();
  });
}

window.reprintReceipt=function(paymentId){
  const p=s.payments.find(x=>x.id===paymentId);
  if(!p){ alert('Payment not found.'); return; }
  receipt(p);
};

// --- Professional receipt + receipt no override ---
function fees(){
  const e=document.getElementById('view-fees');
  e.innerHTML=`<div class='grid'><div class='panel'><h3>Fee Collection</h3><form id='payForm' class='stack'><select name='studentId' required><option value=''>Select Student</option>${stOpts()}</select><input name='amount' type='number' placeholder='Payment Amount' required/><input name='date' type='date' value='${new Date().toISOString().slice(0,10)}' required/><select name='method'><option>Cash</option><option>UPI</option><option>Bank transfer</option></select><button class='btn primary' type='submit'>Mark as Paid + Receipt</button></form></div><div class='panel'><h3>Pending & Overdue</h3><div>${pendingHTML(false)}</div></div></div><div class='panel' style='margin-top:10px;'><h3>Payment History</h3><div class='table-wrap'><table><thead><tr><th>Date</th><th>Receipt No</th><th>Student</th><th>Amount</th><th>Method</th><th>Receipt</th></tr></thead><tbody>${[...s.payments].sort((x,y)=>y.date.localeCompare(x.date)).map(p=>{const st=s.students.find(z=>z.id===p.studentId);const rno=p.receiptNo||p.id;return `<tr><td>${p.date}</td><td><b>${rno}</b></td><td>${st?st.name:'-'}</td><td>${p.amount}</td><td>${p.method}</td><td><button class='btn' onclick="reprintReceipt('${p.id}')">Reprint</button></td></tr>`}).join('')||"<tr><td colspan='6'>No payments yet.</td></tr>"}</tbody></table></div></div>`;

  document.getElementById('payForm').addEventListener('submit',ev=>{
    ev.preventDefault();
    const p=Object.fromEntries(new FormData(ev.target).entries());
    p.id=`PAY-${String(s.counters.payment++).padStart(5,'0')}`;
    p.receiptNo=`RCPT-${new Date().getFullYear()}-${String(s.counters.payment-1).padStart(5,'0')}`;
    p.amount=Number(p.amount||0);
    s.payments.push(p);
    save();
    receipt(p);
    render();
  });
}

function receipt(p){
  const st=s.students.find(x=>x.id===p.studentId);
  if(!st)return;
  const course=s.courses.find(c=>c.id===st.courseId)?.name||'-';
  const batch=s.batches.find(b=>b.id===st.batchId)?.name||'-';
  const paidAmt=paid(st.id);
  const pendAmt=Math.max(0,Number(st.totalFees||0)-paidAmt);
  const rno=p.receiptNo||p.id;
  const w=window.open('','_blank');
  w.document.write(`
  <html>
  <head>
    <title>Receipt ${rno}</title>
    <style>
      body{font-family:Segoe UI,Arial,sans-serif;background:#f5f8fc;margin:0;padding:20px;color:#1f2937}
      .wrap{max-width:760px;margin:0 auto;background:#fff;border:1px solid #d8e2ef;border-radius:14px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,.08)}
      .head{padding:20px;background:linear-gradient(135deg,#0f7a6c,#1f6feb);color:#fff}
      .head h1{margin:0 0 4px;font-size:24px}
      .head p{margin:0;font-size:13px;opacity:.95}
      .body{padding:18px}
      .meta{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}
      .box{border:1px solid #dbe5f1;border-radius:10px;padding:10px;background:#f9fbff}
      .title{font-size:12px;color:#4b5563;text-transform:uppercase;letter-spacing:.5px}
      .value{font-size:15px;font-weight:600;color:#111827}
      table{width:100%;border-collapse:collapse;margin-top:8px}
      th,td{border-bottom:1px solid #e5edf6;padding:10px;text-align:left;font-size:14px}
      th{background:#f4f8fd;color:#334155}
      .tot{margin-top:16px;display:grid;grid-template-columns:1fr 260px;gap:12px}
      .sum{border:1px solid #cfe0f5;border-radius:10px;padding:10px;background:#f7fbff}
      .sum div{display:flex;justify-content:space-between;padding:5px 0}
      .paid{font-size:18px;font-weight:700;color:#0f7a6c}
      .foot{padding:16px 18px;display:flex;justify-content:space-between;align-items:flex-end}
      .sig{border-top:1px solid #9aa7b8;padding-top:6px;min-width:180px;text-align:center;font-size:12px;color:#475569}
      .actions{margin-top:12px}
      button{padding:10px 14px;border:0;border-radius:10px;background:#0f7a6c;color:#fff;cursor:pointer}
      @media print {.actions{display:none} body{background:#fff;padding:0}.wrap{box-shadow:none;border:1px solid #c8d4e5}}
    </style>
  </head>
  <body>
    <div class='wrap'>
      <div class='head'>
        <h1>${s.settings.instituteName}</h1>
        <p>Official Fee Receipt | Contact: ${s.settings.instituteContact}</p>
      </div>
      <div class='body'>
        <div class='meta'>
          <div class='box'><div class='title'>Receipt No</div><div class='value'>${rno}</div></div>
          <div class='box'><div class='title'>Payment Date</div><div class='value'>${p.date}</div></div>
          <div class='box'><div class='title'>Student</div><div class='value'>${st.name} (${st.id})</div></div>
          <div class='box'><div class='title'>Payment Method</div><div class='value'>${p.method}</div></div>
        </div>

        <table>
          <thead><tr><th>Description</th><th>Course</th><th>Batch</th><th>Amount</th></tr></thead>
          <tbody><tr><td>Course installment fee payment</td><td>${course}</td><td>${batch}</td><td>Rs ${Number(p.amount).toLocaleString()}</td></tr></tbody>
        </table>

        <div class='tot'>
          <div class='box'>Thank you for your payment. Keep this receipt for records and verification.</div>
          <div class='sum'>
            <div><span>Total Course Fees</span><span>Rs ${Number(st.totalFees||0).toLocaleString()}</span></div>
            <div><span>Total Paid</span><span>Rs ${Number(paidAmt).toLocaleString()}</span></div>
            <div><span>Pending</span><span>Rs ${Number(pendAmt).toLocaleString()}</span></div>
            <div class='paid'><span>Paid Now</span><span>Rs ${Number(p.amount).toLocaleString()}</span></div>
          </div>
        </div>
      </div>
      <div class='foot'>
        <div style='font-size:12px;color:#64748b'>Generated on ${new Date().toLocaleString()}</div>
        <div class='sig'>Authorized Signature</div>
      </div>
    </div>
    <div class='actions'><button onclick='window.print()'>Print / Save as PDF</button></div>
  </body>
  </html>
  `);
  w.document.close();
}

// --- Beautiful landscape certificate override ---
function certs(){
  const e=document.getElementById('view-certificates');
  const c=s.students.filter(x=>x.status==='completed');
  e.innerHTML=`<div class='panel'><h3>Certificate Generator</h3><div class='row'><select id='cs'><option value=''>Select Completed Student</option>${c.map(st=>`<option value='${st.id}'>${st.name}</option>`).join('')}</select><input id='cd' type='date' value='${new Date().toISOString().slice(0,10)}'/><button id='gc' class='btn primary'>Generate Beautiful Landscape Certificate</button></div></div><div class='panel' style='margin-top:10px;'><h3>ID Card Generator</h3><div class='row'><select id='ids'><option value=''>Select Student</option>${stOpts()}</select><button id='gid' class='btn'>Generate Beautiful ID Card</button></div></div>`;

  document.getElementById('gc').addEventListener('click',()=>{
    const id=document.getElementById('cs').value;
    const d=document.getElementById('cd').value;
    const st=s.students.find(x=>x.id===id);
    if(!st)return alert('Select student.');
    const co=s.courses.find(x=>x.id===st.courseId)?.name||st.courseId;

    const w=window.open('','_blank');
    w.document.write(`
      <html>
      <head>
        <title>Certificate - ${st.name}</title>
        <style>
          @page { size: A4 landscape; margin: 10mm; }
          body { margin: 0; background: #eef3fb; font-family: 'Times New Roman', Georgia, serif; }
          .sheet { width: 1120px; margin: 16px auto; }
          .cert {
            position: relative;
            background: linear-gradient(180deg, #ffffff, #f9fbff);
            border: 2px solid #c9a34d;
            border-radius: 16px;
            padding: 26px;
            box-shadow: 0 18px 40px rgba(0,0,0,.12);
            overflow: hidden;
          }
          .cert:before, .cert:after {
            content: '';
            position: absolute;
            width: 220px;
            height: 220px;
            border: 2px solid rgba(201,163,77,.28);
            border-radius: 50%;
          }
          .cert:before { top: -110px; left: -90px; }
          .cert:after { bottom: -110px; right: -90px; }
          .inner {
            border: 1px solid #d8bb76;
            border-radius: 12px;
            padding: 26px 40px;
            min-height: 630px;
            text-align: center;
          }
          .label { letter-spacing: 4px; font-size: 15px; color: #6b7280; text-transform: uppercase; }
          .title { margin-top: 12px; font-size: 56px; color: #153f7a; font-weight: 700; }
          .inst { margin-top: 8px; font-size: 22px; color: #0f766e; font-weight: 600; }
          .line { width: 200px; height: 3px; background: linear-gradient(90deg, transparent, #c9a34d, transparent); margin: 16px auto 10px; }
          .text { margin-top: 10px; font-size: 24px; color: #374151; }
          .name {
            margin: 18px auto 14px;
            font-size: 52px;
            color: #111827;
            font-weight: 700;
            border-bottom: 2px solid #d1a852;
            display: inline-block;
            padding: 0 16px 6px;
          }
          .course { font-size: 32px; color: #1f4c8f; font-weight: 700; margin-top: 10px; }
          .meta { margin-top: 18px; font-size: 20px; color: #374151; }
          .footer {
            margin-top: 70px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            gap: 20px;
          }
          .sign {
            width: 280px;
            border-top: 1px solid #8b95a7;
            padding-top: 8px;
            font-size: 16px;
            color: #4b5563;
            text-align: center;
          }
          .seal {
            width: 130px;
            height: 130px;
            border: 2px solid #c9a34d;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            color: #7a5b1f;
            font-weight: 700;
            letter-spacing: 1px;
          }
          .actions { margin: 10px auto; width: 1120px; }
          button { padding: 10px 14px; border: 0; border-radius: 10px; background: #0f7a6c; color: #fff; cursor: pointer; }
          @media print {
            body { background: #fff; }
            .sheet { width: auto; margin: 0; }
            .cert { box-shadow: none; }
            .actions { display: none; }
          }
        </style>
      </head>
      <body>
        <div class='sheet'>
          <div class='cert'>
            <div class='inner'>
              <div class='label'>Certificate of Completion</div>
              <div class='title'>Achievement Award</div>
              <div class='inst'>${s.settings.instituteName}</div>
              <div class='line'></div>
              <div class='text'>This is proudly awarded to</div>
              <div class='name'>${st.name}</div>
              <div class='text'>for successfully completing the course</div>
              <div class='course'>${co}</div>
              <div class='meta'>Completion Date: <b>${d}</b> &nbsp; | &nbsp; Student ID: <b>${st.id}</b></div>

              <div class='footer'>
                <div class='sign'>Program Coordinator</div>
                <div class='seal'>OFFICIAL<br/>SEAL</div>
                <div class='sign'>Authorized Signature</div>
              </div>
            </div>
          </div>
        </div>
        <div class='actions'><button onclick='window.print()'>Print / Save PDF</button></div>
      </body>
      </html>
    `);
    w.document.close();
  });

  document.getElementById('gid').addEventListener('click',()=>{
    const id=document.getElementById('ids').value;
    const st=s.students.find(x=>x.id===id);
    if(!st)return alert('Select student.');
    const co=s.courses.find(x=>x.id===st.courseId)?.name||'-';
    const ba=s.batches.find(x=>x.id===st.batchId)?.name||'-';
    const initials=(st.name||'S').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();
    const photoBlock=st.photo?`<img src='${st.photo}' style='width:86px;height:86px;border-radius:50%;object-fit:cover;border:3px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,.25);'/>`:`<div style='width:86px;height:86px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#eaf3ff;color:#0c2f66;font-size:30px;font-weight:700;border:3px solid #fff;'>${initials}</div>`;
    const w=window.open('','_blank');
    w.document.write(`<html><body style='font-family:Segoe UI,Arial;background:#f2f6ff;padding:24px;'><div style='width:340px;border-radius:16px;overflow:hidden;box-shadow:0 14px 30px rgba(9,30,66,.2);border:1px solid #c8d7ef;background:#fff;'><div style='background:linear-gradient(135deg,#0f7a6c,#1f6feb);padding:14px;color:#fff;'><div style='font-size:12px;opacity:.95;'>STUDENT ID CARD</div><div style='font-size:20px;font-weight:700;'>${s.settings.instituteName}</div></div><div style='padding:14px;display:flex;gap:12px;align-items:flex-start;'>${photoBlock}<div style='flex:1;'><div style='font-size:17px;font-weight:700;color:#0f172a;'>${st.name}</div><div style='font-size:12px;color:#475569;margin-top:2px;'>${st.id}</div><div style='margin-top:8px;font-size:13px;line-height:1.6;'><div><b>Course:</b> ${co}</div><div><b>Batch:</b> ${ba}</div><div><b>Guardian:</b> ${st.guardian||'-'}</div><div><b>Phone:</b> ${st.phone||'-'}</div></div></div></div><div style='border-top:1px dashed #c8d7ef;padding:10px 14px;background:#f8fbff;color:#334155;font-size:12px;'>Institute Contact: ${s.settings.instituteContact}</div></div><div style='margin-top:12px;'><button onclick='window.print()' style='padding:10px 14px;border:0;border-radius:10px;background:#0f7a6c;color:#fff;cursor:pointer;'>Print / Save PDF</button></div></body></html>`);
    w.document.close();
  });
}

// --- Professional student form override ---
function students(){
  const e=document.getElementById('view-students');
  e.innerHTML=`<div class='panel student-form-panel'><div class='student-form-head'><h3>${editStu?'Edit Student':'Add New Student'}</h3><p class='muted'>Fill all required details to maintain clean and complete student records.</p></div><form id='stuForm' class='stu-form'><div class='field'><label for='stu-name'>Student Name <span class='req'>*</span></label><input id='stu-name' name='name' placeholder='Enter full name' required/></div><div class='field'><label for='stu-photo'>Photo URL</label><input id='stu-photo' name='photo' placeholder='https://example.com/photo.jpg'/></div><div class='field'><label for='stu-guardian'>Father/Guardian Name <span class='req'>*</span></label><input id='stu-guardian' name='guardian' placeholder='Enter guardian name' required/></div><div class='field'><label for='stu-phone'>Phone Number <span class='req'>*</span></label><input id='stu-phone' name='phone' placeholder='Primary contact number' required/></div><div class='field'><label for='stu-alt-phone'>Alternate Phone</label><input id='stu-alt-phone' name='altPhone' placeholder='Optional secondary number'/></div><div class='field'><label for='stu-email'>Email</label><input id='stu-email' name='email' type='email' placeholder='student@email.com'/></div><div class='field field-full'><label for='stu-address'>Address</label><input id='stu-address' name='address' placeholder='House no, street, city'/></div><div class='field'><label for='stu-dob'>Date of Birth</label><input id='stu-dob' name='dob' type='date'/></div><div class='field'><label for='stu-admission'>Admission Date <span class='req'>*</span></label><input id='stu-admission' name='admissionDate' type='date' required/></div><div class='field'><label for='stu-course'>Course <span class='req'>*</span></label><select id='stu-course' name='courseId' required>${cOpts()}</select></div><div class='field'><label for='stu-duration'>Course Duration</label><input id='stu-duration' name='courseDuration' placeholder='Example: 6 Months'/></div><div class='field'><label for='stu-fees'>Total Fees <span class='req'>*</span></label><input id='stu-fees' name='totalFees' type='number' placeholder='Enter total fees' required/></div><div class='field'><label for='stu-installments'>Installments <span class='req'>*</span></label><input id='stu-installments' name='installments' type='number' min='1' value='1' placeholder='Number of installments' required/></div><div class='field'><label for='stu-batch'>Batch <span class='req'>*</span></label><select id='stu-batch' name='batchId' required>${bOpts()}</select></div><div class='field'><label for='stu-status'>Status</label><select id='stu-status' name='status'><option value='active'>Active</option><option value='completed'>Completed</option></select></div><div class='field field-full'><label for='stu-notes'>Notes</label><textarea id='stu-notes' name='notes' rows='3' placeholder='Additional remarks (optional)'></textarea></div><div class='form-actions'><button class='btn primary' type='submit'>${editStu?'Update Student':'Save Student'}</button>${editStu?"<button class='btn' type='button' id='cancelEditStu'>Cancel</button>":''}</div></form></div><div class='panel' style='margin-top:10px;'><div class='row'><input id='ss' placeholder='Search student'/><select id='fc'><option value=''>All Courses</option>${cOpts(true)}</select><select id='fb'><option value=''>All Batches</option>${bOpts(true)}</select><select id='fs'><option value=''>All Status</option><option value='active'>Active</option><option value='completed'>Completed</option></select></div><div class='table-wrap' style='margin-top:10px;'><table><thead><tr><th>ID</th><th>Student</th><th>Course</th><th>Batch</th><th>Total</th><th>Paid</th><th>Pending</th><th>Status</th><th>Actions</th></tr></thead><tbody id='stuRows'></tbody></table></div></div>`;

  const f=document.getElementById('stuForm');
  if(editStu){
    const st=s.students.find(x=>x.id===editStu);
    if(st)[...f.elements].forEach(x=>{if(x.name&&st[x.name]!==undefined)x.value=st[x.name];});
    const cancel=document.getElementById('cancelEditStu');
    if(cancel)cancel.addEventListener('click',()=>{editStu=null;render();});
  }

  f.addEventListener('submit',ev=>{
    ev.preventDefault();
    const p=Object.fromEntries(new FormData(f).entries());
    p.totalFees=Number(p.totalFees||0);
    p.installments=Number(p.installments||1);
    if(editStu){
      const i=s.students.findIndex(x=>x.id===editStu);
      s.students[i]={...s.students[i],...p};
      editStu=null;
    }else{
      s.students.push({id:`STU-${String(s.counters.student++).padStart(4,'0')}`,...p});
    }
    save();
    render();
  });

  ['ss','fc','fb','fs'].forEach(id=>{
    document.getElementById(id).addEventListener('input',rows);
    document.getElementById(id).addEventListener('change',rows);
  });
  rows();
}

// --- Editable student ID override ---
function students(){
  const e=document.getElementById('view-students');
  e.innerHTML=`<div class='panel student-form-panel'><div class='student-form-head'><h3>${editStu?'Edit Student':'Add New Student'}</h3><p class='muted'>Fill all required details to maintain clean and complete student records.</p></div><form id='stuForm' class='stu-form'><div class='field'><label for='stu-id'>Student ID <span class='req'>*</span></label><input id='stu-id' name='id' placeholder='STU-0001' required/></div><div class='field'><label for='stu-name'>Student Name <span class='req'>*</span></label><input id='stu-name' name='name' placeholder='Enter full name' required/></div><div class='field'><label for='stu-photo'>Photo URL</label><input id='stu-photo' name='photo' placeholder='https://example.com/photo.jpg'/></div><div class='field'><label for='stu-guardian'>Father/Guardian Name <span class='req'>*</span></label><input id='stu-guardian' name='guardian' placeholder='Enter guardian name' required/></div><div class='field'><label for='stu-phone'>Phone Number <span class='req'>*</span></label><input id='stu-phone' name='phone' placeholder='Primary contact number' required/></div><div class='field'><label for='stu-alt-phone'>Alternate Phone</label><input id='stu-alt-phone' name='altPhone' placeholder='Optional secondary number'/></div><div class='field'><label for='stu-email'>Email</label><input id='stu-email' name='email' type='email' placeholder='student@email.com'/></div><div class='field field-full'><label for='stu-address'>Address</label><input id='stu-address' name='address' placeholder='House no, street, city'/></div><div class='field'><label for='stu-dob'>Date of Birth</label><input id='stu-dob' name='dob' type='date'/></div><div class='field'><label for='stu-admission'>Admission Date <span class='req'>*</span></label><input id='stu-admission' name='admissionDate' type='date' required/></div><div class='field'><label for='stu-course'>Course <span class='req'>*</span></label><select id='stu-course' name='courseId' required>${cOpts()}</select></div><div class='field'><label for='stu-duration'>Course Duration</label><input id='stu-duration' name='courseDuration' placeholder='Example: 6 Months'/></div><div class='field'><label for='stu-fees'>Total Fees <span class='req'>*</span></label><input id='stu-fees' name='totalFees' type='number' placeholder='Enter total fees' required/></div><div class='field'><label for='stu-installments'>Installments <span class='req'>*</span></label><input id='stu-installments' name='installments' type='number' min='1' value='1' placeholder='Number of installments' required/></div><div class='field'><label for='stu-batch'>Batch <span class='req'>*</span></label><select id='stu-batch' name='batchId' required>${bOpts()}</select></div><div class='field'><label for='stu-status'>Status</label><select id='stu-status' name='status'><option value='active'>Active</option><option value='completed'>Completed</option></select></div><div class='field field-full'><label for='stu-notes'>Notes</label><textarea id='stu-notes' name='notes' rows='3' placeholder='Additional remarks (optional)'></textarea></div><div class='form-actions'><button class='btn primary' type='submit'>${editStu?'Update Student':'Save Student'}</button>${editStu?"<button class='btn' type='button' id='cancelEditStu'>Cancel</button>":''}</div></form></div><div class='panel' style='margin-top:10px;'><div class='row'><input id='ss' placeholder='Search student'/><select id='fc'><option value=''>All Courses</option>${cOpts(true)}</select><select id='fb'><option value=''>All Batches</option>${bOpts(true)}</select><select id='fs'><option value=''>All Status</option><option value='active'>Active</option><option value='completed'>Completed</option></select></div><div class='table-wrap' style='margin-top:10px;'><table><thead><tr><th>ID</th><th>Student</th><th>Course</th><th>Batch</th><th>Total</th><th>Paid</th><th>Pending</th><th>Status</th><th>Actions</th></tr></thead><tbody id='stuRows'></tbody></table></div></div>`;

  const f=document.getElementById('stuForm');
  if(editStu){
    const st=s.students.find(x=>x.id===editStu);
    if(st)[...f.elements].forEach(x=>{if(x.name&&st[x.name]!==undefined)x.value=st[x.name];});
    const cancel=document.getElementById('cancelEditStu');
    if(cancel)cancel.addEventListener('click',()=>{editStu=null;render();});
  }else{
    f.id.value=`STU-${String(s.counters.student).padStart(4,'0')}`;
  }

  f.addEventListener('submit',ev=>{
    ev.preventDefault();
    const p=Object.fromEntries(new FormData(f).entries());
    p.id=String(p.id||'').trim();
    if(!p.id)return alert('Student ID is required.');
    const prevId=editStu;
    const duplicate=s.students.some(x=>x.id===p.id&&x.id!==prevId);
    if(duplicate)return alert('Student ID already exists. Please use a unique ID.');

    p.totalFees=Number(p.totalFees||0);
    p.installments=Number(p.installments||1);

    if(editStu){
      const i=s.students.findIndex(x=>x.id===editStu);
      s.students[i]={...s.students[i],...p};
      if(prevId!==p.id){
        s.payments.forEach(pay=>{if(pay.studentId===prevId)pay.studentId=p.id;});
        s.attendance.forEach(att=>{if(att.studentId===prevId)att.studentId=p.id;});
      }
      editStu=null;
    }else{
      s.students.push(p);
      s.counters.student++;
    }

    save();
    render();
  });

  ['ss','fc','fb','fs'].forEach(id=>{
    document.getElementById(id).addEventListener('input',rows);
    document.getElementById(id).addEventListener('change',rows);
  });
  rows();
}

// --- Fees student search override ---
function fees(){
  const e=document.getElementById('view-fees');
  e.innerHTML=`<div class='grid'><div class='panel'><h3>Fee Collection</h3><form id='payForm' class='stack'><input id='feeStudentSearch' type='text' placeholder='Search student by name, ID, or phone'/><select id='feeStudentSelect' name='studentId' required><option value=''>Select Student</option></select><small id='feeSearchMeta' class='muted'></small><input name='amount' type='number' placeholder='Payment Amount' required/><input name='date' type='date' value='${new Date().toISOString().slice(0,10)}' required/><select name='method'><option>Cash</option><option>UPI</option><option>Bank transfer</option></select><button class='btn primary' type='submit'>Mark as Paid + Receipt</button></form></div><div class='panel'><h3>Pending & Overdue</h3><div>${pendingHTML(false)}</div></div></div><div class='panel' style='margin-top:10px;'><h3>Payment History</h3><div class='table-wrap'><table><thead><tr><th>Date</th><th>Receipt No</th><th>Student</th><th>Amount</th><th>Method</th><th>Receipt</th></tr></thead><tbody>${[...s.payments].sort((x,y)=>y.date.localeCompare(x.date)).map(p=>{const st=s.students.find(z=>z.id===p.studentId);const rno=p.receiptNo||p.id;return `<tr><td>${p.date}</td><td><b>${rno}</b></td><td>${st?st.name:'-'}</td><td>${p.amount}</td><td>${p.method}</td><td><button class='btn' onclick="reprintReceipt('${p.id}')">Reprint</button></td></tr>`}).join('')||"<tr><td colspan='6'>No payments yet.</td></tr>"}</tbody></table></div></div>`;

  const search=document.getElementById('feeStudentSearch');
  const select=document.getElementById('feeStudentSelect');
  const meta=document.getElementById('feeSearchMeta');

  const renderStudentOptions=()=>{
    const q=(search.value||'').trim().toLowerCase();
    const prev=select.value;
    const list=s.students.filter(st=>{
      if(!q)return true;
      return (st.name||'').toLowerCase().includes(q)
        || (st.id||'').toLowerCase().includes(q)
        || String(st.phone||'').toLowerCase().includes(q);
    });

    select.innerHTML=`<option value=''>Select Student</option>${list.map(st=>`<option value='${st.id}'>${st.name} (${st.id})${st.phone?` - ${st.phone}`:''}</option>`).join('')}`;
    meta.textContent=`${list.length} student${list.length===1?'':'s'} found`;

    if(list.some(st=>st.id===prev)){
      select.value=prev;
    }else if(list.length===1){
      select.value=list[0].id;
    }
  };

  search.addEventListener('input',renderStudentOptions);
  renderStudentOptions();

  document.getElementById('payForm').addEventListener('submit',ev=>{
    ev.preventDefault();
    const p=Object.fromEntries(new FormData(ev.target).entries());
    p.id=`PAY-${String(s.counters.payment++).padStart(5,'0')}`;
    p.receiptNo=`RCPT-${new Date().getFullYear()}-${String(s.counters.payment-1).padStart(5,'0')}`;
    p.amount=Number(p.amount||0);
    s.payments.push(p);
    save();
    receipt(p);
    render();
  });
}

// --- Settings footer credit override ---
function settings(){
  const e=document.getElementById('view-settings');
  e.innerHTML=`<div class='panel'><h3>Admin & Security</h3><form id='sf' class='grid'><input name='instituteName' value='${esc(s.settings.instituteName)}' placeholder='Institute Name'/><input name='instituteContact' value='${esc(s.settings.instituteContact)}' placeholder='Contact'/><input name='adminUser' value='${esc(s.settings.adminUser)}' placeholder='Admin Username'/><input name='adminPass' value='${esc(s.settings.adminPass)}' placeholder='Admin Password'/><input name='pinLock' value='${esc(s.settings.pinLock||'')}' placeholder='PIN lock (optional)'/><button class='btn primary' type='submit'>Save Settings</button></form><div class='row' style='margin-top:10px;'><button id='bb' class='btn'>Backup Data</button><label class='btn' for='rf'>Restore Data</label><input id='rf' type='file' accept='application/json' class='hidden'/></div><p style='margin-top:18px;text-align:center;font-weight:700;color:var(--muted);'>This App Is Made & Developed By Shubham Dubey</p></div>`;

  document.getElementById('sf').addEventListener('submit',ev=>{
    ev.preventDefault();
    s.settings={...s.settings,...Object.fromEntries(new FormData(ev.target).entries())};
    save();
    document.getElementById('instituteTitle').textContent=s.settings.instituteName;
    render();
    alert('Settings saved.');
  });

  document.getElementById('bb').addEventListener('click',()=>{
    const blob=new Blob([JSON.stringify(s,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url; a.download='institute-backup.json'; a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('rf').addEventListener('change',ev=>{
    const f=ev.target.files[0]; if(!f) return;
    const r=new FileReader();
    r.onload=()=>{try{ s=m(JSON.parse(r.result)); save(); document.getElementById('instituteTitle').textContent=s.settings.instituteName; render(); alert('Data restored.'); }catch{ alert('Invalid backup file.'); }};
    r.readAsText(f);
  });
}
