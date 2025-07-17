import dotenv from 'dotenv'

dotenv.config()

interface EnvConfig {
    PORT: string,
    DB_URL: string,
    NODE_ENV: 'development' | 'production',
    GEMINI_API_KEY: string,
    BCRYPT_SALT_ROUND: number,
    JWT_ACCESS_SECRET: string,
    JWT_ACCESS_EXPIRES: string,
    JWT_REFRESH_SECRET: string,
    JWT_REFRESH_EXPIRES: string,
    SUPER_ADMIN_EMAIL: string,
    SUPER_ADMIN_PASSWORD: string
}

const loadEnvVariables = (): EnvConfig => {
    const requiredVariables: string[] = ["PORT",
        "DB_URL",
        "NODE_ENV",
        "BCRYPT_SALT_ROUND", "JWT_ACCESS_SECRET", "JWT_ACCESS_EXPIRES",
        "JWT_REFRESH_SECRET",
        "JWT_REFRESH_EXPIRES",
        "SUPER_ADMIN_EMAIL",
        "SUPER_ADMIN_PASSWORD"
    ];

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

        GEMINI_API_KEY: process.env.GEMINI_API_KEY as string,

        BCRYPT_SALT_ROUND: Number(process.env.BCRYPT_SALT_ROUND) as number,

        JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,

        JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES as string,

        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,

        JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES as string,

        SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL as string,

        SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD as string
    }
}

export const envVars = loadEnvVariables()