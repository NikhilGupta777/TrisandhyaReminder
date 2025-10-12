import bcrypt from "bcrypt";
import { storage } from "./storage";

export async function seedAdmin() {
  try {
    const adminEmail = "admin@kalkiavatar.org";
    const adminPassword = "admin123";

    const existingAdmin = await storage.getUserByEmail(adminEmail);
    
    if (existingAdmin) {
      console.log("Admin user already exists");
      
      if (!existingAdmin.isAdmin) {
        await storage.updateUserAdminStatus(existingAdmin.id, true);
        console.log("Updated existing user to admin status");
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

    console.log("✅ Admin user created successfully:");
    console.log("   Email: admin@kalkiavatar.org");
    console.log("   Password: admin123");
    console.log("   Please change the password after first login!");
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
  }
}
