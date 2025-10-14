import bcrypt from "bcrypt";
import crypto from "crypto";
import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedAdmin() {
  try {
    const adminEmailsString = process.env.ADMIN_EMAILS || "";
    const adminEmails = adminEmailsString.split(',').map(email => email.trim()).filter(email => email);
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.warn("⚠️  ADMIN_PASSWORD environment variable not set. Admin users will not be created.");
      console.warn("   Set ADMIN_PASSWORD in your environment to create admin users.");
      return;
    }

    if (adminEmails.length === 0) {
      console.warn("⚠️  ADMIN_EMAILS environment variable not set. Admin users will not be created.");
      console.warn("   Set ADMIN_EMAILS (comma-separated) in your environment to create admin users.");
      return;
    }

    for (const adminEmail of adminEmails) {
      const existingAdmin = await storage.getUserByEmail(adminEmail);
      
      if (existingAdmin) {
        console.log(`✅ Admin user already exists: ${adminEmail}`);
        
        if (!existingAdmin.isAdmin || !existingAdmin.emailVerified) {
          await storage.updateUserAdminStatus(existingAdmin.id, true);
          
          if (!existingAdmin.emailVerified) {
            await db.update(users)
              .set({ emailVerified: true, firstName: 'Admin', lastName: 'User' })
              .where(eq(users.id, existingAdmin.id));
            console.log(`   Updated ${adminEmail} to admin status and verified email`);
          } else {
            console.log(`   Updated ${adminEmail} to admin status`);
          }
        }
        
        continue;
      }

      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const admin = await storage.createLocalUser({
        email: adminEmail,
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        emailVerified: true,
        isAdmin: true,
        verificationToken: null,
      });

      console.log(`✅ Admin user created successfully: ${adminEmail}`);
      console.log("   Password: [CONFIGURED VIA ENVIRONMENT]");
    }
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
  }
}
