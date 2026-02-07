export interface SetupFormData {
    email: string
    password: string
    confirmPassword: string
    companyName?: string
}

export interface SetupResponse {
    success: boolean
    error?: string
    message?: string
}

export interface SetupCheckResponse {
    setupRequired: boolean
}
