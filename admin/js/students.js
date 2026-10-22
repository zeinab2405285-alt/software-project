function renderStudents(){
 const rows=SIS.data.students.map(s=>`<tr><td>${SIS.person(s.name,s.id)}</td><td>${SIS.escape(s.email)}</td><td>${SIS.escape(s.department)}</td><td>Year ${SIS.escape(s.year)}</td><td>${SIS.status(s.status)}</td><td><div class="action-group"><button class="action-btn" data-action="edit-student" data-id="${s.id}">Edit</button><button class="action-btn delete" data-action="delete-student" data-id="${s.id}">Delete</button></div></td></tr>`).join("");
 return `<div class="welcome-row"><div><h2>Student records</h2><p>Manage student profiles, academic departments, and enrollment status.</p></div><button class="btn btn-primary" data-action="add-student">＋ Add student</button></div><div class="panel"><div class="toolbar"><div class="search-box"><span>⌕</span><input id="student-search" placeholder="Search name, ID, or email..."></div><select id="student-status-filter"><option value="">All statuses</option><option>Active</option><option>Inactive</option></select></div><div class="table-wrap"><table><thead><tr><th>Student</th><th>Email</th><th>Department</th><th>Year</th><th>Status</th><th>Actions</th></tr></thead><tbody id="student-table">${rows||`<tr><td colspan="6" class="empty-state">No student records found.</td></tr>`}</tbody></table></div><div class="pagination-note">${SIS.data.students.length} student record(s) · Demo records are stored in this browser</div></div>`;
}
function bindStudents(){
 const search=document.getElementById("student-search"), filter=document.getElementById("student-status-filter");
 const apply=()=>{const q=search.value.toLowerCase(),st=filter.value;document.querySelectorAll("#student-table tr").forEach(tr=>{tr.hidden=!tr.textContent.toLowerCase().includes(q)||(st&&!tr.textContent.includes(st));});};
 search.addEventListener("input",apply);filter.addEventListener("change",apply);
}
function studentForm(item={}){
 const editing=!!item.id;
 openModal(editing?"Edit student":"Add student",`<form id="record-form"><div class="form-grid">
 <label>Full name<input name="name" required value="${SIS.escape(item.name||"")}" placeholder="e.g. Ahmed Ali"></label>
 <label>Email address<input name="email" type="email" required value="${SIS.escape(item.email||"")}" placeholder="student@example.com"></label>
 <label class="full">Department<select name="department" required>${["Computer Engineering","Electrical Engineering","Mechatronics","Communications","Mechanical Engineering","Civil Engineering"].map(x=>`<option ${item.department===x?"selected":""}>${x}</option>`).join("")}</select></label>
 <label>Academic year<select name="year">${[1,2,3,4,5].map(x=>`<option value="${x}" ${String(item.year||1)===String(x)?"selected":""}>Year ${x}</option>`).join("")}</select></label>
 <label>Status<select name="status"><option ${item.status==="Active"||!item.status?"selected":""}>Active</option><option ${item.status==="Inactive"?"selected":""}>Inactive</option></select></label>
 </div><div class="modal-actions"><button type="button" class="btn btn-secondary" data-action="close-modal">Cancel</button><button class="btn btn-primary">${editing?"Save changes":"Create student"}</button></div></form>`,
 form=>{const v=Object.fromEntries(new FormData(form));if(editing)Object.assign(item,v);else SIS.data.students.push({id:SIS.nextId("STU-",SIS.data.students),...v});SIS.save("students");closeModal();renderPage("students");toast(editing?"Student updated":"Student created");});
}
