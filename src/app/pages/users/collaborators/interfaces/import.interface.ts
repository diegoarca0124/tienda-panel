export interface ImportInterface {
    file: File | undefined
    mode: 'upsert' | 'insert' | 'update',
    identifyBy: 'email' | 'number_document',
}