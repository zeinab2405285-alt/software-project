function renderTeachers(){
 const rows=SIS.data.teachers.map(t=>`<tr><td>${SIS.person(t.name,t.id)}</td><td>${SIS.escape(t.email)}</td><td>${SIS.escape(t.department)}</td><td>${SIS.escape(t.specialty)}</td><td>${SIS.status(t.status)}</td><td><div class="action-group"><button class="action-btn" data-action="edit-teacher" data-id="${t.id}">Edit</button><button class="action-btn delete" data-action="delete-teacher" data-id="${t.id}">Delete</button></div></td></tr>`).join("");
 return `<div class="welcome-row"><div><h2>Teacher directory</h2><p>Maintain instructor profiles, departments, and specialties.</p></div><button class="btn btn-primary" data-action="add-teacher">＋ Add teacher</button></div><div class="panel"><div class="toolbar"><div class="search-box"><span>⌕</span><input id="teacher-search" placeholder="Search teachers..."></div></div><div class="table-wrap"><table><thead><tr><th>Teacher</th><th>Email</th><th>Department</th><th>Specialty</th><th>Status</th><th>Actions</th></tr></thead><tbody id="teacher-table">${rows}</tbody></table></div></div>`;
}
function bindTeachers(){document.getElementById("teacher-search").addEventListener("input",e=>document.querySelectorAll("#teacher-table tr").forEach(r=>r.hidden=!r.textContent.toLowerCase().includes(e.target.value.toLowerCase())));}
function teacherForm(item={}){
 const editing=!!item.id;
 openModal(editing?"Edit teacher":"Add teacher",`<form id="record-form"><div class="form-grid">
 <label>Full name<input name="name" required value="${SIS.escape(item.name||"")}"></label><label>Email<input type="email" name="email" required value="${SIS.escape(item.email||"")}"></label>
 <label>Department<select name="department">${["Computer Engineering","Electrical Engineering","Mechatronics","Communications","Mechanical Engineering","Civil Engineering"].map(x=>`<option ${item.department===x?"selected":""}>${x}</option>`).join("")}</select></label>
 <label>Specialty<input name="specialty" required value="${SIS.escape(item.specialty||"")}" placeholder="e.g. Algorithms"></label>
 <label class="full">Status<select name="status"><option ${item.status==="Active"||!item.status?"selected":""}>Active</option><option ${item.status==="Inactive"?"selected":""}>Inactive</option></select></label>
 </div><div class="modal-actions"><button type="button" class="btn btn-secondary" data-action="close-modal">Cancel</button><button class="btn btn-primary">${editing?"Save changes":"Create teacher"}</button></div></form>`,form=>{const v=Object.fromEntries(new FormData(form));if(editing)Object.assign(item,v);else SIS.data.teachers.push({id:SIS.nextId("TCH-",SIS.data.teachers),...v});SIS.save("teachers");closeModal();renderPage("teachers");toast(editing?"Teacher updated":"Teacher created");});
}
