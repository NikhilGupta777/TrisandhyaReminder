import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import MemoryStore from "memorystore";
import { storage } from "./storage";
import { setupLocalAuth } from "./localAuth";
import crypto from "crypto";

let generatedSecret: string | null = null;

export function getSession() {
  let sessionSecret = process.env.SESSION_SECRET;
  
  if (!sessionSecret) {
    console.error("⚠️  CRITICAL SECURITY WARNING ⚠️");
    console.error("   SESSION_SECRET environment variable is not set!");
    console.error("   Using a randomly generated secret that will change on server restart.");
    console.error("   This will invalidate all existing sessions on restart!");
    console.error("   Please set SESSION_SECRET in AWS Amplify Console → Environment variables");
    console.error("   Generate a secure secret with: openssl rand -base64 32");
    
    if (!generatedSecret) {
      generatedSecret = crypto.randomBytes(32).toString('hex');
      console.error(`   Generated temporary session secret (valid until restart)`);
    }
    sessionSecret = generatedSecret;
  }

  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
  const MemStore = MemoryStore(session);
  const sessionStore = new MemStore({
    checkPeriod: sessionTtl,
  });
  
  return session({
    secret: sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }
  
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  setupLocalAuth();

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn("⚠️  Google OAuth credentials not configured. Google login will not work.");
    console.warn("   Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in environment variables");
  } else {
    const callbackURL = process.env.GOOGLE_CALLBACK_URL || 
      (process.env.FRONTEND_URL 
        ? `${process.env.FRONTEND_URL}/api/auth/google/callback`
        : (process.env.NODE_ENV === "production" 
          ? `https://${process.env.REPL_SLUG}.replit.app/api/auth/google/callback`
          : "http://localhost:5000/api/auth/google/callback"));

    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: callbackURL,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value || "";
            const firstName = profile.name?.givenName || "";
            const lastName = profile.name?.familyName || "";
            const profileImageUrl = profile.photos?.[0]?.value || "";

            // Check if user exists in database
            const existingUser = await storage.getUserByEmail(email);
            
            if (existingUser) {
              // User exists - check if they are verified
              if (!existingUser.emailVerified) {
                return done(null, false, { message: "Please verify your email through the registration process before using Google sign-in." });
              }
              
              // Update user profile with Google data if needed
              await storage.upsertUser({
                id: existingUser.id,
                email,
                firstName,
                lastName,
                profileImageUrl,
                emailVerified: true,
              });
              
              return done(null, { id: existingUser.id, email, firstName, lastName, profileImageUrl });
            } else {
              // New user trying to sign in with Google - require registration first
              return done(null, false, { message: "No account found with this email. Please register first." });
            }
          } catch (error) {
            done(error as Error);
          }
        }
      )
    );

    app.get("/api/auth/google", passport.authenticate("google", {
      scope: ["profile", "email"],
    }));

    app.get("/api/auth/google/callback", 
      passport.authenticate("google", { 
        failureRedirect: "/login?error=google_signin_failed",
        failureMessage: true 
      }),
      (req, res) => {
        res.redirect("/");
      }
    );
  }

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/logout", (req, res) => {
    req.logout(() => {
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ message: "Logged out successfully" });
      });
    });
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect("/login");
      });
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export const isAdmin: RequestHandler = async (req, res, next) => {
  const user = req.user as any;
  
  if (!user || !user.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const dbUser = await storage.getUser(user.id);
  
  if (!dbUser || !dbUser.isAdmin) {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }

  next();
};
