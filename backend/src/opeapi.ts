import { getBaseUrl, getEnvironment } from "./utils/env.js";

export const openApiDoc = {
  openapi: "3.0.0",
  info: {
    title: "Neighbour Zone API Documentation",
    version: "1.0.0",
    description: "API documentation for the Neighbour Zone API",
  },
  servers: [
    {
      url: getBaseUrl(),
      description: getEnvironment(),
    },
  ],
  tags: [
    {
      name: "health",
      description: "Health check endpoints",
    },
    {
      name: "auth",
      description: "Authentication endpoints",
    },
    {
      name: "user",
      description: "User endpoints",
    },
    {
      name: "posts",
      description: "Post management endpoints",
    },
  ],
  paths: {
    "/api/health": {
      get: {
        tags: ["health"],
        summary: "Health check",
        description: "Check if the API is running and responding",
        responses: {
          "200": {
            description: "API is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "ok",
                    },
                    timestamp: {
                      type: "string",
                      format: "date-time",
                      example: "2024-01-01T12:00:00.000Z",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["auth"],
        summary: "Register a new user",
        description: "Create a new user account with name, email, and password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password", "confirmPassword"],
                properties: {
                  name: {
                    type: "string",
                    minLength: 2,
                    example: "John Doe",
                    description: "User's full name (minimum 2 characters)",
                  },
                  email: {
                    type: "string",
                    format: "email",
                    example: "john.doe@example.com",
                    description: "Valid email address",
                  },
                  password: {
                    type: "string",
                    minLength: 8,
                    maxLength: 32,
                    example: "SecurePass123!",
                    description:
                      "Password must contain: 8-32 characters, uppercase, lowercase, number, and special character (!@#$%^&*)",
                  },
                  confirmPassword: {
                    type: "string",
                    example: "SecurePass123!",
                    description: "Must match the password field",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description:
              "User registered successfully. Sets HTTP-only refresh_token cookie.",
            headers: {
              "Set-Cookie": {
                description:
                  "HTTP-only cookie containing the refresh token (expires in 7 days)",
                schema: {
                  type: "string",
                  example:
                    "refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict; Path=/",
                },
              },
            },
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    access_token: {
                      type: "string",
                      description:
                        "JWT access token for API authentication (expires in 15 minutes)",
                      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid request - validation errors",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Invalid request",
                    },
                  },
                },
              },
            },
          },
          "409": {
            description: "Email already in use",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Email already in use",
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Something went wrong",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["auth"],
        summary: "Login user",
        description: "Authenticate a user with email and password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "john.doe@example.com",
                    description: "User's email address",
                  },
                  password: {
                    type: "string",
                    example: "SecurePass123!",
                    description: "User's password",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description:
              "Login successful. Sets HTTP-only refresh_token cookie.",
            headers: {
              "Set-Cookie": {
                description:
                  "HTTP-only cookie containing the refresh token (expires in 7 days)",
                schema: {
                  type: "string",
                  example:
                    "refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict; Path=/",
                },
              },
            },
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    access_token: {
                      type: "string",
                      description:
                        "JWT access token for API authentication (expires in 15 minutes)",
                      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid request - validation errors",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Invalid request",
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Invalid credentials",
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Something went wrong",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/refresh": {
      post: {
        tags: ["auth"],
        summary: "Refresh access token",
        description:
          "Get a new access token using a valid refresh token from cookies",
        responses: {
          "200": {
            description: "Token refreshed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    accessToken: {
                      type: "string",
                      description:
                        "New JWT access token (expires in 15 minutes)",
                      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "No refresh token provided or invalid refresh token",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "No refresh token provided",
                    },
                  },
                },
              },
            },
          },
        },
        security: [
          {
            cookieAuth: [],
          },
        ],
      },
    },
    "/api/user/me": {
      get: {
        tags: ["user"],
        summary: "Get current user",
        description: "Get the authenticated user's information",
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          "200": {
            description: "User information retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      format: "uuid",
                      example: "123e4567-e89b-12d3-a456-426614174000",
                    },
                    name: {
                      type: "string",
                      example: "John Doe",
                    },
                    email: {
                      type: "string",
                      format: "email",
                      example: "john.doe@example.com",
                    },
                    role: {
                      type: "string",
                      example: "user",
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized - invalid or missing token",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/post": {
      get: {
        tags: ["posts"],
        summary: "Get all posts",
        description:
          "Retrieve a list of all posts with author information and like counts",
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          "200": {
            description: "Posts retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    posts: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: {
                            type: "string",
                            format: "uuid",
                            example: "123e4567-e89b-12d3-a456-426614174000",
                          },
                          author: {
                            type: "string",
                            example: "John Doe",
                          },
                          authorId: {
                            type: "string",
                            format: "uuid",
                            example: "123e4567-e89b-12d3-a456-426614174000",
                          },
                          title: {
                            type: "string",
                            example: "Community Event This Weekend",
                          },
                          content: {
                            type: "string",
                            example:
                              "Join us for a neighborhood cleanup event...",
                          },
                          type: {
                            type: "string",
                            enum: ["news", "tip"],
                            example: "news",
                          },
                          createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2024-01-01T12:00:00.000Z",
                          },
                          likes: {
                            type: "integer",
                            example: 5,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized - invalid or missing token",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["posts"],
        summary: "Create a new post",
        description: "Create a new post (news or tip)",
        security: [
          {
            bearerAuth: [],
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
                  title: {
                    type: "string",
                    minLength: 1,
                    maxLength: 255,
                    example: "Community Event This Weekend",
                    description: "Post title (1-255 characters)",
                  },
                  content: {
                    type: "string",
                    minLength: 1,
                    example: "Join us for a neighborhood cleanup event...",
                    description: "Post content",
                  },
                  type: {
                    type: "string",
                    enum: ["news", "tip"],
                    example: "news",
                    description: "Type of post",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Post created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    post: {
                      $ref: "#/components/schemas/Post",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid request - validation errors",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "401": {
            description: "Unauthorized - invalid or missing token",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/post/{id}": {
      get: {
        tags: ["posts"],
        summary: "Get a single post",
        description: "Retrieve a specific post by ID",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
            description: "Post ID",
          },
        ],
        responses: {
          "200": {
            description: "Post retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    post: {
                      $ref: "#/components/schemas/Post",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid request - invalid ID format",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "401": {
            description: "Unauthorized - invalid or missing token",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "404": {
            description: "Post not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ["posts"],
        summary: "Update a post",
        description: "Update an existing post (only by the author)",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
            description: "Post ID",
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
                  title: {
                    type: "string",
                    minLength: 1,
                    maxLength: 255,
                    example: "Updated Post Title",
                  },
                  content: {
                    type: "string",
                    minLength: 1,
                    example: "Updated post content...",
                  },
                  type: {
                    type: "string",
                    enum: ["news", "tip"],
                    example: "news",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Post updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    post: {
                      $ref: "#/components/schemas/Post",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid request - validation errors",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "401": {
            description: "Unauthorized - invalid or missing token",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "403": {
            description: "Forbidden - not the post author",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Unauthorized to update this post",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Post not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["posts"],
        summary: "Delete a post",
        description: "Delete a post (only by the author)",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
            description: "Post ID",
          },
        ],
        responses: {
          "200": {
            description: "Post deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Post deleted successfully",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid request - invalid ID format",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "401": {
            description: "Unauthorized - invalid or missing token",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "403": {
            description: "Forbidden - not the post author",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Unauthorized to delete this post",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Post not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      User: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "Unique user identifier",
          },
          name: {
            type: "string",
            description: "User's full name",
          },
          email: {
            type: "string",
            format: "email",
            description: "User's email address",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Account creation timestamp",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Last account update timestamp",
          },
        },
      },
      Post: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "Unique post identifier",
          },
          authorId: {
            type: "string",
            format: "uuid",
            description: "ID of the post author",
          },
          author: {
            type: "string",
            description: "Name of the post author",
          },
          title: {
            type: "string",
            description: "Post title",
          },
          content: {
            type: "string",
            description: "Post content",
          },
          type: {
            type: "string",
            enum: ["news", "tip"],
            description: "Type of post",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Post creation timestamp",
          },
          likes: {
            type: "integer",
            description: "Number of likes",
          },
        },
      },
      Error: {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: "Error message",
          },
        },
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT token obtained from login or registration",
      },
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "refresh_token",
        description:
          "Refresh token stored in httpOnly cookie (expires in 7 days)",
      },
    },
  },
};
