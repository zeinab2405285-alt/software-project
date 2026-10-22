/* Demo data and browser storage. This is not a secure production database. */
const SIS = (() => {
  const seed = {
    students: [
      {id:"STU-1001",name:"Mariam Adel",email:"mariam.adel@example.com",department:"Computer Engineering",year:"3",status:"Active"},
      {id:"STU-1002",name:"Omar Hassan",email:"omar.hassan@example.com",department:"Mechatronics",year:"2",status:"Active"},
      {id:"STU-1003",name:"Nour Ahmed",email:"nour.ahmed@example.com",department:"Electrical Engineering",year:"4",status:"Active"},
      {id:"STU-1004",name:"Karim Samir",email:"karim.samir@example.com",department:"Computer Engineering",year:"1",status:"Inactive"},
      {id:"STU-1005",name:"Salma Tarek",email:"salma.tarek@example.com",department:"Communications",year:"3",status:"Active"}
    ],
    teachers: [
      {id:"TCH-201",name:"Dr. Hany Mostafa",email:"hany.mostafa@example.com",department:"Computer Engineering",specialty:"Algorithms",status:"Active"},
      {id:"TCH-202",name:"Dr. Dina Khaled",email:"dina.khaled@example.com",department:"Electrical Engineering",specialty:"Circuits",status:"Active"},
      {id:"TCH-203",name:"Eng. Amr Fathy",email:"amr.fathy@example.com",department:"Mechatronics",specialty:"Control Systems",status:"Active"}
    ],
    courses: [
      {id:"CS301",name:"Data Structures",teacher:"Dr. Hany Mostafa",department:"Computer Engineering",credits:3,capacity:40,status:"Active"},
      {id:"EE204",name:"Circuit Design",teacher:"Dr. Dina Khaled",department:"Electrical Engineering",credits:3,capacity:35,status:"Active"},
      {id:"ME220",name:"Control Systems",teacher:"Eng. Amr Fathy",department:"Mechatronics",credits:4,capacity:30,status:"Active"}
    ],
    enrollments: [
      {id:"EN-5001",student:"Mariam Adel",course:"Data Structures",date:"2026-10-12",status:"Pending"},
      {id:"EN-5002",student:"Omar Hassan",course:"Control Systems",date:"2026-10-13",status:"Approved"},
      {id:"EN-5003",student:"Salma Tarek",course:"Data Structures",date:"2026-10-15",status:"Pending"}
    ],
    academics: [
      {id:"AC-01",student:"Mariam Adel",course:"Data Structures",grade:"A-",attendance:92,status:"Present"},
      {id:"AC-02",student:"Omar Hassan",course:"Control Systems",grade:"B+",attendance:86,status:"Present"},
      {id:"AC-03",student:"Nour Ahmed",course:"Circuit Design",grade:"A",attendance:78,status:"Absent"},
      {id:"AC-04",student:"Salma Tarek",course:"Data Structures",grade:"B",attendance:95,status:"Present"}
    ],
    announcements: [
      {id:"ANN-01",title:"Midterm examination schedule",body:"The midterm examination schedule will be published on the student portal. Please check course announcements regularly.",audience:"All students",date:"2026-10-10",status:"Published"},
      {id:"ANN-02",title:"Course registration reminder",body:"Students should review their course selections and prerequisites before the registration deadline.",audience:"All students",date:"2026-10-15",status:"Published"}
    ]
  };
  const keys = Object.keys(seed);
  const load = key => {
    try { const saved = localStorage.getItem("sis_admin_" + key); return saved ? JSON.parse(saved) : structuredClone(seed[key]); }
    catch { return JSON.parse(JSON.stringify(seed[key])); }
  };
  const data = Object.fromEntries(keys.map(k => [k, load(k)]));
  const save = key => localStorage.setItem("sis_admin_" + key, JSON.stringify(data[key]));
  const nextId = (prefix, list) => {
    const n = list.reduce((m, x) => Math.max(m, Number((x.id.match(/\d+/)||[0])[0])), 0) + 1;
    return prefix + n;
  };
  const escape = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const initials = name => String(name||"?").split(/\s+/).slice(0,2).map(x=>x[0]||"").join("").toUpperCase();
  const status = value => `<span class="status ${String(value).toLowerCase()}">${escape(value)}</span>`;
  const person = (name, sub="") => `<div class="person"><div class="mini-avatar">${initials(name)}</div><div><strong>${escape(name)}</strong>${sub?`<small>${escape(sub)}</small>`:""}</div></div>`;
  return {data, save, nextId, escape, initials, status, person};
})();
