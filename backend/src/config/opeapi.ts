import { getBaseUrl, getEnvironment } from "../utils/env.js";

export const openApiDoc = {
  openapi: "3.0.0",
  info: {
    title: "Neighbour Zone API",
    version: "1.0.0",
    description: "API for the Neighbour Zone platform",
  },
  servers: [
    {
      url: getBaseUrl() + "/api",
      description: getEnvironment(),
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          role: { type: "string", enum: ["user", "admin"] },
        },
        example: {
          id: "550e8400-e29b-41d4-a716-446655440000",
          name: "John Doe",
          email: "john.doe@example.com",
          role: "user",
        },
      },
      Post: {
        type: "object",
        properties: {
          id: { type: "string" },
          author: { type: "string" },
          authorId: { type: "string" },
          title: { type: "string" },
          content: { type: "string" },
          type: {
            type: "string",
            enum: ["offer", "request", "event", "announcement"],
          },
          createdAt: { type: "string", format: "date-time" },
          likes: { type: "number" },
        },
      },
      MarketplaceItem: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          userId: { type: "string" },
          userName: { type: "string" },
          description: { type: "string" },
          price: { type: "number", nullable: true },
          location: { type: "string" },
          category: { type: "string", enum: ["wanted", "offered"] },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Event: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          location: { type: "string" },
          dateTime: { type: "string", format: "date-time" },
          endAt: { type: "string", format: "date-time", nullable: true },
          organizer: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
            },
          },
          createdAt: { type: "string", format: "date-time" },
          likes: { type: "number" },
          liked: { type: "boolean" },
        },
      },
      Error: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        summary: "Health check endpoint",
        tags: ["System"],
        responses: {
          200: {
            description: "System is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string" },
                    timestamp: { type: "string", format: "date-time" },
                    env: { type: "string" },
                    origin: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/auth/register": {
      post: {
        summary: "Register a new user",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", minLength: 3 },
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                },
              },
              example: {
                name: "John Doe",
                email: "john.doe@example.com",
                password: "securePassword123",
              },
            },
          },
        },
        responses: {
          200: {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    accessToken: { type: "string" },
                  },
                },
                example: {
                  accessToken:
                    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6InVzZXIiLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
                },
              },
            },
          },
          400: {
            description: "Bad request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          409: {
            description: "Email already in use",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        summary: "Login a user",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
              example: {
                email: "john.doe@example.com",
                password: "securePassword123",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    accessToken: { type: "string" },
                  },
                },
                example: {
                  accessToken:
                    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6InVzZXIiLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
                },
              },
            },
          },
          400: {
            description: "Bad request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/auth/refresh": {
      post: {
        summary: "Refresh access token",
        tags: ["Authentication"],
        responses: {
          200: {
            description: "Token refreshed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    accessToken: { type: "string" },
                  },
                },
              },
            },
          },
          401: {
            description: "No refresh token provided",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/user/me": {
      get: {
        summary: "Get current user information",
        tags: ["User"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "User information retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
                example: {
                  user: {
                    id: "550e8400-e29b-41d4-a716-446655440000",
                    name: "John Doe",
                    email: "john.doe@example.com",
                    role: "user",
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/post": {
      get: {
        summary: "Get all posts",
        tags: ["Posts"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Posts retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    posts: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Post" },
                    },
                  },
                },
                example: {
                  posts: [
                    {
                      id: "550e8400-e29b-41d4-a716-446655440001",
                      author: "John Doe",
                      authorId: "550e8400-e29b-41d4-a716-446655440000",
                      title: "Looking for a gardener",
                      content:
                        "I need someone to help with my garden this weekend. Any takers?",
                      type: "request",
                      createdAt: "2026-01-08T12:00:00Z",
                      likes: 5,
                    },
                    {
                      id: "550e8400-e29b-41d4-a716-446655440002",
                      author: "Jane Smith",
                      authorId: "550e8400-e29b-41d4-a716-446655440003",
                      title: "Community BBQ this Saturday",
                      content: "Join us for a neighbourhood BBQ at the park!",
                      type: "event",
                      createdAt: "2026-01-07T15:30:00Z",
                      likes: 12,
                    },
                  ],
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      post: {
        summary: "Create a new post",
        tags: ["Posts"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "content", "type"],
                properties: {
                  title: { type: "string", minLength: 1 },
                  content: { type: "string", minLength: 1 },
                  type: {
                    type: "string",
                    enum: ["offer", "request", "event", "announcement"],
                  },
                },
              },
              example: {
                title: "Free piano lessons",
                content:
                  "I'm offering free piano lessons for beginners every Tuesday evening.",
                type: "offer",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Post created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    post: { $ref: "#/components/schemas/Post" },
                  },
                },
                example: {
                  post: {
                    id: "550e8400-e29b-41d4-a716-446655440010",
                    author: "John Doe",
                    authorId: "550e8400-e29b-41d4-a716-446655440000",
                    title: "Free piano lessons",
                    content:
                      "I'm offering free piano lessons for beginners every Tuesday evening.",
                    type: "offer",
                    createdAt: "2026-01-08T14:30:00Z",
                    likes: 0,
                  },
                },
              },
            },
          },
          400: {
            description: "Bad request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/post/{id}": {
      get: {
        summary: "Get a post by ID",
        tags: ["Posts"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Post retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    post: { $ref: "#/components/schemas/Post" },
                  },
                },
              },
            },
          },
          400: {
            description: "Bad request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Post not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      patch: {
        summary: "Update a post",
        tags: ["Posts"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "content", "type"],
                properties: {
                  title: { type: "string", minLength: 1 },
                  content: { type: "string", minLength: 1 },
                  type: {
                    type: "string",
                    enum: ["offer", "request", "event", "announcement"],
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Post updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    post: { $ref: "#/components/schemas/Post" },
                  },
                },
              },
            },
          },
          400: {
            description: "Bad request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          403: {
            description: "Forbidden - not the post author",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Post not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      delete: {
        summary: "Delete a post",
        tags: ["Posts"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Post deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description: "Bad request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          403: {
            description: "Forbidden - not the post author",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Post not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/post/{id}/like": {
      post: {
        summary: "Like or unlike a post",
        tags: ["Posts"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Like toggled successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description: "Bad request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Post not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/marketplace": {
      get: {
        summary: "Get all marketplace items",
        tags: ["Marketplace"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Marketplace items retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    marketplace: {
                      type: "array",
                      items: { $ref: "#/components/schemas/MarketplaceItem" },
                    },
                  },
                },
                example: {
                  marketplace: [
                    {
                      id: "550e8400-e29b-41d4-a716-446655440020",
                      title: "Lawn mowing service",
                      userId: "550e8400-e29b-41d4-a716-446655440000",
                      userName: "John Doe",
                      description:
                        "Professional lawn mowing service available on weekends.",
                      price: 25.0,
                      location: "Downtown neighbourhood",
                      category: "offered",
                      createdAt: "2026-01-08T10:00:00Z",
                    },
                    {
                      id: "550e8400-e29b-41d4-a716-446655440021",
                      title: "Bicycle for rent",
                      userId: "550e8400-e29b-41d4-a716-446655440003",
                      userName: "Jane Smith",
                      description: "Mountain bike available for daily rental.",
                      price: 15.0,
                      location: "Park area",
                      category: "offered",
                      createdAt: "2026-01-07T16:00:00Z",
                    },
                  ],
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      post: {
        summary: "Create a new marketplace item",
        tags: ["Marketplace"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "description", "location", "category"],
                properties: {
                  title: { type: "string", minLength: 1 },
                  description: { type: "string", minLength: 1 },
                  location: { type: "string", minLength: 1 },
                  price: { type: "number", nullable: true },
                  category: {
                    type: "string",
                    enum: ["wanted", "offered"],
                  },
                },
              },
              example: {
                title: "Snow removal service",
                description:
                  "Quick and reliable snow removal for driveways and walkways.",
                location: "North neighbourhood",
                price: 40.0,
                category: "offered",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Marketplace item created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    marketplace: {
                      $ref: "#/components/schemas/MarketplaceItem",
                    },
                  },
                },
                example: {
                  marketplace: {
                    id: "550e8400-e29b-41d4-a716-446655440030",
                    title: "Snow removal service",
                    userId: "550e8400-e29b-41d4-a716-446655440000",
                    userName: "John Doe",
                    description:
                      "Quick and reliable snow removal for driveways and walkways.",
                    price: 40.0,
                    location: "North neighbourhood",
                    category: "offered",
                    createdAt: "2026-01-08T14:45:00Z",
                  },
                },
              },
            },
          },
          400: {
            description: "Bad request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/marketplace/{id}": {
      get: {
        summary: "Get a marketplace item by ID",
        tags: ["Marketplace"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Marketplace item retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    marketplace: {
                      $ref: "#/components/schemas/MarketplaceItem",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Bad request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Marketplace item not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      patch: {
        summary: "Update a marketplace item",
        tags: ["Marketplace"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "description", "location", "category"],
                properties: {
                  title: { type: "string", minLength: 1 },
                  description: { type: "string", minLength: 1 },
                  location: { type: "string", minLength: 1 },
                  price: { type: "number", nullable: true },
                  category: {
                    type: "string",
                    enum: ["wanted", "offered"],
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Marketplace item updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    marketplace: {
                      $ref: "#/components/schemas/MarketplaceItem",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Bad request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          403: {
            description: "Forbidden - not the item owner",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Marketplace item not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      delete: {
        summary: "Delete a marketplace item",
        tags: ["Marketplace"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Marketplace item deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description: "Bad request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          403: {
            description: "Forbidden - not the item owner",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Marketplace item not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/marketplace/{id}/apply": {
      post: {
        summary: "Apply to a marketplace item",
        tags: ["Marketplace"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    minLength: 1,
                    maxLength: 1000,
                    description:
                      "Optional message to send with the application",
                  },
                },
              },
              example: {
                message:
                  "Hi, I'm interested in this item. When can we arrange a meeting?",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Application submitted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description: "Bad request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Marketplace item not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/event": {
      get: {
        summary: "Get all events",
        tags: ["Events"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Events retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    events: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Event" },
                    },
                  },
                },
                example: {
                  events: [
                    {
                      id: "550e8400-e29b-41d4-a716-446655440050",
                      title: "Neighbourhood BBQ",
                      description:
                        "Join us for our annual summer BBQ in the park!",
                      location: "Central Park",
                      dateTime: "2026-06-15T18:00:00Z",
                      endAt: "2026-06-15T22:00:00Z",
                      organizer: {
                        id: "550e8400-e29b-41d4-a716-446655440000",
                        name: "John Doe",
                      },
                      createdAt: "2026-01-08T10:00:00Z",
                      likes: 15,
                      liked: false,
                    },
                    {
                      id: "550e8400-e29b-41d4-a716-446655440051",
                      title: "Book Club Meeting",
                      description: "Monthly book club discussion",
                      location: "Community Center",
                      dateTime: "2026-01-20T19:00:00Z",
                      endAt: null,
                      organizer: {
                        id: "550e8400-e29b-41d4-a716-446655440003",
                        name: "Jane Smith",
                      },
                      createdAt: "2026-01-05T14:30:00Z",
                      likes: 8,
                      liked: true,
                    },
                  ],
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      post: {
        summary: "Create a new event",
        tags: ["Events"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "description", "location", "dateTime"],
                properties: {
                  title: { type: "string", minLength: 1 },
                  description: { type: "string", minLength: 1 },
                  location: { type: "string", minLength: 1 },
                  dateTime: { type: "string", format: "date-time" },
                  endAt: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                  },
                },
              },
              example: {
                title: "Yoga in the Park",
                description: "Free outdoor yoga session for all levels",
                location: "Riverside Park",
                dateTime: "2026-02-10T09:00:00Z",
                endAt: "2026-02-10T10:30:00Z",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Event created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    event: { $ref: "#/components/schemas/Event" },
                  },
                },
                example: {
                  event: {
                    id: "550e8400-e29b-41d4-a716-446655440060",
                    title: "Yoga in the Park",
                    description: "Free outdoor yoga session for all levels",
                    location: "Riverside Park",
                    dateTime: "2026-02-10T09:00:00Z",
                    endAt: "2026-02-10T10:30:00Z",
                    organizer: {
                      id: "550e8400-e29b-41d4-a716-446655440000",
                      name: "John Doe",
                    },
                    createdAt: "2026-01-08T15:00:00Z",
                    likes: 0,
                    liked: false,
                  },
                },
              },
            },
          },
          400: {
            description: "Bad request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/event/{id}": {
      get: {
        summary: "Get an event by ID",
        tags: ["Events"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Event retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    event: { $ref: "#/components/schemas/Event" },
                    likedBy: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          user: {
                            type: "object",
                            properties: {
                              id: { type: "string" },
                              name: { type: "string" },
                            },
                          },
                        },
                      },
                      description: "Only included if the user is the organizer",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Bad request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Event not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      patch: {
        summary: "Update an event",
        tags: ["Events"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "description", "location", "dateTime"],
                properties: {
                  title: { type: "string", minLength: 1 },
                  description: { type: "string", minLength: 1 },
                  location: { type: "string", minLength: 1 },
                  dateTime: { type: "string", format: "date-time" },
                  endAt: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Event updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description: "Bad request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          403: {
            description: "Forbidden - not the event organizer",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Event not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      delete: {
        summary: "Delete an event",
        tags: ["Events"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Event deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description: "Bad request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          403: {
            description: "Forbidden - not the event organizer",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Event not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/event/{id}/like": {
      post: {
        summary: "Like or unlike an event",
        tags: ["Events"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Like toggled successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description: "Bad request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Event not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
  },
  tags: [
    { name: "System", description: "System endpoints" },
    { name: "Authentication", description: "Authentication endpoints" },
    { name: "User", description: "User endpoints" },
    { name: "Posts", description: "Post management endpoints" },
    { name: "Marketplace", description: "Marketplace management endpoints" },
    { name: "Events", description: "Event management endpoints" },
  ],
};
