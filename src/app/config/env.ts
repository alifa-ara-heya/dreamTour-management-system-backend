import dotenv from 'dotenv'

dotenv.config()

interface EnvConfig {
    PORT: string,
    DB_URL: string,
    NODE_ENV: 'development' | 'production',
    GEMINI_API_KEY: string
}

const loadEnvVariables = (): EnvConfig => {
    const requiredVariables: string[] = ["PORT", "DB_URL", "NODE_ENV", "GEMINI_API_KEY"];

    requiredVariables.forEach(key => {
        if (!process.env[key]) {
            throw new Error(`Missing required environment variable ${key}`)
        }
    })

    return {
        PORT: process.env.PORT as string,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        DB_URL: process.env.DB_URL!,
        NODE_ENV: process.env.NODE_ENV as "development" | "production",
        GEMINI_API_KEY: process.env.GEMINI_API_KEY as string
    }
}

export const envVars = loadEnvVariables()