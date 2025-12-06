/**
 * Student Management Application Logic (Cloud Enabled)
 */

// State
let students = [];
let unsubscribe = null; // Firestore listener unsubscribe function
let currentUser = null;

// DOM Elements
const studentForm = document.getElementById('studentForm');
const studentList = document.getElementById('studentList');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('studentModal');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const totalStudentsEl = document.getElementById('totalStudents');
const feesDueEl = document.getElementById('feesDue');

// Helpers
const formatDate = (dateString) => {
    if (!dateString) return '';
    const [y, m, d] = dateString.split('-');
    return `${d}/${m}/${y}`;
};

const isFeeOverdue = (joiningDate) => {
    if (!joiningDate) return false;
    const join = new Date(joiningDate);
    const today = new Date();
    const dueDate = new Date(join);
    dueDate.setMonth(dueDate.getMonth() + 1);
    return today > dueDate;
};

// Filter & Sort State
let currentSort = 'date';
let filterOverdue = false;

// Sort & Filter Handlers
window.toggleFeeFilter = () => {
    filterOverdue = !filterOverdue;
    renderStudents();
    showToast(filterOverdue ? 'Showing overdue students' : 'Showing all students');
};

window.setSort = (type) => {
    currentSort = type;
    document.getElementById('sortMenu').classList.add('hidden');
    renderStudents();
    showToast(`Sorted by ${type}`);
};

// Toast Helper
const showToast = (message, type = 'success') => {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        document.body.appendChild(toast);
    }
    toast.className = `toast ${type === 'error' ? 'error' : ''}`;
    toast.innerHTML = type === 'success'
        ? `<i class="fas fa-check-circle"></i> ${message}`
        : `<i class="fas fa-exclamation-circle"></i> ${message}`;
    void toast.offsetWidth;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
};

// --- CORE CLOUD LOGIC (Firestore) ---

// 1. Initialize Real-time Listener
const initRealtimeListener = (user) => {
    if (unsubscribe) unsubscribe(); // Unsubscribe prev listener if any

    // Query: Get students created by THIS teacher
    const q = db.collection('students').where('teacherId', '==', user.uid);

    unsubscribe = q.onSnapshot((snapshot) => {
        const source = snapshot.metadata.hasPendingWrites ? "Local" : "Server";
        console.log("Data source: " + source);

        students = [];
        snapshot.forEach((doc) => {
            students.push({ id: doc.id, ...doc.data() });
        });

        updateDashboard();
        renderStudents();
        updateCourseOptions(); // Dynamic courses
    }, (error) => {
        console.error("Sync Error:", error);
        showToast("Sync Error: " + error.message, 'error');
    });
};

// 2. Add Student (Cloud)
const addStudent = async (studentData) => {
    try {
        await db.collection('students').add({
            ...studentData,
            teacherId: currentUser.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        showToast('Student saved to cloud!');
    } catch (e) {
        console.error(e);
        showToast('Error saving: ' + e.message, 'error');
    }
};

// 3. Update Student (Cloud)
const updateStudent = async (id, updatedData) => {
    try {
        await db.collection('students').doc(id).update(updatedData);
        showToast('Student updated!');
    } catch (e) {
        console.error(e);
        showToast('Error updating: ' + e.message, 'error');
    }
};

// 4. Delete Student (Cloud)
const deleteStudent = async (id) => {
    if (confirm('Are you sure you want to delete this student?')) {
        try {
            await db.collection('students').doc(id).delete();
            showToast('Student deleted.', 'error');
        } catch (e) {
            console.error(e);
            showToast('Error deleting: ' + e.message, 'error');
        }
    }
};

const getStudent = (id) => students.find(s => s.id === id);


// UI Rendering
const updateDashboard = () => {
    totalStudentsEl.textContent = students.length;
    const dueCount = students.filter(s => !s.feePaid && isFeeOverdue(s.joiningDate)).length;
    feesDueEl.textContent = dueCount;
};

const renderStudents = (filterText = '') => {
    studentList.innerHTML = '';

    // 1. Filter
    let filtered = students.filter(s =>
        (s.name.toLowerCase().includes(filterText.toLowerCase()) ||
            s.rollNumber.toLowerCase().includes(filterText.toLowerCase())) &&
        (!filterOverdue || (!s.feePaid && isFeeOverdue(s.joiningDate)))
    );

    // 2. Sort
    filtered.sort((a, b) => {
        if (currentSort === 'name') return a.name.localeCompare(b.name);
        if (currentSort === 'roll') return a.rollNumber.localeCompare(b.rollNumber, undefined, { numeric: true });
        if (currentSort === 'date') return new Date(b.joiningDate) - new Date(a.joiningDate);
        return 0;
    });

    if (filtered.length === 0) {
        // ... (Empty state HTML remains same)
        studentList.innerHTML = `
            <div class="col-span-full py-12 flex flex-col items-center justify-center text-center glass rounded-2xl border-dashed border-2 border-gray-300">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <i class="fas fa-user-graduate text-3xl text-gray-400"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-700">No Students Found</h3>
                <p class="text-gray-500 mt-1 max-w-xs">
                    ${filterOverdue ? 'Great job! No students have overdue fees.' : 'Add your first student to get started.'}
                </p>
                ${!filterOverdue ? `<button onclick="toggleModal(true)" class="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">Add First Student</button>` : ''}
            </div>
        `;
        return;
    }

    filtered.forEach((s, index) => {
        const overdue = !s.feePaid && isFeeOverdue(s.joiningDate);
        const card = document.createElement('div');
        card.className = `glass student-card bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all animate-fade-in relative overflow-hidden border-l-[6px] ${overdue ? 'border-red-500' : 'border-emerald-500'}`;
        card.style.animationDelay = `${index * 0.05}s`;

        card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div>
                    <h3 class="font-bold text-xl text-gray-800 tracking-tight">${s.name}</h3>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200">${s.course}</span>
                        <span class="text-xs text-gray-400">#${s.rollNumber}</span>
                    </div>
                </div>
                <div class="flex flex-col items-end gap-1">
                     <span class="px-3 py-1 rounded-full text-xs font-bold shadow-sm ${s.feePaid ? 'bg-emerald-100 text-emerald-700' : (overdue ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-amber-100 text-amber-700')}">
                        ${s.feePaid ? 'PAID' : (overdue ? 'OVERDUE' : 'PENDING')}
                    </span>
                    <span class="text-xs font-semibold text-gray-500">₹${s.fee}</span>
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600 mb-4 mt-4 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500"><i class="fas fa-phone text-xs"></i></div>
                    <span class="truncate">${s.phone}</span>
                </div>
                <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-pink-50 flex items-center justify-center text-pink-500"><i class="fas fa-calendar-alt text-xs"></i></div>
                    <span class="truncate">${formatDate(s.joiningDate)}</span>
                </div>
                 <div class="col-span-2 flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><i class="fas fa-map-marker-alt text-xs"></i></div>
                    <span class="truncate">${s.address || 'No address provided'}</span>
                </div>
                ${s.note ? `
                <div class="col-span-2 flex items-start gap-2 mt-1 pt-2 border-t border-gray-200/50">
                    <div class="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shrink-0"><i class="fas fa-sticky-note text-xs"></i></div>
                    <span class="italic text-gray-500 text-xs leading-relaxed line-clamp-2">${s.note}</span>
                </div>` : ''}
            </div>

            <div class="flex gap-3 mt-4">
                <button onclick="handleEdit('${s.id}')" class="flex-1 py-2.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white font-semibold text-sm transition-all duration-300 shadow-sm hover:shadow-indigo-200">
                    Edit Details
                </button>
                ${overdue ? `
                <button onclick="sendReminder('${s.id}')" title="Send WhatsApp Reminder" class="px-4 py-2.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-500 hover:text-white transition-colors shadow-sm border border-green-100">
                    <i class="fab fa-whatsapp text-lg"></i>
                </button>` : ''}
                <button onclick="deleteStudent('${s.id}')" class="px-4 py-2.5 rounded-xl bg-white border border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        studentList.appendChild(card);
    });
};

// Event Handlers
let isEditingId = null;

const toggleModal = (show) => {
    if (show) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    } else {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        studentForm.reset();
        isEditingId = null;
        document.getElementById('modalTitle').textContent = 'Add New Student';
    }
};

openModalBtn.addEventListener('click', () => toggleModal(true));
closeModalBtn.addEventListener('click', () => toggleModal(false));
modal.addEventListener('click', (e) => {
    if (e.target === modal) toggleModal(false);
});

studentForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(studentForm);
    const studentData = {
        name: formData.get('name'),
        rollNumber: formData.get('rollNumber'),
        course: formData.get('course'),
        fee: formData.get('fee'),
        joiningDate: formData.get('joiningDate'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        note: formData.get('note'),
        feePaid: formData.get('feePaid') === 'on'
    };

    if (isEditingId) {
        updateStudent(isEditingId, studentData);
    } else {
        addStudent(studentData);
    }
    toggleModal(false);
});

searchInput.addEventListener('input', (e) => {
    renderStudents(e.target.value);
});

// Windows Global functions
// 5. Send Reminder (WhatsApp)
const sendReminder = async (id) => {
    const s = getStudent(id);
    if (!s) return;

    // 1. Construct Message
    const dueDate = new Date(s.joiningDate);
    dueDate.setMonth(dueDate.getMonth() + 1);
    const dateStr = dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

    // Greeting based on time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : (hour < 17 ? "Good afternoon" : "Good evening");

    const message = `*Fee Reminder from Student Manager* 🎓%0A%0A${greeting} ${s.name},%0A%0AThis is a gentle reminder that your fee of *₹${s.fee}* for course *${s.course}* is due since *${dateStr}*.%0A%0APlease pay at the earliest to avoid late charges.%0A%0AThank you!`;

    // 2. Open WhatsApp
    // Remove '+' or spaces from phone for the link
    const cleanPhone = s.phone.replace(/\D/g, '');
    // Default to India code +91 if length is 10
    const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const url = `https://wa.me/${finalPhone}?text=${message}`;
    window.open(url, '_blank');

    // 3. Log it (Optional: update 'lastReminded' in DB)
    try {
        await db.collection('students').doc(id).update({
            lastReminded: firebase.firestore.FieldValue.serverTimestamp()
        });
        showToast('Reminder opened in WhatsApp');
    } catch (e) {
        console.error("Log error", e);
    }
};

window.sendReminder = sendReminder;
window.deleteStudent = deleteStudent;
window.handleEdit = (id) => {
    const s = getStudent(id);
    if (!s) return;
    isEditingId = s.id;
    document.querySelector('[name="name"]').value = s.name;
    document.querySelector('[name="rollNumber"]').value = s.rollNumber;
    document.querySelector('[name="course"]').value = s.course;
    document.querySelector('[name="fee"]').value = s.fee;
    document.querySelector('[name="joiningDate"]').value = s.joiningDate;
    document.querySelector('[name="phone"]').value = s.phone;
    document.querySelector('[name="address"]').value = s.address;
    document.querySelector('[name="note"]').value = s.note || '';
    document.querySelector('[name="feePaid"]').checked = s.feePaid;
    document.getElementById('modalTitle').textContent = 'Edit Student';
    toggleModal(true);
};

// --- New Features ---
const updateCourseOptions = () => {
    const courses = [...new Set(students.map(s => s.course).filter(Boolean))];
    const datalist = document.getElementById('courseOptions');
    if (datalist) datalist.innerHTML = courses.map(c => `<option value="${c}">`).join('');
};

window.downloadCSV = () => {
    if (students.length === 0) return showToast('No data to export', 'error');
    const headers = ['Name,Course,Roll No,Phone,Joining Date,Fee,Paid,Address'];
    const rows = students.map(s =>
        [s.name, s.course, s.rollNumber, s.phone, s.joiningDate, s.fee, s.feePaid ? 'Yes' : 'No', `"${s.address || ''}"`].join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV downloaded!');
};

// UI Listeners (Sort/Settings)
const sortBtn = document.getElementById('sortBtn');
const sortMenu = document.getElementById('sortMenu');
if (sortBtn && sortMenu) {
    sortBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sortMenu.classList.toggle('hidden');
    });
    document.addEventListener('click', (e) => {
        if (!sortMenu.contains(e.target) && !sortBtn.contains(e.target)) {
            sortMenu.classList.add('hidden');
        }
    });
}
const settingsBtn = document.getElementById('settingsBtn');
const settingsMenu = document.getElementById('settingsMenu');
if (settingsBtn && settingsMenu) {
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsMenu.classList.toggle('hidden');
    });
    document.addEventListener('click', (e) => {
        if (!settingsMenu.contains(e.target) && e.target !== settingsBtn) {
            settingsMenu.classList.add('hidden');
        }
    });
}


// --- INITIALIZATION ---
// Wait for auth to be ready (listener in index.html handles the redirect)
if (typeof auth !== 'undefined') {
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log("Logged in as:", user.email);
            currentUser = user;
            initRealtimeListener(user); // Start syncing data
        } else {
            console.log("No user logged in, waiting for redirect...");
        }
    });
} else {
    // If auth is undefined, we might be on a page without firebase (rare) or scripts failed
    console.error("Auth object missing. Scripts loaded?");
}
