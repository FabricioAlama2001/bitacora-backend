const ERROR_TYPE = Object.freeze({
    FUNCTIONALITY: {
        code: 'FUNCTIONALITY',
        label: 'Funcionalidad',
    },
    VALID_FIELDS_FAILURE: {
        code: 'VALID_FIELDS_FAILURE',
        label: 'Campos válidos con falla',
    },
    INCOMPLETE_FIELDS: {
        code: 'INCOMPLETE_FIELDS',
        label: 'Campos incompletos',
    },
    WEAK_VALIDATIONS: {
        code: 'WEAK_VALIDATIONS',
        label: 'Validaciones débiles',
    },
    CONFUSING_MESSAGES: {
        code: 'CONFUSING_MESSAGES',
        label: 'Mensajes confusos',
    },
    WRONG_REQUIRED_FIELDS: {
        code: 'WRONG_REQUIRED_FIELDS',
        label: 'Campos obligatorios incorrectos',
    },
    BUSINESS_RULES: {
        code: 'BUSINESS_RULES',
        label: 'Reglas de negocio',
    },
    EDGE_CASES: {
        code: 'EDGE_CASES',
        label: 'Casos borde',
    },
    INCONSISTENT_STATES: {
        code: 'INCONSISTENT_STATES',
        label: 'Estados inconsistentes',
    },
    ROLE_PERMISSIONS: {
        code: 'ROLE_PERMISSIONS',
        label: 'Permisos por rol',
    },
    SESSION: {
        code: 'SESSION',
        label: 'Sesión',
    },
    NAVIGATION: {
        code: 'NAVIGATION',
        label: 'Navegación',
    },
    MISLEADING_UI: {
        code: 'MISLEADING_UI',
        label: 'UI engañosa',
    },
    COMPATIBILITY: {
        code: 'COMPATIBILITY',
        label: 'Compatibilidad',
    },
    PERFORMANCE: {
        code: 'PERFORMANCE',
        label: 'Performance',
    },
    NOT_PERSISTED: {
        code: 'NOT_PERSISTED',
        label: 'No persiste',
    },
    CONCURRENCY: {
        code: 'CONCURRENCY',
        label: 'Concurrencia',
    },
    ACCESSIBILITY: {
        code: 'ACCESSIBILITY',
        label: 'Accesibilidad',
    },
    I18N: {
        code: 'I18N',
        label: 'Internacionalización',
    },
    BASIC_SECURITY: {
        code: 'BASIC_SECURITY',
        label: 'Seguridad básica',
    },
});

module.exports = ERROR_TYPE;