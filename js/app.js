// ==========================================
// S.I.G.A. - Logica Principal y Router
// Maneja navegacion, eventos y CRUD
// ==========================================

const App = {
    currentView: 'dashboard',
    calYear: new Date().getFullYear(),
    calMonth: new Date().getMonth(),

    // ==========================================
    // INIT
    // ==========================================
    init() {
        DB.seed();
        this.setupLogin();
        this.setupNav();
        this.setupModal();
        this.setupMobile();
        this.setupMainEvents();

        // Si ya hay sesion activa, ir directo al app
        const user = DB.getCurrentUser();
        if (user) this.enterApp();
    },

    // ==========================================
    // LOGIN
    // ==========================================
    setupLogin() {
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const user = DB.getById('usuario', 'email', email);
            const errorEl = document.getElementById('login-error');
            if (!user) {
                errorEl.textContent = 'Usuario no encontrado. Verifica tu email.';
                document.getElementById('login-email').style.borderColor = 'var(--danger)';
                setTimeout(() => {
                    errorEl.textContent = '';
                    document.getElementById('login-email').style.borderColor = '';
                }, 3000);
                return;
            }
            DB.setCurrentUser(user);
            this.enterApp();
        });
    },

    enterApp() {
        const user = DB.getCurrentUser();
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app-shell').classList.remove('hidden');
        document.getElementById('sidebar-user').innerHTML = `
            <div class="sidebar-user-name">${user.NombreyApeAlumn}</div>
            <div class="sidebar-user-email">${user.email}</div>
        `;
        this.navigate('dashboard');
    },

    // ==========================================
    // NAVIGATION
    // ==========================================
    setupNav() {
        document.getElementById('sidebar-nav').addEventListener('click', (e) => {
            const item = e.target.closest('[data-view]');
            if (!item) return;
            this.navigate(item.dataset.view);
            this.closeSidebar();
        });
        document.getElementById('btn-logout').addEventListener('click', () => {
            DB.logout();
            document.getElementById('app-shell').classList.add('hidden');
            document.getElementById('login-screen').classList.remove('hidden');
            document.getElementById('login-email').value = '';
        });
    },

    navigate(view) {
        this.currentView = view;
        // Update sidebar active state
        document.querySelectorAll('.nav-item[data-view]').forEach(item => {
            item.classList.toggle('active', item.dataset.view === view);
        });
        // Render view
        this.render();
    },

    render() {
        const main = document.getElementById('main-content');
        let html = '';
        switch (this.currentView) {
            case 'dashboard':  html = Views.dashboard(); break;
            case 'plan':       html = Views.plan(); break;
            case 'materias':   html = Views.materias(); break;
            case 'examenes':   html = Views.examenes(this.calYear, this.calMonth); break;
            case 'apuntes':    html = Views.apuntes(); break;
            case 'profesores': html = Views.profesores(); break;
        }
        main.innerHTML = html;
        main.scrollTop = 0;
    },

    // ==========================================
    // MAIN EVENT DELEGATION
    // ==========================================
    setupMainEvents() {
        document.getElementById('main-content').addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;
            const action = target.dataset.action;

            switch (action) {
                // Navigation
                case 'goto':
                    this.navigate(target.dataset.view);
                    break;

                // Plan de Carrera - inscribir/desinscribir
                case 'inscribir':
                    this.inscribirMateria(parseInt(target.dataset.materia));
                    break;
                case 'desinscribir':
                    this.desinscribirMateria(parseInt(target.dataset.materia));
                    break;

                // Calendar
                case 'cal-prev': {
                    let m = parseInt(target.dataset.month) - 1;
                    let y = parseInt(target.dataset.year);
                    if (m < 0) { m = 11; y--; }
                    this.calMonth = m; this.calYear = y;
                    this.render();
                    break;
                }
                case 'cal-next': {
                    let m = parseInt(target.dataset.month) + 1;
                    let y = parseInt(target.dataset.year);
                    if (m > 11) { m = 0; y++; }
                    this.calMonth = m; this.calYear = y;
                    this.render();
                    break;
                }
                case 'cal-day':
                    // Could show day detail - future enhancement
                    break;

                // Examenes CRUD
                case 'add-examen':
                    this.openModal(Views.modalExamen(null));
                    this.setupExamenForm();
                    break;
                case 'edit-examen': {
                    const ex = DB.getById('examen', 'id_examen', parseInt(target.dataset.id));
                    if (ex) { this.openModal(Views.modalExamen(ex)); this.setupExamenForm(); }
                    break;
                }
                case 'del-examen':
                    if (confirm('¿Eliminar este examen?')) {
                        DB.remove('examen', 'id_examen', parseInt(target.dataset.id));
                        this.toast('Examen eliminado', 'success');
                        this.render();
                    }
                    break;

                // Apuntes CRUD
                case 'add-apunte':
                    this.openModal(Views.modalApunte(null));
                    this.setupApunteForm();
                    break;
                case 'edit-apunte': {
                    const ap = DB.getById('apuntes', 'id_apunte', parseInt(target.dataset.id));
                    if (ap) { this.openModal(Views.modalApunte(ap)); this.setupApunteForm(); }
                    break;
                }
                case 'del-apunte':
                    if (confirm('¿Eliminar este apunte?')) {
                        const apId = parseInt(target.dataset.id);
                        DB.removeWhere('tipografia_apunte', { id_apunte: apId });
                        DB.remove('apuntes', 'id_apunte', apId);
                        this.toast('Apunte eliminado', 'success');
                        this.render();
                    }
                    break;
            }
        });
    },

    // ==========================================
    // INSCRIPCION DE MATERIAS
    // ==========================================
    inscribirMateria(idMateria) {
        const user = DB.getCurrentUser();
        const exists = DB.getWhere('cursa', { idMateria, email: user.email });
        if (exists.length > 0) return;
        DB.insert('cursa', { idMateria, email: user.email });
        this.toast('Te inscribiste a la materia', 'success');
        this.render();
    },

    desinscribirMateria(idMateria) {
        const user = DB.getCurrentUser();
        DB.removeWhere('cursa', { idMateria, email: user.email });
        this.toast('Te desinscribiste de la materia', 'info');
        this.render();
    },

    // ==========================================
    // EXAMEN FORM
    // ==========================================
    setupExamenForm() {
        const form = document.getElementById('form-examen');
        if (!form) return;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(form);
            const user = DB.getCurrentUser();
            const examId = form.dataset.examId;

            const data = {
                email: user.email,
                idmateria: parseInt(fd.get('idmateria')),
                TipoExamen: fd.get('TipoExamen'),
                fecha_hora_inicio: fd.get('fecha_hora_inicio'),
                fecha_hora_fin: fd.get('fecha_hora_fin') || null,
                CalificacionExamen: fd.get('CalificacionExamen') ? parseInt(fd.get('CalificacionExamen')) : null,
                descripcion: fd.get('descripcion') || null
            };

            // Validacion: hora fin > hora inicio
            if (data.fecha_hora_fin && data.fecha_hora_fin <= data.fecha_hora_inicio) {
                this.toast('La hora de fin debe ser posterior a la de inicio', 'error');
                return;
            }

            if (examId) {
                // Edit
                DB.update('examen', 'id_examen', parseInt(examId), data);
                this.toast('Examen actualizado', 'success');
            } else {
                // Create
                data.id_examen = DB.nextId('examen', 'id_examen');
                DB.insert('examen', data);
                this.toast('Examen creado', 'success');
            }
            this.closeModal();
            this.render();
        });
    },

    // ==========================================
    // APUNTE FORM
    // ==========================================
    setupApunteForm() {
        const form = document.getElementById('form-apunte');
        if (!form) return;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(form);
            const user = DB.getCurrentUser();
            const apunteId = form.dataset.apunteId;

            const data = {
                email: user.email,
                nombre: fd.get('nombre'),
                contenido: fd.get('contenido'),
                fecha_creacion: new Date().toISOString().slice(0,16)
            };

            const tipografiasStr = fd.get('tipografias') || '';
            const tipografias = tipografiasStr.split(',').map(t => t.trim()).filter(Boolean);

            let id;
            if (apunteId) {
                id = parseInt(apunteId);
                const orig = DB.getById('apuntes', 'id_apunte', id);
                data.fecha_creacion = orig.fecha_creacion; // preserve original date
                DB.update('apuntes', 'id_apunte', id, data);
                // Update tipografias: remove old, add new
                DB.removeWhere('tipografia_apunte', { id_apunte: id });
                this.toast('Apunte actualizado', 'success');
            } else {
                id = DB.nextId('apuntes', 'id_apunte');
                data.id_apunte = id;
                DB.insert('apuntes', data);
                this.toast('Apunte creado', 'success');
            }

            // Insert tipografias
            tipografias.forEach(tip => {
                DB.insert('tipografia_apunte', { tipografia: tip, id_apunte: id });
            });

            this.closeModal();
            this.render();
        });
    },

    // ==========================================
    // MODAL
    // ==========================================
    setupModal() {
        document.getElementById('modal-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'modal-overlay') this.closeModal();
            if (e.target.closest('[data-action="close-modal"]')) this.closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
    },

    openModal(html) {
        document.getElementById('modal-content').innerHTML = html;
        document.getElementById('modal-overlay').classList.remove('hidden');
    },

    closeModal() {
        document.getElementById('modal-overlay').classList.add('hidden');
    },

    // ==========================================
    // MOBILE
    // ==========================================
    setupMobile() {
        document.getElementById('hamburger-btn').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
            document.getElementById('sidebar-overlay').classList.toggle('active');
        });
        document.getElementById('sidebar-overlay').addEventListener('click', () => {
            this.closeSidebar();
        });
    },

    closeSidebar() {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebar-overlay').classList.remove('active');
    },

    // ==========================================
    // TOAST NOTIFICATIONS
    // ==========================================
    toast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const icons = { success: 'check_circle', error: 'error', info: 'info' };
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span class="material-symbols-outlined">${icons[type] || 'info'}</span> ${message}`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'toastOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// ==========================================
// START
// ==========================================
document.addEventListener('DOMContentLoaded', () => App.init());
