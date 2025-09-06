import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { UserRole } from '../src/auth/dto/register.dto';

describe('Event Planner App (e2e)', () => {
  let app: INestApplication<App>;
  let authToken: string;
  let adminToken: string;
  let organizerToken: string;
  let customerToken: string;
  let userId: string;
  let categoryId: string;
  let eventId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('/ (GET) - should return hello world', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });

  describe('Authentication Flow', () => {
    describe('User Registration', () => {
      it('should register a new customer', async () => {
        const userData = {
          email: 'customer@example.com',
          firstName: 'John',
          lastName: 'Doe',
          password: 'password123',
          role: UserRole.CUSTOMER,
        };

        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send(userData)
          .expect(201);

        expect(response.body.statusCode).toBe(201);
        expect(response.body.message).toBe('User registerd successfully');
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data.email).toBe(userData.email);
        expect(response.body.data.role).toBe('Customer');

        userId = response.body.data.id;
      });

      it('should register a new organizer', async () => {
        const userData = {
          email: 'organizer@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          password: 'password123',
          role: UserRole.ORGANIZER,
        };

        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send(userData)
          .expect(201);

        expect(response.body.data.role).toBe('Organizer');
      });

      it('should register a new admin', async () => {
        const userData = {
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          password: 'password123',
          role: UserRole.ADMIN,
        };

        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send(userData)
          .expect(201);

        expect(response.body.data.role).toBe('Admin');
      });

      it('should reject registration with existing email', async () => {
        const userData = {
          email: 'customer@example.com',
          firstName: 'Another',
          lastName: 'User',
          password: 'password123',
        };

        await request(app.getHttpServer())
          .post('/auth/register')
          .send(userData)
          .expect(400);
      });

      it('should reject registration with invalid data', async () => {
        const userData = {
          email: 'invalid-email',
          firstName: '',
          password: '123', // too short
        };

        await request(app.getHttpServer())
          .post('/auth/register')
          .send(userData)
          .expect(400);
      });
    });

    describe('User Login', () => {
      it('should login customer successfully', async () => {
        const loginData = {
          email: 'customer@example.com',
          password: 'password123',
        };

        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send(loginData)
          .expect(200);

        expect(response.body.statusCode).toBe(200);
        expect(response.body.message).toBe('User loggedIn successfully');
        expect(response.body.data).toHaveProperty('token');
        expect(response.body.data.email).toBe(loginData.email);

        customerToken = response.body.data.token;
      });

      it('should login organizer successfully', async () => {
        const loginData = {
          email: 'organizer@example.com',
          password: 'password123',
        };

        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send(loginData)
          .expect(200);

        organizerToken = response.body.data.token;
      });

      it('should login admin successfully', async () => {
        const loginData = {
          email: 'admin@example.com',
          password: 'password123',
        };

        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send(loginData)
          .expect(200);

        adminToken = response.body.data.token;
      });

      it('should reject login with invalid credentials', async () => {
        const loginData = {
          email: 'customer@example.com',
          password: 'wrongpassword',
        };

        await request(app.getHttpServer())
          .post('/auth/login')
          .send(loginData)
          .expect(401);
      });

      it('should reject login with non-existent email', async () => {
        const loginData = {
          email: 'nonexistent@example.com',
          password: 'password123',
        };

        await request(app.getHttpServer())
          .post('/auth/login')
          .send(loginData)
          .expect(404);
      });
    });

    describe('Password Reset', () => {
      it('should reset password successfully', async () => {
        const resetData = {
          email: 'customer@example.com',
          password: 'newpassword123',
        };

        const response = await request(app.getHttpServer())
          .post('/auth/reset-password')
          .send(resetData)
          .expect(200);

        expect(response.body.statusCode).toBe(200);
        expect(response.body.message).toBe('Password updated successfully');
      });

      it('should reject reset with non-existent email', async () => {
        const resetData = {
          email: 'nonexistent@example.com',
          password: 'newpassword123',
        };

        await request(app.getHttpServer())
          .post('/auth/reset-password')
          .send(resetData)
          .expect(404);
      });

      it('should reject reset with missing fields', async () => {
        const resetData = {
          email: 'customer@example.com',
        };

        await request(app.getHttpServer())
          .post('/auth/reset-password')
          .send(resetData)
          .expect(400);
      });
    });

    describe('Profile Access', () => {
      it('should get user profile with valid token', async () => {
        const response = await request(app.getHttpServer())
          .get('/auth/profile')
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(200);

        expect(response.body.statusCode).toBe(200);
        expect(response.body.user).toHaveProperty('id');
        expect(response.body.user.email).toBe('customer@example.com');
      });

      it('should reject profile access without token', async () => {
        await request(app.getHttpServer())
          .get('/auth/profile')
          .expect(401);
      });

      it('should reject profile access with invalid token', async () => {
        await request(app.getHttpServer())
          .get('/auth/profile')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401);
      });
    });

    describe('Role-Based Access Control', () => {
      it('should allow admin access to admin endpoint', async () => {
        const response = await request(app.getHttpServer())
          .get('/auth/admin-test')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.message).toBe('Access Granted to Admin');
        expect(response.body.role).toBe('Admin');
      });

      it('should allow admin and organizer access to organizer endpoint', async () => {
        const response = await request(app.getHttpServer())
          .get('/auth/Organizer-test')
          .set('Authorization', `Bearer ${organizerToken}`)
          .expect(200);

        expect(response.body.message).toBe('Access Granted to Admin & Organizer');
      });

      it('should allow customer access to customer endpoint', async () => {
        const response = await request(app.getHttpServer())
          .get('/auth/Customer-test')
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(200);

        expect(response.body.message).toBe('Access Granted to Customer');
      });

      it('should reject customer access to admin endpoint', async () => {
        await request(app.getHttpServer())
          .get('/auth/admin-test')
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(403);
      });

      it('should reject organizer access to admin endpoint', async () => {
        await request(app.getHttpServer())
          .get('/auth/admin-test')
          .set('Authorization', `Bearer ${organizerToken}`)
          .expect(403);
      });
    });
  });

  describe('Categories Management', () => {
    it('should get all categories (public endpoint)', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBe('Categories retrieved successfully');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should create a new category (admin only)', async () => {
      const categoryData = {
        name: 'Technology',
        description: 'Tech related events',
      };

      const response = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(categoryData)
        .expect(201);

      expect(response.body.statusCode).toBe(201);
      expect(response.body.message).toBe('Category created successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(categoryData.name);

      categoryId = response.body.data.id;
    });

    it('should reject category creation without admin role', async () => {
      const categoryData = {
        name: 'Music',
        description: 'Music events',
      };

      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(categoryData)
        .expect(403);
    });

    it('should get category by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/categories/${categoryId}`)
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.data.id).toBe(categoryId);
    });

    it('should update category (admin only)', async () => {
      const updateData = {
        name: 'Updated Technology',
        description: 'Updated tech events',
      };

      const response = await request(app.getHttpServer())
        .patch(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.name).toBe(updateData.name);
    });

    it('should delete category (admin only)', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBe('Category deleted succesfully');
    });
  });

  describe('Events Management', () => {
    // Create a category first for events
    beforeAll(async () => {
      const categoryData = {
        name: 'Technology',
        description: 'Tech related events',
      };

      const response = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(categoryData);

      categoryId = response.body.data.id;
    });

    it('should get published events (public)', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBe('Published events fetched successfully');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should create an event (organizer only)', async () => {
      const eventData = {
        title: 'Tech Conference 2024',
        description: 'A great tech conference',
        categoryId: categoryId,
        venueName: 'Convention Center',
        venueAddress: '123 Main St, City',
        eventDate: '2024-12-25',
        startTime: '14:30:00',
        endTime: '18:00:00',
        totalCapacity: 100,
        bannerImageUrl: 'https://example.com/banner.jpg',
      };

      const response = await request(app.getHttpServer())
        .post('/events/create-event')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send(eventData)
        .expect(201);

      expect(response.body.statusCode).toBe(201);
      expect(response.body.message).toBe('Event created successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe(eventData.title);
      expect(response.body.data.status).toBe('Draft');

      eventId = response.body.data.id;
    });

    it('should reject event creation without organizer role', async () => {
      const eventData = {
        title: 'Customer Event',
        categoryId: categoryId,
        venueName: 'Some Venue',
        venueAddress: 'Some Address',
        eventDate: '2024-12-25',
        startTime: '14:30:00',
        endTime: '18:00:00',
        totalCapacity: 50,
      };

      await request(app.getHttpServer())
        .post('/events/create-event')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(eventData)
        .expect(403);
    });

    it('should get organizer events', async () => {
      const response = await request(app.getHttpServer())
        .get('/events/my-events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBe("Organizer's events fetched successfully");
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get all events (admin only)', async () => {
      const response = await request(app.getHttpServer())
        .get('/events/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBe('Events fetched successfully');
    });

    it('should update an event (organizer only)', async () => {
      const updateData = {
        title: 'Updated Tech Conference 2024',
        description: 'Updated description',
      };

      const response = await request(app.getHttpServer())
        .patch(`/events/${eventId}/update-event`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.title).toBe(updateData.title);
    });

    it('should publish an event (organizer only)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/events/${eventId}/publish-event`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBe('Event has been published');
      expect(response.body.data.status).toBe('Published');
    });

    it('should get published event by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/events/${eventId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.data.id).toBe(eventId);
    });

    it('should delete an event (admin or organizer)', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/events/${eventId}/remove-event`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(204);

      expect(response.body.message).toBe('Event removed');
    });
  });

  describe('User Management', () => {
    it('should get all users (admin only)', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBe('Users retrieved successfully');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toBeDefined();
    });

    it('should reject user list access without admin role', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);
    });

    it('should get user by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.data.id).toBe(userId);
    });

    it('should update user', async () => {
      const updateData = {
        firstName: 'Updated John',
        lastName: 'Updated Doe',
      };

      const response = await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.firstname).toBe(updateData.firstName);
    });

    it('should deactivate user', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/users/deactivate/${userId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(204);

      expect(response.body.message).toContain('deactivated');
    });

    it('should delete user (admin only)', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      expect(response.body.message).toContain('removed PERMANENTLY');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid UUID format', async () => {
      await request(app.getHttpServer())
        .get('/users/invalid-uuid')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });

    it('should handle non-existent resource', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      
      await request(app.getHttpServer())
        .get(`/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should handle validation errors', async () => {
      const invalidEventData = {
        title: '', // empty title
        categoryId: 'invalid-uuid',
        venueName: 'Venue',
        venueAddress: 'Address',
        eventDate: 'invalid-date',
        startTime: 'invalid-time',
        endTime: 'invalid-time',
        totalCapacity: -1, // negative capacity
      };

      await request(app.getHttpServer())
        .post('/events/create-event')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send(invalidEventData)
        .expect(400);
    });
  });
});
