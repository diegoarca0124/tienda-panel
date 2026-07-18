export interface SettingsImport {
    file: File | undefined
    mode: 'upsert' | 'insert' | 'update',
    identifyBy: 'email' | 'number_document',
}