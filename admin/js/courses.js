function renderCourses(){
 const rows=SIS.data.courses.map(c=>`<tr><td><strong>${SIS.escape(c.id)}</strong><small class="muted"> · ${SIS.escape(c.department)}</small></td><td>${SIS.escape(c.name)}</td><td>${SIS.escape(c.teacher)}</td><td>${SIS.escape(c.credits)}</td><td>${SIS.escape(c.capacity)}</td><td>${SIS.status(c.status)}</td><td><div class="action-group"><button class="action-btn" data-action="edit-course" data-id="${c.id}">Edit</button><button class="action-btn delete" data-action="delete-course" data-id="${c.id}">Delete</button></div></td></tr>`).join("");
 return `<div class="welcome-row"><div><h2>Course catalog</h2><p>Create courses and assign teachers, credits, and capacity.</p></div><button class="btn btn-primary" data-action="add-course">＋ Add course</button></div><div class="panel"><div class="toolbar"><div class="search-box"><span>⌕</span><input id="course-search" placeholder="Search courses or instructors..."></div></div><div class="table-wrap"><table><thead><tr><th>Course ID</th><th>Course name</th><th>Instructor</th><th>Credits</th><th>Capacity</th><th>Status</th><th>Actions</th></tr></thead><tbody id="course-table">${rows}</tbody></table></div></div>`;
}
function bindCourses(){document.getElementById("course-search").addEventListener("input",e=>document.querySelectorAll("#course-table tr").forEach(r=>r.hidden=!r.textContent.toLowerCase().includes(e.target.value.toLowerCase())));}
function courseForm(item={}){
 const editing=!!item.id;
 openModal(editing?"Edit course":"Add course",`<form id="record-form"><div class="form-grid">
 <label>Course ID<input name="id" required value="${SIS.escape(item.id||"")}" ${editing?"readonly":""} placeholder="e.g. CS401"></label>
 <label>Course name<input name="name" required value="${SIS.escape(item.name||"")}"></label>
 <label class="full">Instructor<select name="teacher">${SIS.data.teachers.map(t=>`<option ${item.teacher===t.name?"selected":""}>${SIS.escape(t.name)}</option>`).join("")}</select></label>
 <label>Department<select name="department">${["Computer Engineering","Electrical Engineering","Mechatronics","Communications","Mechanical Engineering","Civil Engineering"].map(x=>`<option ${item.department===x?"selected":""}>${x}</option>`).join("")}</select></label>
 <label>Credits<input type="number" name="credits" min="1" max="10" required value="${SIS.escape(item.credits||3)}"></label>
 <label>Capacity<input type="number" name="capacity" min="1" required value="${SIS.escape(item.capacity||30)}"></label>
 <label>Status<select name="status"><option ${item.status==="Active"||!item.status?"selected":""}>Active</option><option ${item.status==="Inactive"?"selected":""}>Inactive</option></select></label>
 </div><div class="modal-actions"><button type="button" class="btn btn-secondary" data-action="close-modal">Cancel</button><button class="btn btn-primary">${editing?"Save changes":"Create course"}</button></div></form>`,form=>{const v=Object.fromEntries(new FormData(form));v.credits=Number(v.credits);v.capacity=Number(v.capacity);if(editing)Object.assign(item,v);else SIS.data.courses.push(v);SIS.save("courses");closeModal();renderPage("courses");toast(editing?"Course updated":"Course created");});
}
