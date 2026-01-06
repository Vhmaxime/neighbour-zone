export const openApiDoc = {
  openapi: "3.0.0",
  info: {
    title: "Neighbour-zone API Documentation",
    version: "1.0.0",
    description:
      "API documentation for the Neighbour-zone service - A platform for local community services and support",
  },
  servers: [
    {
      url: process.env.VERCEL_URL || "http://localhost:3000",
      description:
        process.env.VERCEL_ENV === "production"
          ? "Production Deployment"
          : process.env.VERCEL_ENV === "preview"
          ? "Preview Deployment"
          : "Local Development",
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
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: {
                      type: "string",
                      description:
                        "JWT authentication token (expires in 1 minute)",
                      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    },
                    user: {
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
                      },
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
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: {
                      type: "string",
                      description:
                        "JWT authentication token (expires in 1 hour)",
                      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    },
                    user: {
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
                      },
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
    },
  },
};
