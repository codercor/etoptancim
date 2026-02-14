import { SignJWT } from 'jose'
import { createSecretKey, randomBytes } from 'crypto'

async function generateServiceKey(providedSecret?: string) {
    let secret = providedSecret

    if (!secret) {
        // Generate a simplified strong secret (hex string)
        secret = randomBytes(32).toString('hex')
        console.log('\n⚠️  Secret argümanı verilmedi, yeni bir secret oluşturuldu.')
    }

    if (secret.length < 32) {
        console.warn('UYARI: Secret çok kısa (32 karakterden az). Bu güvensiz olabilir.')
    }

    try {
        const secretKey = createSecretKey(Buffer.from(secret, 'utf8'))

        const jwt = await new SignJWT({
            role: 'service_role',
            iss: 'supabase'
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('10y') // 10 years expiration
            .sign(secretKey)

        console.log('\n================================================================')
        console.log('✅ YENİ KONFİGÜRASYON (Bunu .env dosyana kopyala)')
        console.log('================================================================\n')

        console.log(`JWT_SECRET=${secret}`)
        console.log(`SUPABASE_SERVICE_ROLE_KEY=${jwt}`)

        console.log('\n================================================================')
        console.log('ÖNEMLİ: Bu iki değerin BİRBİRİYLE UYUMLU olması şarttır.')
        console.log('Eğer JWT_SECRET farklıysa, SERVICE_ROLE_KEY çalışmaz.')
        console.log('Lütfen .env dosyanızdaki İKİ değeri de yukarıdakilerle değiştirin.')
        console.log('================================================================\n')

    } catch (error) {
        console.error('Hata oluştu:', error)
    }
}

const secret = process.argv[2]
generateServiceKey(secret)
