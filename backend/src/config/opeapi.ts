import { getBaseUrl, getEnvironment } from "../utils/env.js";

export const openApiDoc = {
  openapi: "3.0.0",
  info: {
    title: "Neighbour Zone API",
    version: "1.0.0",
    description: "API documentation for Neighbour Zone application",
  },
  servers: [
    {
      url: getBaseUrl() + "/api",
      description:
        getEnvironment() === "production"
          ? "Production server"
          : "Development server",
    },
  ],
  tags: [
    { name: "Auth", description: "Authentication endpoints" },
    { name: "User", description: "User management endpoints" },
    { name: "Post", description: "Post management endpoints" },
    { name: "Event", description: "Event management endpoints" },
    { name: "Marketplace", description: "Marketplace management endpoints" },
    { name: "Friend", description: "Friend management endpoints" },
  ],
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "409": { $ref: "#/components/responses/Conflict" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login an existing user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "User logged in successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/user/me": {
      get: {
        tags: ["User"],
        summary: "Get current user info",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "User info retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      patch: {
        tags: ["User"],
        summary: "Update current user info",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserUpdateInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "User updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
      delete: {
        tags: ["User"],
        summary: "Delete current user account",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { $ref: "#/components/responses/Success" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/user/me/password": {
      patch: {
        tags: ["User"],
        summary: "Update user password",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PasswordInput" },
            },
          },
        },
        responses: {
          "200": { $ref: "#/components/responses/Success" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/post": {
      get: {
        tags: ["Post"],
        summary: "Get all posts",
        security: [{ bearerAuth: [] }],
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
                      items: { $ref: "#/components/schemas/Post" },
                    },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
      post: {
        tags: ["Post"],
        summary: "Create a new post",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PostInput" },
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
                    post: { $ref: "#/components/schemas/Post" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/post/{id}": {
      get: {
        tags: ["Post"],
        summary: "Get a single post by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
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
                    post: { $ref: "#/components/schemas/Post" },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      patch: {
        tags: ["Post"],
        summary: "Update a post",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PostInput" },
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
                    post: { $ref: "#/components/schemas/Post" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Post"],
        summary: "Delete a post",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { $ref: "#/components/responses/Success" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/post/{id}/like": {
      post: {
        tags: ["Post"],
        summary: "Like a post",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { $ref: "#/components/responses/Success" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Post"],
        summary: "Unlike a post",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { $ref: "#/components/responses/Success" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/event": {
      get: {
        tags: ["Event"],
        summary: "Get all events",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
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
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
      post: {
        tags: ["Event"],
        summary: "Create a new event",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/EventInput" },
            },
          },
        },
        responses: {
          "201": {
            description: "Event created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    event: { $ref: "#/components/schemas/Event" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/event/{id}": {
      get: {
        tags: ["Event"],
        summary: "Get a single event by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Event retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    event: { $ref: "#/components/schemas/Event" },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      patch: {
        tags: ["Event"],
        summary: "Update an event",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/EventInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "Event updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    event: { $ref: "#/components/schemas/Event" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Event"],
        summary: "Delete an event",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { $ref: "#/components/responses/Success" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/event/{id}/like": {
      post: {
        tags: ["Event"],
        summary: "Like an event",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { $ref: "#/components/responses/Success" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Event"],
        summary: "Unlike an event",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { $ref: "#/components/responses/Success" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/event/{id}/attend": {
      post: {
        tags: ["Event"],
        summary: "Attend an event",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { $ref: "#/components/responses/Success" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Event"],
        summary: "Cancel event attendance",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { $ref: "#/components/responses/Success" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/marketplace": {
      get: {
        tags: ["Marketplace"],
        summary: "Get all marketplace items",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
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
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
      post: {
        tags: ["Marketplace"],
        summary: "Create a new marketplace item",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MarketplaceItemInput" },
            },
          },
        },
        responses: {
          "201": {
            description: "Marketplace item created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    marketplaceItem: {
                      $ref: "#/components/schemas/MarketplaceItem",
                    },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/marketplace/{id}": {
      get: {
        tags: ["Marketplace"],
        summary: "Get a single marketplace item by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Marketplace item retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    marketplaceItem: {
                      $ref: "#/components/schemas/MarketplaceItem",
                    },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      patch: {
        tags: ["Marketplace"],
        summary: "Update a marketplace item",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MarketplaceItemInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "Marketplace item updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    marketplaceItem: {
                      $ref: "#/components/schemas/MarketplaceItem",
                    },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Marketplace"],
        summary: "Delete a marketplace item",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { $ref: "#/components/responses/Success" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/marketplace/{id}/apply": {
      post: {
        tags: ["Marketplace"],
        summary: "Apply for a marketplace item",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/MarketplaceApplicationInput",
              },
            },
          },
        },
        responses: {
          "200": { $ref: "#/components/responses/Success" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/friend/list": {
      get: {
        tags: ["Friend"],
        summary: "Get list of friends",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Friends list retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    friends: {
                      type: "array",
                      items: { $ref: "#/components/schemas/UserBasic" },
                    },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/friend/requests": {
      get: {
        tags: ["Friend"],
        summary: "Get incoming friend requests",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Friend requests retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    requests: {
                      type: "array",
                      items: { $ref: "#/components/schemas/UserBasic" },
                    },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/friend/sent": {
      get: {
        tags: ["Friend"],
        summary: "Get sent friend requests",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Sent friend requests retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    sent: {
                      type: "array",
                      items: { $ref: "#/components/schemas/UserBasic" },
                    },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/friend/{id}/request": {
      post: {
        tags: ["Friend"],
        summary: "Send a friend request",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { $ref: "#/components/responses/Success" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/friend/{id}/accept": {
      post: {
        tags: ["Friend"],
        summary: "Accept a friend request",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { $ref: "#/components/responses/Success" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/friend/{id}/reject": {
      post: {
        tags: ["Friend"],
        summary: "Reject a friend request",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { $ref: "#/components/responses/Success" },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      RegisterInput: {
        type: "object",
        required: [
          "firstname",
          "lastname",
          "username",
          "email",
          "phoneNumber",
          "password",
        ],
        properties: {
          firstname: {
            type: "string",
            minLength: 2,
          },
          lastname: {
            type: "string",
            minLength: 2,
          },
          username: {
            type: "string",
            minLength: 3,
            maxLength: 20,
          },
          email: {
            type: "string",
            format: "email",
          },
          phoneNumber: {
            type: "string",
            minLength: 10,
            maxLength: 15,
          },
          password: {
            type: "string",
            minLength: 8,
            pattern:
              "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
          },
        },
      },
      LoginInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
          },
          password: {
            type: "string",
            minLength: 1,
          },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          accessToken: {
            type: "string",
          },
        },
      },
      User: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
          },
          username: {
            type: "string",
          },
          firstname: {
            type: "string",
          },
          lastname: {
            type: "string",
          },
          email: {
            type: "string",
            format: "email",
          },
          phoneNumber: {
            type: "string",
          },
          bio: {
            type: "string",
            nullable: true,
          },
          role: {
            type: "string",
            enum: ["user", "admin"],
          },
        },
      },
      UserBasic: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
          },
          username: {
            type: "string",
          },
        },
      },
      UserUpdateInput: {
        type: "object",
        properties: {
          firstname: {
            type: "string",
            minLength: 2,
          },
          lastname: {
            type: "string",
            minLength: 2,
          },
          username: {
            type: "string",
            minLength: 2,
          },
          email: {
            type: "string",
            format: "email",
          },
          bio: {
            type: "string",
            maxLength: 160,
          },
        },
      },
      PasswordInput: {
        type: "object",
        required: ["password"],
        properties: {
          password: {
            type: "string",
            minLength: 8,
            pattern:
              "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
          },
        },
      },
      PostInput: {
        type: "object",
        required: ["title", "content", "type"],
        properties: {
          title: {
            type: "string",
            minLength: 1,
            maxLength: 255,
          },
          content: {
            type: "string",
            minLength: 1,
          },
          type: {
            type: "string",
            enum: ["news", "tip"],
          },
        },
      },
      Post: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
          },
          title: {
            type: "string",
          },
          content: {
            type: "string",
          },
          type: {
            type: "string",
            enum: ["news", "tip"],
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          author: {
            $ref: "#/components/schemas/UserBasic",
          },
          likes: {
            type: "number",
          },
          liked: {
            type: "boolean",
          },
        },
      },
      EventInput: {
        type: "object",
        required: ["title", "description", "location", "dateTime"],
        properties: {
          title: {
            type: "string",
            minLength: 1,
            maxLength: 255,
          },
          description: {
            type: "string",
            minLength: 1,
          },
          location: {
            type: "string",
            minLength: 1,
            maxLength: 255,
          },
          dateTime: {
            type: "string",
            format: "date-time",
          },
          endAt: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
        },
      },
      Event: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
          },
          title: {
            type: "string",
          },
          description: {
            type: "string",
          },
          location: {
            type: "string",
          },
          dateTime: {
            type: "string",
            format: "date-time",
          },
          endAt: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          organizer: {
            $ref: "#/components/schemas/UserBasic",
          },
          likes: {
            type: "number",
          },
          liked: {
            type: "boolean",
          },
        },
      },
      MarketplaceItemInput: {
        type: "object",
        required: ["title", "description", "location", "category"],
        properties: {
          title: {
            type: "string",
            minLength: 1,
            maxLength: 100,
          },
          description: {
            type: "string",
            minLength: 1,
            maxLength: 1000,
          },
          price: {
            type: "number",
            multipleOf: 0.01,
            nullable: true,
          },
          location: {
            type: "string",
            minLength: 1,
            maxLength: 100,
          },
          category: {
            type: "string",
            enum: ["wanted", "offered"],
            default: "offered",
          },
        },
      },
      MarketplaceItem: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
          },
          title: {
            type: "string",
          },
          description: {
            type: "string",
          },
          price: {
            type: "number",
            nullable: true,
          },
          location: {
            type: "string",
          },
          category: {
            type: "string",
            enum: ["wanted", "offered"],
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          provider: {
            $ref: "#/components/schemas/UserBasic",
          },
          applied: {
            type: "boolean",
          },
        },
      },
      MarketplaceApplicationInput: {
        type: "object",
        properties: {
          message: {
            type: "string",
            minLength: 1,
            maxLength: 1000,
            nullable: true,
          },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          message: {
            type: "string",
          },
        },
      },
    },
    responses: {
      Success: {
        description: "Operation successful",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                },
              },
            },
          },
        },
      },
      BadRequest: {
        description: "Bad request",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      Unauthorized: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      Forbidden: {
        description: "Forbidden",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      NotFound: {
        description: "Resource not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      Conflict: {
        description: "Conflict",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
    },
  },
};
