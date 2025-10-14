import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { storage } from "./storage";
import type { User } from "@shared/schema";

export function setupLocalAuth() {
  passport.use(
    "local-signup",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },
      async (req: any, email: string, password: string, done: any) => {
        try {
          const existingUser = await storage.getUserByEmail(email);
          if (existingUser) {
            return done(null, false, { message: "Email already registered" });
          }

          const hashedPassword = await bcrypt.hash(password, 10);
          const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
          const verificationCodeExpiry = new Date();
          verificationCodeExpiry.setMinutes(verificationCodeExpiry.getMinutes() + 15);

          const user = await storage.createLocalUser({
            email,
            password: hashedPassword,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            verificationCode,
            verificationCodeExpiry,
            emailVerified: false,
          });

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    "local-login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email: string, password: string, done: any) => {
        try {
          const user = await storage.getUserByEmail(email);
          
          if (!user || !user.password) {
            return done(null, false, { message: "Invalid email or password" });
          }

          const isValidPassword = await bcrypt.compare(password, user.password);
          if (!isValidPassword) {
            return done(null, false, { message: "Invalid email or password" });
          }

          if (!user.emailVerified) {
            return done(null, false, { message: "Please verify your email first" });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}
