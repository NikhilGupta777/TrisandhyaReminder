import bcrypt from "bcrypt";
import crypto from "crypto";
import { storage } from "./storage";

export async function seedAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@kalkiavatar.org";
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.warn("⚠️  ADMIN_PASSWORD environment variable not set. Admin user will not be created.");
      console.warn("   Set ADMIN_PASSWORD in your environment to create the admin user.");
      return;
    }

    const existingAdmin = await storage.getUserByEmail(adminEmail);
    
    if (existingAdmin) {
      console.log("✅ Admin user already exists");
      
      if (!existingAdmin.isAdmin) {
        await storage.updateUserAdminStatus(existingAdmin.id, true);
        console.log("   Updated existing user to admin status");
      }
      
      return;
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

    console.log("✅ Admin user created successfully");
    console.log(`   Email: ${adminEmail}`);
    console.log("   Password: [CONFIGURED VIA ENVIRONMENT]");
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
  }
}
