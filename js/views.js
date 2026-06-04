// ==========================================
// S.I.G.A. - Renderizado de Vistas
// Genera el HTML dinámico de cada sección
// ==========================================

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS_SEMANA = ['Lun','Mar','Mie','Jue','Vie','Sab','Dom'];
const TIPO_BADGE = {
    'Parcial': 'badge-blue',
    'Final': 'badge-purple',
    'Recuperatorio': 'badge-orange',
    'TP': 'badge-green'
};

const Views = {

    // ==========================================
    // DASHBOARD
    // ==========================================
    dashboard() {
        const user = DB.getCurrentUser();
        const cursa = DB.getWhere('cursa', { email: user.email });
        const examenes = DB.getWhere('examen', { email: user.email });
        const apuntes = DB.getWhere('apuntes', { email: user.email });
        const profesores = DB.getAll('profesor');
        const now = new Date().toISOString();
        const proximos = examenes
            .filter(e => e.fecha_hora_inicio >= now)
            .sort((a,b) => a.fecha_hora_inicio.localeCompare(b.fecha_hora_inicio))
            .slice(0, 4);

        return `
        <div class="page-header">
            <h1 class="page-title">
                <span class="material-symbols-outlined">dashboard</span>
                Bienvenido, ${user.NombreyApeAlumn.split(' ')[0]}
            </h1>
        </div>

        <div class="stats-grid">
            <div class="stat-card" data-action="goto" data-view="materias">
                <div class="stat-icon blue"><span class="material-symbols-outlined">menu_book</span></div>
                <div class="stat-info">
                    <h3>${cursa.length}</h3>
                    <p>Materias Cursando</p>
                </div>
            </div>
            <div class="stat-card" data-action="goto" data-view="examenes">
                <div class="stat-icon orange"><span class="material-symbols-outlined">event</span></div>
                <div class="stat-info">
                    <h3>${proximos.length}</h3>
                    <p>Examenes Proximos</p>
                </div>
            </div>
            <div class="stat-card" data-action="goto" data-view="apuntes">
                <div class="stat-icon green"><span class="material-symbols-outlined">description</span></div>
                <div class="stat-info">
                    <h3>${apuntes.length}</h3>
                    <p>Apuntes Creados</p>
                </div>
            </div>
            <div class="stat-card" data-action="goto" data-view="profesores">
                <div class="stat-icon purple"><span class="material-symbols-outlined">groups</span></div>
                <div class="stat-info">
                    <h3>${profesores.length}</h3>
                    <p>Profesores</p>
                </div>
            </div>
        </div>

        <div class="content-grid-2">
            <div class="card">
                <div class="card-header">
                    <span class="card-title"><span class="material-symbols-outlined">event</span> Proximos Examenes</span>
                    <button class="btn btn-sm btn-secondary" data-action="goto" data-view="examenes">Ver todos</button>
                </div>
                ${proximos.length === 0 ? '<div class="empty-state"><span class="material-symbols-outlined">event_available</span><p>No tienes examenes proximos</p></div>' :
                `<div class="exam-list">${proximos.map(e => {
                    const mat = DB.getById('materia','idMateria',e.idmateria);
                    const d = new Date(e.fecha_hora_inicio);
                    return `<div class="exam-item">
                        <div class="exam-date-box">
                            <span class="day">${d.getDate()}</span>
                            <span class="month">${MESES[d.getMonth()].slice(0,3)}</span>
                        </div>
                        <div class="exam-info">
                            <h4>${mat ? mat.NombreMateria : 'Materia'}</h4>
                            <p>${e.TipoExamen} · ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')} hs</p>
                        </div>
                        <span class="badge ${TIPO_BADGE[e.TipoExamen]||'badge-blue'}">${e.TipoExamen}</span>
                    </div>`;
                }).join('')}</div>`}
            </div>

            <div class="card">
                <div class="card-header">
                    <span class="card-title"><span class="material-symbols-outlined">menu_book</span> Materias que Cursas</span>
                    <button class="btn btn-sm btn-secondary" data-action="goto" data-view="materias">Ver todas</button>
                </div>
                ${cursa.length === 0 ? '<div class="empty-state"><span class="material-symbols-outlined">school</span><p>No estas inscripto en ninguna materia</p></div>' :
                `<div class="exam-list">${cursa.map(c => {
                    const mat = DB.getById('materia','idMateria',c.idMateria);
                    const dicta = DB.getWhere('dicta', { idMateria: c.idMateria });
                    const prof = dicta.length > 0 ? DB.getById('profesor','idProfe',dicta[0].idProfe) : null;
                    return `<div class="exam-item">
                        <div class="exam-date-box" style="font-size:1.3rem;">📖</div>
                        <div class="exam-info">
                            <h4>${mat ? mat.NombreMateria : '—'}</h4>
                            <p>${mat ? mat.AulaCursado : ''} ${prof ? '· Prof. ' + prof.NombreyApelProfe : ''}</p>
                        </div>
                    </div>`;
                }).join('')}</div>`}
            </div>
        </div>`;
    },

    // ==========================================
    // PLAN DE CARRERA
    // ==========================================
    plan() {
        const planes = DB.getAll('plandecarrera');
        const materias = DB.getAll('materia');
        const user = DB.getCurrentUser();
        const cursa = DB.getWhere('cursa', { email: user.email });
        const cursaIds = cursa.map(c => c.idMateria);

        return `
        <div class="page-header">
            <h1 class="page-title"><span class="material-symbols-outlined">school</span> Plan de Carrera</h1>
        </div>
        ${planes.map(plan => {
            const mats = materias.filter(m => m.id_plan === plan.IdPlan);
            return `
            <div class="card" style="margin-bottom:24px;animation-delay:${planes.indexOf(plan)*0.1}s">
                <div class="card-header">
                    <span class="card-title"><span class="material-symbols-outlined">calendar_month</span> Plan ${plan.anio_plan}</span>
                    <span class="badge badge-blue">${mats.length} materias</span>
                </div>
                <div class="table-wrapper">
                    <table>
                        <thead><tr><th>Materia</th><th>Aula</th><th>Descripcion</th><th>Estado</th><th>Accion</th></tr></thead>
                        <tbody>
                        ${mats.map(m => {
                            const inscripto = cursaIds.includes(m.idMateria);
                            return `<tr>
                                <td><strong>${m.NombreMateria}</strong></td>
                                <td>${m.AulaCursado}</td>
                                <td style="color:var(--text-secondary)">${m.Descripcion || '—'}</td>
                                <td>${inscripto ? '<span class="badge badge-green">Cursando</span>' : '<span class="badge badge-orange">No inscripto</span>'}</td>
                                <td>${inscripto ?
                                    `<button class="btn btn-sm btn-danger" data-action="desinscribir" data-materia="${m.idMateria}">Desinscribir</button>` :
                                    `<button class="btn btn-sm btn-primary" data-action="inscribir" data-materia="${m.idMateria}">Inscribirse</button>`
                                }</td>
                            </tr>`;
                        }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;
        }).join('')}`;
    },

    // ==========================================
    // MATERIAS
    // ==========================================
    materias() {
        const user = DB.getCurrentUser();
        const cursa = DB.getWhere('cursa', { email: user.email });

        return `
        <div class="page-header">
            <h1 class="page-title"><span class="material-symbols-outlined">menu_book</span> Mis Materias</h1>
            <span class="badge badge-blue" style="font-size:0.85rem;padding:6px 14px;">${cursa.length} materias</span>
        </div>
        ${cursa.length === 0 ?
            `<div class="card"><div class="empty-state"><span class="material-symbols-outlined">menu_book</span><p>No estas inscripto en ninguna materia.<br>Ve a <strong>Plan de Carrera</strong> para inscribirte.</p>
            <button class="btn btn-primary" data-action="goto" data-view="plan"><span class="material-symbols-outlined">school</span> Ir al Plan</button></div></div>` :
        `<div class="content-grid">
            ${cursa.map((c, i) => {
                const mat = DB.getById('materia','idMateria',c.idMateria);
                if (!mat) return '';
                const dicta = DB.getWhere('dicta', { idMateria: c.idMateria });
                const prof = dicta.length > 0 ? DB.getById('profesor','idProfe',dicta[0].idProfe) : null;
                const plan = DB.getById('plandecarrera','IdPlan',mat.id_plan);
                const numExams = DB.getWhere('examen', { email: user.email }).filter(e => e.idmateria === mat.idMateria).length;
                return `<div class="item-card" style="animation-delay:${i*0.06}s">
                    <div class="item-card-header">
                        <h3>${mat.NombreMateria}</h3>
                        <button class="btn btn-sm btn-danger" data-action="desinscribir" data-materia="${mat.idMateria}" title="Desinscribirse">
                            <span class="material-symbols-outlined" style="font-size:1rem">close</span>
                        </button>
                    </div>
                    <p>${mat.Descripcion || 'Sin descripcion'}</p>
                    <div class="item-card-meta">
                        <span><span class="material-symbols-outlined" style="font-size:.9rem">location_on</span> ${mat.AulaCursado}</span>
                        <span>·</span>
                        <span><span class="material-symbols-outlined" style="font-size:.9rem">person</span> ${prof ? prof.NombreyApelProfe : 'Sin profesor'}</span>
                        <span>·</span>
                        <span><span class="material-symbols-outlined" style="font-size:.9rem">event</span> ${numExams} examenes</span>
                    </div>
                    ${plan ? `<div class="tags"><span class="tag">Plan ${plan.anio_plan}</span>${dicta.length > 0 && dicta[0].Resenia ? `<span class="tag">${dicta[0].Resenia}</span>` : ''}</div>` : ''}
                </div>`;
            }).join('')}
        </div>`}`;
    },

    // ==========================================
    // EXAMENES
    // ==========================================
    examenes(calYear, calMonth) {
        const user = DB.getCurrentUser();
        const examenes = DB.getWhere('examen', { email: user.email });
        const now = new Date();
        const year = calYear || now.getFullYear();
        const month = calMonth !== undefined ? calMonth : now.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        let startDow = firstDay.getDay();
        startDow = startDow === 0 ? 6 : startDow - 1;
        const daysInMonth = lastDay.getDate();

        const examDays = {};
        examenes.forEach(e => {
            const d = new Date(e.fecha_hora_inicio);
            if (d.getFullYear() === year && d.getMonth() === month) {
                if (!examDays[d.getDate()]) examDays[d.getDate()] = [];
                examDays[d.getDate()].push(e);
            }
        });

        let calCells = '';
        for (let i = 0; i < startDow; i++) calCells += '<div class="calendar-day empty"></div>';
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
            const hasExam = examDays[day];
            calCells += `<div class="calendar-day${isToday ? ' today' : ''}${hasExam ? ' has-exam' : ''}" data-action="cal-day" data-day="${day}" data-month="${month}" data-year="${year}">${day}</div>`;
        }

        const monthExams = examenes
            .filter(e => { const d = new Date(e.fecha_hora_inicio); return d.getFullYear() === year && d.getMonth() === month; })
            .sort((a,b) => a.fecha_hora_inicio.localeCompare(b.fecha_hora_inicio));

        return `
        <div class="page-header">
            <h1 class="page-title"><span class="material-symbols-outlined">event</span> Examenes</h1>
            <button class="btn btn-primary" data-action="add-examen"><span class="material-symbols-outlined">add</span> Nuevo Examen</button>
        </div>

        <div class="content-grid-2">
            <div class="card">
                <div class="calendar-nav">
                    <button data-action="cal-prev" data-month="${month}" data-year="${year}"><span class="material-symbols-outlined">chevron_left</span></button>
                    <h3>${MESES[month]} ${year}</h3>
                    <button data-action="cal-next" data-month="${month}" data-year="${year}"><span class="material-symbols-outlined">chevron_right</span></button>
                </div>
                <div class="calendar-grid">
                    ${DIAS_SEMANA.map(d => `<div class="calendar-day-header">${d}</div>`).join('')}
                    ${calCells}
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <span class="card-title"><span class="material-symbols-outlined">list</span> Examenes de ${MESES[month]}</span>
                </div>
                ${monthExams.length === 0 ?
                    '<div class="empty-state"><span class="material-symbols-outlined">event_available</span><p>Sin examenes este mes</p></div>' :
                `<div class="exam-list">
                    ${monthExams.map(e => {
                        const mat = DB.getById('materia','idMateria',e.idmateria);
                        const d = new Date(e.fecha_hora_inicio);
                        return `<div class="exam-item">
                            <div class="exam-date-box">
                                <span class="day">${d.getDate()}</span>
                                <span class="month">${MESES[d.getMonth()].slice(0,3)}</span>
                            </div>
                            <div class="exam-info">
                                <h4>${mat ? mat.NombreMateria : '—'}</h4>
                                <p>${e.TipoExamen} · ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')} hs ${e.CalificacionExamen != null ? ' · Nota: ' + e.CalificacionExamen : ''}</p>
                                ${e.descripcion ? `<p style="margin-top:4px;font-size:0.75rem;color:var(--text-muted)">${e.descripcion}</p>` : ''}
                            </div>
                            <div class="exam-actions">
                                <button class="btn btn-sm btn-secondary btn-icon" data-action="edit-examen" data-id="${e.id_examen}" title="Editar"><span class="material-symbols-outlined" style="font-size:1rem">edit</span></button>
                                <button class="btn btn-sm btn-danger btn-icon" data-action="del-examen" data-id="${e.id_examen}" title="Eliminar"><span class="material-symbols-outlined" style="font-size:1rem">delete</span></button>
                            </div>
                        </div>`;
                    }).join('')}
                </div>`}
            </div>
        </div>`;
    },

    // ==========================================
    // APUNTES
    // ==========================================
    apuntes() {
        const user = DB.getCurrentUser();
        const apuntes = DB.getWhere('apuntes', { email: user.email });
        const tipografias = DB.getAll('tipografia_apunte');

        return `
        <div class="page-header">
            <h1 class="page-title"><span class="material-symbols-outlined">description</span> Mis Apuntes</h1>
            <button class="btn btn-primary" data-action="add-apunte"><span class="material-symbols-outlined">add</span> Nuevo Apunte</button>
        </div>
        ${apuntes.length === 0 ?
            `<div class="card"><div class="empty-state"><span class="material-symbols-outlined">description</span><p>No tenes apuntes todavia.<br>Crea tu primer apunte para empezar.</p>
            <button class="btn btn-primary" data-action="add-apunte"><span class="material-symbols-outlined">add</span> Crear Apunte</button></div></div>` :
        `<div class="content-grid">
            ${apuntes.map((a, i) => {
                const tips = tipografias.filter(t => t.id_apunte === a.id_apunte);
                const d = new Date(a.fecha_creacion);
                const fecha = `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
                return `<div class="item-card" style="animation-delay:${i*0.06}s">
                    <div class="item-card-header">
                        <h3>${a.nombre}</h3>
                        <div class="item-card-actions">
                            <button class="btn btn-sm btn-secondary btn-icon" data-action="edit-apunte" data-id="${a.id_apunte}" title="Editar"><span class="material-symbols-outlined" style="font-size:1rem">edit</span></button>
                            <button class="btn btn-sm btn-danger btn-icon" data-action="del-apunte" data-id="${a.id_apunte}" title="Eliminar"><span class="material-symbols-outlined" style="font-size:1rem">delete</span></button>
                        </div>
                    </div>
                    <div class="apunte-content">${a.contenido}</div>
                    <div class="item-card-meta">
                        <span><span class="material-symbols-outlined" style="font-size:.9rem">calendar_today</span> ${fecha}</span>
                    </div>
                    ${tips.length > 0 ? `<div class="tags">${tips.map(t => `<span class="tag">${t.tipografia}</span>`).join('')}</div>` : ''}
                </div>`;
            }).join('')}
        </div>`}`;
    },

    // ==========================================
    // PROFESORES
    // ==========================================
    profesores() {
        const profesores = DB.getAll('profesor');
        const horarios = DB.getAll('horarioconsulta');
        const dicta = DB.getAll('dicta');

        return `
        <div class="page-header">
            <h1 class="page-title"><span class="material-symbols-outlined">groups</span> Profesores y Consultas</h1>
        </div>
        <div class="content-grid">
            ${profesores.map((p, i) => {
                const hrs = horarios.filter(h => h.idProfe === p.idProfe);
                const mats = dicta.filter(d => d.idProfe === p.idProfe).map(d => {
                    const m = DB.getById('materia','idMateria',d.idMateria);
                    return m ? m.NombreMateria : '';
                }).filter(Boolean);
                const initials = p.NombreyApelProfe.split(' ').map(w => w[0]).join('').slice(0,2);
                return `<div class="item-card" style="animation-delay:${i*0.06}s">
                    <div class="prof-card">
                        <div class="prof-avatar">${initials}</div>
                        <div class="prof-info">
                            <h3>${p.NombreyApelProfe}</h3>
                            <p><span class="material-symbols-outlined" style="font-size:.85rem;vertical-align:middle">email</span> ${p.email}</p>
                            ${p.numeroTelefonico ? `<p><span class="material-symbols-outlined" style="font-size:.85rem;vertical-align:middle">phone</span> ${p.numeroTelefonico}</p>` : ''}
                            ${mats.length > 0 ? `<div class="tags" style="margin-top:8px">${mats.map(m => `<span class="tag">${m}</span>`).join('')}</div>` : ''}
                        </div>
                    </div>
                    ${hrs.length > 0 ? `
                    <div class="prof-horarios">
                        <h4><span class="material-symbols-outlined" style="font-size:.9rem;vertical-align:middle">schedule</span> Horarios de Consulta</h4>
                        ${hrs.map(h => `<div class="horario-item">
                            <span class="material-symbols-outlined">event</span>
                            <strong>${h.dia_semana}</strong> · ${h.hora_inicio} a ${h.hora_fin}
                            ${h.AulaConsulta ? `· <span style="color:var(--accent-light)">${h.AulaConsulta}</span>` : ''}
                        </div>`).join('')}
                    </div>` : ''}
                </div>`;
            }).join('')}
        </div>`;
    },

    // ==========================================
    // MODALES - Formularios
    // ==========================================
    modalExamen(examen) {
        const user = DB.getCurrentUser();
        const cursa = DB.getWhere('cursa', { email: user.email });
        const isEdit = !!examen;
        return `
        <div class="modal-header">
            <span class="modal-title"><span class="material-symbols-outlined">event</span> ${isEdit ? 'Editar' : 'Nuevo'} Examen</span>
            <button class="modal-close" data-action="close-modal">✕</button>
        </div>
        <form class="modal-body" id="form-examen" data-exam-id="${isEdit ? examen.id_examen : ''}">
            <div class="input-group">
                <label>Materia</label>
                <select name="idmateria" required>
                    <option value="">Selecciona una materia</option>
                    ${cursa.map(c => {
                        const m = DB.getById('materia','idMateria',c.idMateria);
                        return m ? `<option value="${m.idMateria}" ${isEdit && examen.idmateria === m.idMateria ? 'selected':''}>${m.NombreMateria}</option>` : '';
                    }).join('')}
                </select>
            </div>
            <div class="input-group">
                <label>Tipo de Examen</label>
                <select name="TipoExamen" required>
                    <option value="">Selecciona tipo</option>
                    ${['Parcial','Final','Recuperatorio','TP'].map(t =>
                        `<option value="${t}" ${isEdit && examen.TipoExamen===t ? 'selected':''}>${t}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="input-row">
                <div class="input-group">
                    <label>Fecha y Hora Inicio</label>
                    <input type="datetime-local" name="fecha_hora_inicio" required value="${isEdit ? examen.fecha_hora_inicio : ''}">
                </div>
                <div class="input-group">
                    <label>Fecha y Hora Fin (opcional)</label>
                    <input type="datetime-local" name="fecha_hora_fin" value="${isEdit && examen.fecha_hora_fin ? examen.fecha_hora_fin : ''}">
                </div>
            </div>
            <div class="input-row">
                <div class="input-group">
                    <label>Calificacion (opcional)</label>
                    <input type="number" name="CalificacionExamen" min="0" max="10" placeholder="0-10" value="${isEdit && examen.CalificacionExamen != null ? examen.CalificacionExamen : ''}">
                </div>
                <div class="input-group">
                    <label>&nbsp;</label>
                    <p style="font-size:0.78rem;color:var(--text-muted);padding-top:8px;">Dejar vacio si aun no rendiste</p>
                </div>
            </div>
            <div class="input-group">
                <label>Descripcion (opcional)</label>
                <input type="text" name="descripcion" placeholder="Ej: Primer parcial practico" value="${isEdit ? (examen.descripcion||'') : ''}">
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-action="close-modal">Cancelar</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Guardar Cambios' : 'Crear Examen'}</button>
            </div>
        </form>`;
    },

    modalApunte(apunte) {
        const isEdit = !!apunte;
        const tips = isEdit ? DB.getWhere('tipografia_apunte', {}).filter(t => t.id_apunte === apunte.id_apunte) : [];
        return `
        <div class="modal-header">
            <span class="modal-title"><span class="material-symbols-outlined">description</span> ${isEdit ? 'Editar' : 'Nuevo'} Apunte</span>
            <button class="modal-close" data-action="close-modal">✕</button>
        </div>
        <form class="modal-body" id="form-apunte" data-apunte-id="${isEdit ? apunte.id_apunte : ''}">
            <div class="input-group">
                <label>Nombre del Apunte</label>
                <input type="text" name="nombre" required maxlength="20" placeholder="Ej: Resumen BD" value="${isEdit ? apunte.nombre : ''}">
            </div>
            <div class="input-group">
                <label>Contenido</label>
                <textarea name="contenido" required placeholder="Escribe tus notas aqui...">${isEdit ? apunte.contenido : ''}</textarea>
            </div>
            <div class="input-group">
                <label>Tipografias (separadas por coma)</label>
                <input type="text" name="tipografias" placeholder="Ej: Arial, Roboto, Times New Roman" value="${tips.map(t=>t.tipografia).join(', ')}">
                <p style="font-size:0.72rem;color:var(--text-muted);margin-top:4px">Tabla TIPOGRAFIA_APUNTE: atributo multivaluado</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-action="close-modal">Cancelar</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Guardar Cambios' : 'Crear Apunte'}</button>
            </div>
        </form>`;
    }
};
