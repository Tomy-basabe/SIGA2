// ==========================================
// S.I.G.A. - Capa de Datos
// Simula la base de datos Oracle con localStorage
// Estructura idéntica al modelo relacional del proyecto
// ==========================================

const DB = {
    getAll(table) {
        return JSON.parse(localStorage.getItem(`siga_${table}`)) || [];
    },
    saveAll(table, data) {
        localStorage.setItem(`siga_${table}`, JSON.stringify(data));
    },
    getById(table, pkField, pkValue) {
        return this.getAll(table).find(r => r[pkField] == pkValue) || null;
    },
    getWhere(table, conditions) {
        return this.getAll(table).filter(r =>
            Object.keys(conditions).every(k => r[k] == conditions[k])
        );
    },
    insert(table, record) {
        const records = this.getAll(table);
        records.push(record);
        this.saveAll(table, records);
        return record;
    },
    update(table, pkField, pkValue, updates) {
        const records = this.getAll(table);
        const i = records.findIndex(r => r[pkField] == pkValue);
        if (i !== -1) { records[i] = { ...records[i], ...updates }; this.saveAll(table, records); return records[i]; }
        return null;
    },
    remove(table, pkField, pkValue) {
        this.saveAll(table, this.getAll(table).filter(r => r[pkField] != pkValue));
    },
    removeWhere(table, conditions) {
        this.saveAll(table, this.getAll(table).filter(r =>
            !Object.keys(conditions).every(k => r[k] == conditions[k])
        ));
    },
    nextId(table, pkField) {
        const records = this.getAll(table);
        return records.length === 0 ? 1 : Math.max(...records.map(r => r[pkField])) + 1;
    },
    getCurrentUser() {
        return JSON.parse(localStorage.getItem('siga_currentUser'));
    },
    setCurrentUser(user) {
        localStorage.setItem('siga_currentUser', JSON.stringify(user));
    },
    logout() {
        localStorage.removeItem('siga_currentUser');
    },
    isSeeded() {
        return localStorage.getItem('siga_seeded') === 'true';
    },

    // ==========================================
    // SEED DATA - Replica de los INSERT del script Oracle
    // + datos extra para enriquecer la demo
    // ==========================================
    seed() {
        if (this.isSeeded()) return;

        // PLANDECARRERA
        this.saveAll('plandecarrera', [
            { IdPlan: 1, anio_plan: 2023 },
            { IdPlan: 2, anio_plan: 2024 }
        ]);

        // USUARIO
        this.saveAll('usuario', [
            { email: 'alumno@utn.edu.ar', NombreyApeAlumn: 'Tomas Basabe', legajo: 12345 },
            { email: 'agustina@utn.edu.ar', NombreyApeAlumn: 'Agustina Vega', legajo: 12346 }
        ]);

        // PROFESOR
        this.saveAll('profesor', [
            { idProfe: 10, numeroTelefonico: 2615551234, email: 'moreno@utn.edu.ar', NombreyApelProfe: 'Andres Moreno' },
            { idProfe: 11, numeroTelefonico: 2615554567, email: 'martinez@utn.edu.ar', NombreyApelProfe: 'Laura Martinez' },
            { idProfe: 12, numeroTelefonico: 2615557890, email: 'garcia@utn.edu.ar', NombreyApelProfe: 'Carlos Garcia' },
            { idProfe: 13, numeroTelefonico: 2615552345, email: 'lopez@utn.edu.ar', NombreyApelProfe: 'Maria Lopez' }
        ]);

        // MATERIA
        this.saveAll('materia', [
            { idMateria: 101, id_plan: 1, AulaCursado: 'Aula 10', NombreMateria: 'Base de Datos', Descripcion: 'Modelado relacional y SQL' },
            { idMateria: 102, id_plan: 1, AulaCursado: 'Aula 5', NombreMateria: 'Programacion', Descripcion: 'Algoritmos y estructuras de datos' },
            { idMateria: 103, id_plan: 1, AulaCursado: 'Aula 8', NombreMateria: 'Matematica II', Descripcion: 'Calculo integral y series' },
            { idMateria: 104, id_plan: 1, AulaCursado: 'Aula 3', NombreMateria: 'Fisica I', Descripcion: 'Mecanica clasica y termodinamica' },
            { idMateria: 105, id_plan: 1, AulaCursado: 'Aula 7', NombreMateria: 'Ingles Tecnico', Descripcion: 'Lectura y comprension tecnica' },
            { idMateria: 106, id_plan: 2, AulaCursado: 'Aula 12', NombreMateria: 'Resistencia de Materiales', Descripcion: 'Analisis de tensiones y deformaciones' },
            { idMateria: 107, id_plan: 2, AulaCursado: 'Aula 9', NombreMateria: 'Quimica General', Descripcion: 'Estructura atomica y enlaces' }
        ]);

        // HORARIOCONSULTA
        this.saveAll('horarioconsulta', [
            { idHorario: 1, idProfe: 10, dia_semana: 'Lunes', hora_inicio: '15:00', hora_fin: '17:00', AulaConsulta: 'Lab 3' },
            { idHorario: 2, idProfe: 11, dia_semana: 'Martes', hora_inicio: '10:00', hora_fin: '12:00', AulaConsulta: 'Aula 7' },
            { idHorario: 3, idProfe: 12, dia_semana: 'Miercoles', hora_inicio: '14:00', hora_fin: '16:00', AulaConsulta: 'Lab 1' },
            { idHorario: 4, idProfe: 10, dia_semana: 'Jueves', hora_inicio: '09:00', hora_fin: '11:00', AulaConsulta: 'Aula 10' },
            { idHorario: 5, idProfe: 13, dia_semana: 'Viernes', hora_inicio: '08:00', hora_fin: '10:00', AulaConsulta: 'Aula 2' },
            { idHorario: 6, idProfe: 11, dia_semana: 'Jueves', hora_inicio: '16:00', hora_fin: '18:00', AulaConsulta: 'Lab 2' }
        ]);

        // EXAMEN
        this.saveAll('examen', [
            { id_examen: 1, email: 'alumno@utn.edu.ar', idmateria: 101, descripcion: 'Primer Parcial Practico', CalificacionExamen: null, TipoExamen: 'Parcial', fecha_hora_inicio: '2026-06-15T18:00', fecha_hora_fin: '2026-06-15T20:00' },
            { id_examen: 2, email: 'alumno@utn.edu.ar', idmateria: 102, descripcion: 'Parcial de Programacion', CalificacionExamen: null, TipoExamen: 'Parcial', fecha_hora_inicio: '2026-06-20T14:00', fecha_hora_fin: '2026-06-20T16:00' },
            { id_examen: 3, email: 'alumno@utn.edu.ar', idmateria: 103, descripcion: 'Final de Matematica II', CalificacionExamen: 8, TipoExamen: 'Final', fecha_hora_inicio: '2026-07-10T09:00', fecha_hora_fin: '2026-07-10T12:00' },
            { id_examen: 4, email: 'alumno@utn.edu.ar', idmateria: 104, descripcion: 'Recuperatorio Fisica', CalificacionExamen: null, TipoExamen: 'Recuperatorio', fecha_hora_inicio: '2026-07-05T16:00', fecha_hora_fin: '2026-07-05T18:00' }
        ]);

        // APUNTES
        this.saveAll('apuntes', [
            { id_apunte: 500, email: 'alumno@utn.edu.ar', contenido: 'Resumen de Normalizacion:\n\n1FN: Atributos atomicos, sin grupos repetitivos.\n2FN: Sin dependencias parciales respecto a la PK.\n3FN: Sin dependencias transitivas entre atributos no clave.\n\nTransformacion E/R a Relacional:\n- Entidades → Tablas\n- Relaciones N:M → Tablas intermedias\n- Relaciones 1:N → FK en el lado N\n- Atributos multivaluados → Tabla separada', nombre: 'Resumen BD', fecha_creacion: '2026-06-01T10:00' },
            { id_apunte: 501, email: 'alumno@utn.edu.ar', contenido: 'Algoritmos de Ordenamiento:\n\n- Bubble Sort: O(n²) - Simple pero lento\n- Quick Sort: O(n log n) - Divide y venceras\n- Merge Sort: O(n log n) - Estable, usa memoria extra\n\nEstructuras de Datos:\n- Pilas (LIFO)\n- Colas (FIFO)\n- Listas enlazadas\n- Arboles binarios', nombre: 'Algoritmos', fecha_creacion: '2026-06-03T14:30' },
            { id_apunte: 502, email: 'alumno@utn.edu.ar', contenido: 'Integrales:\n\nDefinidas: Se calculan entre limites a y b. Representan el area bajo la curva.\nIndefinidas: Resultado general + constante C.\n\nMetodos de integracion:\n1. Sustitucion\n2. Por partes\n3. Fracciones parciales\n4. Trigonometrica', nombre: 'Integrales', fecha_creacion: '2026-05-28T09:15' },
            { id_apunte: 503, email: 'alumno@utn.edu.ar', contenido: 'Cinematica:\n\nMRU: x = x0 + v*t\nMRUV: x = x0 + v0*t + (1/2)*a*t²\n\nLeyes de Newton:\n1. Inercia\n2. F = m * a\n3. Accion y reaccion\n\nEnergia cinetica: Ec = (1/2)*m*v²\nEnergia potencial: Ep = m*g*h', nombre: 'Fisica Resumen', fecha_creacion: '2026-05-20T11:00' }
        ]);

        // TIPOGRAFIA_APUNTE
        this.saveAll('tipografia_apunte', [
            { tipografia: 'Arial', id_apunte: 500 },
            { tipografia: 'Roboto', id_apunte: 500 },
            { tipografia: 'Times New Roman', id_apunte: 501 },
            { tipografia: 'Courier New', id_apunte: 502 },
            { tipografia: 'Arial', id_apunte: 503 },
            { tipografia: 'Verdana', id_apunte: 501 }
        ]);

        // CURSA (materias que cursa cada usuario)
        this.saveAll('cursa', [
            { idMateria: 101, email: 'alumno@utn.edu.ar' },
            { idMateria: 102, email: 'alumno@utn.edu.ar' },
            { idMateria: 103, email: 'alumno@utn.edu.ar' },
            { idMateria: 104, email: 'alumno@utn.edu.ar' }
        ]);

        // DICTA (que profesor dicta que materia)
        this.saveAll('dicta', [
            { idMateria: 101, idProfe: 10, Resenia: 'Excelente profesor de BD' },
            { idMateria: 102, idProfe: 11, Resenia: 'Muy didactica en prog' },
            { idMateria: 103, idProfe: 12, Resenia: 'Explica muy claro' },
            { idMateria: 104, idProfe: 10, Resenia: 'Buenas explicaciones' },
            { idMateria: 105, idProfe: 13, Resenia: 'Dinamica y entretenida' },
            { idMateria: 106, idProfe: 12, Resenia: 'Exigente pero justo' },
            { idMateria: 107, idProfe: 13, Resenia: 'Clases practicas' }
        ]);

        localStorage.setItem('siga_seeded', 'true');
    },

    reset() {
        ['plandecarrera','usuario','profesor','materia','horarioconsulta','examen','apuntes','tipografia_apunte','cursa','dicta']
            .forEach(t => localStorage.removeItem(`siga_${t}`));
        localStorage.removeItem('siga_seeded');
        localStorage.removeItem('siga_currentUser');
    }
};
