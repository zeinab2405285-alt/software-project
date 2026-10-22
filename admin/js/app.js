const pageTitles={dashboard:"Dashboard",students:"Students",teachers:"Teachers",courses:"Courses",enrollments:"Enrollments",academics:"Grades & Attendance",reports:"Reports",announcements:"Announcements"};
let activePage="dashboard";
function toast(message){const el=document.getElementById("toast");el.textContent=message;el.classList.add("show");clearTimeout(window.__sisToast);window.__sisToast=setTimeout(()=>el.classList.remove("show"),2600);}
function openModal(title,body,onSubmit){closeModal();const backdrop=document.createElement("div");backdrop.className="modal-backdrop";backdrop.id="active-modal";backdrop.innerHTML=`<section class="modal" role="dialog" aria-modal="true" aria-label="${SIS.escape(title)}"><div class="modal-head"><h2>${SIS.escape(title)}</h2><button class="modal-close" data-action="close-modal" aria-label="Close">×</button></div>${body}</section>`;backdrop.addEventListener("click",e=>{if(e.target===backdrop)closeModal();});document.body.appendChild(backdrop);const form=backdrop.querySelector("#record-form");if(form)form.addEventListener("submit",e=>{e.preventDefault();onSubmit(form);});}
function closeModal(){document.getElementById("active-modal")?.remove();}
function renderDashboard(){
 const pending=SIS.data.enrollments.filter(e=>e.status==="Pending").length;
 const recent=SIS.data.students.slice(-4).reverse().map(s=>`<tr><td>${SIS.person(s.name,s.id)}</td><td>${SIS.escape(s.department)}</td><td>Year ${SIS.escape(s.year)}</td><td>${SIS.status(s.status)}</td></tr>`).join("");
 return `<div class="welcome-row"><div><h2>Welcome back, Administrator 👋</h2><p>Here is what's happening across your institution today.</p></div><button class="btn btn-primary" data-action="add-student">＋ Add student</button></div>
 <div class="stats-grid">
 <div class="stat-card"><div class="stat-top">Total students <span class="stat-icon">♙</span></div><div class="stat-number">${SIS.data.students.length}</div><div class="stat-foot"><b>●</b> ${SIS.data.students.filter(s=>s.status==="Active").length} active students</div></div>
 <div class="stat-card"><div class="stat-top">Teachers <span class="stat-icon">♧</span></div><div class="stat-number">${SIS.data.teachers.length}</div><div class="stat-foot">${SIS.data.teachers.filter(t=>t.status==="Active").length} active instructors</div></div>
 <div class="stat-card"><div class="stat-top">Courses <span class="stat-icon">▤</span></div><div class="stat-number">${SIS.data.courses.length}</div><div class="stat-foot">${SIS.data.courses.filter(c=>c.status==="Active").length} active courses</div></div>
 <div class="stat-card"><div class="stat-top">Pending enrollments <span class="stat-icon">◷</span></div><div class="stat-number">${pending}</div><div class="stat-foot">${pending?"Awaiting your review":"No pending requests"}</div></div></div>
 <div class="dashboard-grid"><div class="panel"><div class="panel-header"><div><h3>Recently added students</h3><p>Latest student records in the system</p></div><button class="link-button" data-page="students">View all →</button></div><div class="table-wrap"><table><thead><tr><th>Student</th><th>Department</th><th>Year</th><th>Status</th></tr></thead><tbody>${recent||'<tr><td colspan="4" class="empty-state">No students yet.</td></tr>'}</tbody></table></div></div>
 <div class="panel"><div class="panel-header"><div><h3>Quick actions</h3><p>Common administration tasks</p></div></div><div class="quick-grid"><button class="quick-action" data-action="add-student"><span class="qa-icon">＋</span><strong>Add student</strong><small>Create a student profile</small></button><button class="quick-action" data-action="add-teacher"><span class="qa-icon">♧</span><strong>Add teacher</strong><small>Register an instructor</small></button><button class="quick-action" data-action="add-course"><span class="qa-icon">▤</span><strong>Create course</strong><small>Update course catalog</small></button><button class="quick-action" data-page="reports"><span class="qa-icon">▥</span><strong>View reports</strong><small>Review academic summaries</small></button></div></div></div>
 <div class="panel" style="margin-top:18px"><div class="panel-header"><div><h3>Pending enrollment requests</h3><p>Requests that need administrator review</p></div><button class="link-button" data-page="enrollments">Manage requests →</button></div>${pending?`<p class="muted">There are <strong>${pending}</strong> pending request(s). Open Enrollments to approve or reject them.</p>`:'<p class="muted">You are all caught up. There are no pending enrollment requests.</p>'}</div>`;
}
function renderPage(page){
 activePage=page;document.getElementById("page-title").textContent=pageTitles[page]||"Dashboard";
 document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
 const renderers={dashboard:renderDashboard,students:renderStudents,teachers:renderTeachers,courses:renderCourses,enrollments:renderEnrollments,academics:renderAcademics,reports:renderReports,announcements:renderAnnouncements};
 document.getElementById("page-content").innerHTML=(renderers[page]||renderDashboard)();
 document.getElementById("pending-badge").textContent=SIS.data.enrollments.filter(e=>e.status==="Pending").length;
 const binders={students:bindStudents,teachers:bindTeachers,courses:bindCourses,enrollments:bindEnrollments,academics:bindAcademics};
 binders[page]?.();document.getElementById("sidebar").classList.remove("open");
}
function deleteRecord(key,id,label,page){const item=SIS.data[key].find(x=>x.id===id);if(!item)return;if(!confirm(`Delete ${label} "${item.name||item.title||item.id}"? This cannot be undone in this browser.`))return;SIS.data[key]=SIS.data[key].filter(x=>x.id!==id);SIS.save(key);renderPage(page);toast(`${label} deleted`);}
document.addEventListener("click",e=>{
 const pageBtn=e.target.closest("[data-page]");if(pageBtn){renderPage(pageBtn.dataset.page);return;}
 const btn=e.target.closest("[data-action]");if(!btn)return;const action=btn.dataset.action,id=btn.dataset.id;
 const find=(key)=>SIS.data[key].find(x=>x.id===id);
 switch(action){
 case "close-modal":closeModal();break;
 case "add-student":studentForm();break;case "edit-student":studentForm(find("students"));break;case "delete-student":deleteRecord("students",id,"student","students");break;
 case "add-teacher":teacherForm();break;case "edit-teacher":teacherForm(find("teachers"));break;case "delete-teacher":deleteRecord("teachers",id,"teacher","teachers");break;
 case "add-course":courseForm();break;case "edit-course":courseForm(find("courses"));break;case "delete-course":deleteRecord("courses",id,"course","courses");break;
 case "add-enrollment":enrollmentForm();break;
 case "approve-enrollment":{const x=find("enrollments");if(x){x.status="Approved";SIS.save("enrollments");renderPage("enrollments");toast("Enrollment approved");}break;}
 case "reject-enrollment":{const x=find("enrollments");if(x){x.status="Rejected";SIS.save("enrollments");renderPage("enrollments");toast("Enrollment rejected");}break;}
 case "add-academic":academicForm();break;case "edit-academic":academicForm(find("academics"));break;
 case "add-announcement":announcementForm();break;case "edit-announcement":announcementForm(find("announcements"));break;case "delete-announcement":deleteRecord("announcements",id,"announcement","announcements");break;
 case "export-report":exportCSV("academics","sis-academic-report.csv");break;case "export-students":exportCSV("students","sis-students.csv");break;case "export-academics":exportCSV("academics","sis-grades-attendance.csv");break;
 }
});
document.getElementById("menu-toggle").addEventListener("click",()=>document.getElementById("sidebar").classList.toggle("open"));
document.getElementById("logout-btn").addEventListener("click",()=>toast("Demo mode: connect authentication before enabling sign out."));
document.getElementById("today-label").textContent=new Intl.DateTimeFormat("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"}).format(new Date());
renderPage("dashboard");
