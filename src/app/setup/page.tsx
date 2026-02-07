'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle2, AlertCircle, Shield } from 'lucide-react'
import type { SetupFormData, SetupResponse } from '@/types/setup'

export default function SetupPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [checking, setChecking] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const [formData, setFormData] = useState<SetupFormData>({
        email: '',
        password: '',
        confirmPassword: '',
        companyName: '',
    })

    const [validationErrors, setValidationErrors] = useState<Partial<SetupFormData>>({})

    // Check if setup is actually required
    useEffect(() => {
        async function checkSetup() {
            try {
                const response = await fetch('/api/setup/check')
                const data = await response.json()

                if (!data.setupRequired) {
                    // Setup already complete, redirect to admin
                    router.push('/admin/dashboard')
                } else {
                    setChecking(false)
                }
            } catch (err) {
                console.error('Failed to check setup status:', err)
                setChecking(false)
            }
        }

        checkSetup()
    }, [router])

    const validateForm = (): boolean => {
        const errors: Partial<SetupFormData> = {}

        // Email validation
        if (!formData.email) {
            errors.email = 'Email gereklidir'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Geçerli bir email adresi girin'
        }

        // Password validation
        if (!formData.password) {
            errors.password = 'Şifre gereklidir'
        } else if (formData.password.length < 8) {
            errors.password = 'Şifre en az 8 karakter olmalıdır'
        }

        // Confirm password
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Şifreler eşleşmiyor'
        }

        setValidationErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/setup/initialize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const data: SetupResponse = await response.json()

            if (data.success) {
                setSuccess(true)
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    router.push('/login')
                }, 2000)
            } else {
                setError(data.error || 'Kurulum başarısız oldu')
            }
        } catch (err) {
            console.error('Setup error:', err)
            setError('Bir hata oluştu. Lütfen tekrar deneyin.')
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field: keyof SetupFormData) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }))
        // Clear validation error for this field
        if (validationErrors[field]) {
            setValidationErrors(prev => ({ ...prev, [field]: undefined }))
        }
    }

    if (checking) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
                <Card className="w-full max-w-md bg-slate-900 border-slate-800">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="rounded-full bg-green-500/20 p-3">
                                <CheckCircle2 className="h-12 w-12 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Kurulum Tamamlandı!</h2>
                            <p className="text-slate-400">
                                Admin hesabınız başarıyla oluşturuldu. Giriş sayfasına yönlendiriliyorsunuz...
                            </p>
                            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-slate-900 border-slate-800">
                <CardHeader className="text-center space-y-2">
                    <div className="flex justify-center">
                        <div className="rounded-full bg-blue-500/20 p-3">
                            <Shield className="h-10 w-10 text-blue-500" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">
                        İlk Kurulum
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Sisteme giriş yapabilmek için admin hesabınızı oluşturun
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {error && (
                        <Alert className="mb-4 bg-red-950/50 border-red-900 text-red-400">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-300">
                                Email Adresi
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@example.com"
                                value={formData.email}
                                onChange={handleInputChange('email')}
                                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                disabled={loading}
                            />
                            {validationErrors.email && (
                                <p className="text-sm text-red-400">{validationErrors.email}</p>
                            )}
                        </div>

                        {/* Company Name (Optional) */}
                        <div className="space-y-2">
                            <Label htmlFor="companyName" className="text-slate-300">
                                Şirket Adı <span className="text-slate-500 text-xs">(Opsiyonel)</span>
                            </Label>
                            <Input
                                id="companyName"
                                type="text"
                                placeholder="Şirket Adı"
                                value={formData.companyName}
                                onChange={handleInputChange('companyName')}
                                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                disabled={loading}
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-300">
                                Şifre
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="En az 8 karakter"
                                value={formData.password}
                                onChange={handleInputChange('password')}
                                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                disabled={loading}
                            />
                            {validationErrors.password && (
                                <p className="text-sm text-red-400">{validationErrors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-slate-300">
                                Şifre Tekrar
                            </Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Şifreyi tekrar girin"
                                value={formData.confirmPassword}
                                onChange={handleInputChange('confirmPassword')}
                                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                disabled={loading}
                            />
                            {validationErrors.confirmPassword && (
                                <p className="text-sm text-red-400">{validationErrors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? 'Oluşturuluyor...' : 'Admin Hesabı Oluştur'}
                        </Button>
                    </form>

                    <div className="mt-4 p-3 bg-blue-950/20 border border-blue-900/50 rounded-lg">
                        <p className="text-xs text-slate-400 text-center">
                            <strong>Not:</strong> Bu kurulum sadece ilk açılışta yapılır.
                            Admin hesabı oluşturulduktan sonra bu sayfaya tekrar erişemezsiniz.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
