// src/scripts/seed-permissions.ts
import * as dotenv from 'dotenv';
import { connect, Connection } from 'mongoose';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../../.env') });

interface PermissionSeed {
  name: string;
  code: number;
  description: string;
}

interface RolePermissionSeed {
  name: string;
  permissions: string[];
  description: string;
}
export enum UserRole {
  ADMIN = 'admin',
  USER = 'staff',
  MANAGER = 'manager',
}
class PermissionSeeder {
  private connection: Connection | null = null;
  private readonly permissions: PermissionSeed[] = [
    { name: 'canViewDashboard', code: 1001, description: 'Can view dashboard' },
    { name: 'canViewSkills', code: 1002, description: 'Can view skills' },
    {
      name: 'canEditOwnSkills',
      code: 1003,
      description: 'Can edit own skills',
    },
    {
      name: 'canEditTeamSkills',
      code: 1004,
      description: 'Can edit team skills',
    },
    {
      name: 'canEditAllSkills',
      code: 1005,
      description: 'Can edit all skills',
    },
    {
      name: 'canViewLearning',
      code: 1006,
      description: 'Can view learning content',
    },
    {
      name: 'canEditOwnLearning',
      code: 1007,
      description: 'Can edit own learning',
    },
    {
      name: 'canEditTeamLearning',
      code: 1008,
      description: 'Can edit team learning',
    },
    {
      name: 'canEditAllLearning',
      code: 1009,
      description: 'Can edit all learning',
    },
    { name: 'canViewReports', code: 1010, description: 'Can view reports' },
    { name: 'canManageTeam', code: 1011, description: 'Can manage team' },
    { name: 'canManageSystem', code: 1012, description: 'Can manage system' },
    { name: 'canManageUsers', code: 1013, description: 'Can manage users' },
  ];

  private readonly rolePermissions: RolePermissionSeed[] = [
    {
      name: UserRole.ADMIN,
      permissions: [
        'canViewDashboard',
        'canViewSkills',
        'canEditOwnSkills',
        'canEditTeamSkills',
        'canEditAllSkills',
        'canViewLearning',
        'canEditOwnLearning',
        'canEditTeamLearning',
        'canEditAllLearning',
        'canViewReports',
        'canManageTeam',
        'canManageSystem',
        'canManageUsers',
      ],
      description: 'System Administrator',
    },
    {
      name: UserRole.MANAGER,
      permissions: [
        'canViewDashboard',
        'canViewSkills',
        'canEditOwnSkills',
        'canEditTeamSkills',
        'canViewLearning',
        'canEditOwnLearning',
        'canEditTeamLearning',
        'canViewReports',
        'canManageTeam',
      ],
      description: 'Team Manager',
    },
    {
      name: UserRole.USER,
      permissions: [
        'canViewDashboard',
        'canViewSkills',
        'canEditOwnSkills',
        'canViewLearning',
        'canEditOwnLearning',
      ],
      description: 'Regular Staff',
    },
  ];

  private get mongoUri(): string {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    return uri;
  }

  async connect(): Promise<void> {
    try {
      this.connection = (
        await connect(this.mongoUri, {
          connectTimeoutMS: 10000, // 10 seconds
          socketTimeoutMS: 45000, // 45 seconds
          serverSelectionTimeoutMS: 10000, // 10 seconds
          maxPoolSize: 10,
          minPoolSize: 1,
        })
      ).connection;

      console.log('Connected to MongoDB:', this.mongoUri);
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async clearExistingData(): Promise<void> {
    if (!this.connection)
      throw new Error('Database connection not established');

    try {
      await Promise.all([
        this.connection.collection('permissions').deleteMany({}),
        this.connection.collection('roles').deleteMany({}),
      ]);
      console.log('Existing data cleared');
    } catch (error) {
      console.error('Failed to clear existing data:', error);
      throw error;
    }
  }

  async seedPermissions(): Promise<void> {
    if (!this.connection)
      throw new Error('Database connection not established');

    try {
      // Insert permissions one by one to handle potential network issues
      for (const permission of this.permissions) {
        await this.connection
          .collection('permissions')
          .updateOne(
            { name: permission.name },
            { $set: permission },
            { upsert: true },
          );
      }
      console.log(`${this.permissions.length} permissions seeded`);
    } catch (error) {
      console.error('Failed to seed permissions:', error);
      throw error;
    }
  }

  async seedRoles(): Promise<void> {
    if (!this.connection)
      throw new Error('Database connection not established');

    try {
      // Insert roles one by one to handle potential network issues
      for (const role of this.rolePermissions) {
        await this.connection
          .collection('roles')
          .updateOne({ name: role.name }, { $set: role }, { upsert: true });
      }
      console.log(`${this.rolePermissions.length} roles seeded`);
    } catch (error) {
      console.error('Failed to seed roles:', error);
      throw error;
    }
  }

  async validateSeeding(): Promise<void> {
    if (!this.connection)
      throw new Error('Database connection not established');

    try {
      const permissionCount = await this.connection
        .collection('permissions')
        .countDocuments();
      const roleCount = await this.connection
        .collection('roles')
        .countDocuments();

      if (permissionCount !== this.permissions.length) {
        throw new Error(
          `Permission count mismatch. Expected: ${this.permissions.length}, Got: ${permissionCount}`,
        );
      }

      if (roleCount !== this.rolePermissions.length) {
        throw new Error(
          `Role count mismatch. Expected: ${this.rolePermissions.length}, Got: ${roleCount}`,
        );
      }

      console.log('Seeding validation successful');
    } catch (error) {
      console.error('Seeding validation failed:', error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.close();
        console.log('Database connection closed');
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
    }
  }

  async seed(): Promise<void> {
    console.log('Starting permission and role seeding...');

    try {
      await this.connect();
      await this.clearExistingData();
      await this.seedPermissions();
      await this.seedRoles();
      await this.validateSeeding();

      console.log('Seeding completed successfully');
    } catch (error) {
      console.error('Seeding failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Execute seeding
if (require.main === module) {
  const seeder = new PermissionSeeder();
  seeder
    .seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { PermissionSeeder };
