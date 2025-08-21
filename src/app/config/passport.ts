import passport from "passport";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import { envVars } from "./env";
import { User } from "../modules/user/user.model";
import { Role } from "../modules/user/user.interface";
import { Strategy as localStrategy } from "passport-local";
import bcryptjs from 'bcryptjs'

// passport for email password configuration
passport.use(
    new localStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email: string, password: string, done) => {
        try {
            const isUserExist = await User.findOne({ email })
            // console.log('isUserExist', isUserExist);

            /* if (!isUserExist) {
                return done(null, false, { message: "User Does Not Exist!" })
            } */
            // or- both are okay
            if (!isUserExist) {
                return done("User does not exist")
            }

            const isGoogleAuthenticated = isUserExist.auths.some(providerObjects => providerObjects.provider === 'google')

            if (!isGoogleAuthenticated && !isUserExist.password) {
                return done(null, false, { message: "You are authenticated through Google Login. If you want to login with credentials, first login with Google and then set a password for your Gmail. After that, you can login with password." })
            }

            const isPassWordMatched = await bcryptjs.compare(password as string, isUserExist.password as string)

            if (!isPassWordMatched) {
                return done(null, false, { message: "Password Does Not Exist!" })
            }

            done(null, isUserExist)
        } catch (error) {
            console.log(error);
            done(error)
        }
    })
)

passport.use(
    new GoogleStrategy({
        clientID: envVars.GOOGLE_CLIENT_ID,
        clientSecret: envVars.GOOGLE_CLIENT_SECRET,
        callbackURL: envVars.GOOGLE_CALLBACK_URL
    },
        async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
            try {
                const email = profile.emails?.[0].value

                if (!email) {
                    return done(null, false, { message: "No email found!" })
                }

                let user = await User.findOne({ email });

                if (!user) {
                    user = await User.create({
                        email,
                        name: profile.displayName,
                        picture: profile.photos?.[0].value,
                        role: Role.USER,
                        isVerified: true,
                        auths: [
                            {
                                provider: 'google',
                                providerId: profile.id
                            }
                        ]
                    })
                }

                return done(null, user)

            } catch (error) {
                console.log('Google Strategy Error', error);
                return done(error)
            }
        }
    ))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
    done(null, user._id)
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.deserializeUser(async (id: string, done: any) => {
    try {
        const user = await User.findById(id);
        done(null, user)
    } catch (error) {
        console.log(error);
        done(error)
    }
})

// frontend localhost:5173/login?redirect=/booking -> localhost:5000/api/v1/auth/google?redirect=/booking -> passport -> Google OAuth Consent -> gmail login -> successful -> callback url localhost:5000/api/v1/auth/google/callback -> db store -> token

// Bridge == Google -> user db store -> token
//Custom -> email , password, role : USER, name... -> registration -> DB -> 1 User create
//Google -> req -> google -> successful : Jwt Token : Role , email -> DB - Store -> token - api access
