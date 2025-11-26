export const userRegisterSwagger = {
  "/api/auth/userRegister": {
    post: {
      summary: "Register a new user",
      tags: ["User"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["params"],
              properties: {
                params: {
                  type: "object",
                  required: ["name", "email", "password", "role", "phoneNumber"],
                  properties: {
                    name: { type: "string", example: "Rahul Kumar" },
                    email: { type: "string", example: "rahul@example.com" },
                    password: { type: "string", example: "Test@123" },
                    role: { type: "string", example: "admin" },
                    phoneNumber: { type: "string", example: "9876543210" },
                    address: { type: "string", example: "Hyderabad" }
                  }
                }
              }
            }
          }
        }
      },
      responses: {
        201: { description: "User created successfully" },
        400: { description: "User already exists / validation failed" },
        500: { description: "Internal server error" }
      }
    }
  }
};

export const userLoginSwagger = {
  "/api/auth/userLogin": {
    post: {
      summary: "Login user",
      tags: ["User"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["params"],
              properties: {
                params: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", example: "rahul@example.com" },
                    password: { type: "string", example: "Test@123" }
                  }
                }
              }
            }
          }
        }
      },

      responses: {
        200: {
          description: "User logged in successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  status: { type: "number", example: 200 },
                  message: { type: "string", example: "Token generated successfully" },
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        token: { type: "string", example: "jwt_token_here" },
                        userId: { type: "string", example: "650b6eb1131e3ac6d7e04844" },
                        userName: { type: "string", example: "Rahul Kumar" },
                        role: { type: "string", example: "admin" },
                        email: { type: "string", example: "rahul@example.com" }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        400: { description: "Params missing or validation failed" },
        404: { description: "User not found" },
        401: { description: "Incorrect password" },
        500: { description: "Internal server error" }
      }
    }
  }
};

export const refreshTokenSwagger = {
  "/api/auth/refreshToken": {
    post: {
      summary: "Generate new access token using refresh token",
      tags: ["User"],
      requestBody: {
        required: false,
        description: "Refresh token is sent via HttpOnly cookie. No body required."
      },

      responses: {
        200: {
          description: "New access token generated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  status: { type: "number", example: 200 },
                  message: { type: "string", example: "Token generated successfully" },
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        token: { type: "string", example: "new_jwt_token_here" },
                        userId: { type: "string", example: "650b6eb1131e3ac6d7e04844" },
                        userName: { type: "string", example: "Rahul Kumar" },
                        role: { type: "string", example: "user" },
                        email: { type: "string", example: "rahul@example.com" }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        401: {
          description: "No refresh token provided"
        },

        403: {
          description: "Invalid or expired refresh token / Token mismatch"
        },

        500: {
          description: "Internal server error"
        }
      }
    }
  }
};

export const showProfileSwagger = {
  "/api/auth/showProfile": {
    post: {
      summary: "Fetch user profile",
      tags: ["User"],

      parameters: [
        {
          name: "authorization",
          in: "header",
          required: true,
          description: "JWT access token",
          schema: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // your JWT token here
          }
        }
      ],

      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["params"],
              properties: {
                params: {
                  type: "object",
                  required: ["userId"],
                  properties: {
                    userId: { type: "string", example: "650b6eb1131e3ac6d7e04844" }
                  }
                }
              }
            }
          }
        }
      },

      responses: {
        200: { description: "Success" },
        401: { description: "Unauthorized - Missing or invalid token" },
        500: { description: "Internal server error" }
      }
    }
  }
};

export const logoutSwagger = {
  "/api/auth/logout": {
    post: {
      summary: "Logout user and clear refresh token cookie",
      tags: ["User"],

      parameters: [
        {
          name: "x-token",
          in: "header",
          required: true,
          description: "JWT access token",
          schema: {
            type: "string",
            example: "safsadfsd"
          }
        }
      ],

      requestBody: {
        required: false,
        description: "No body needed. Logout simply clears the refresh token cookie."
      },

      responses: {
        200: {
          description: "User logged out successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  status: { type: "number", example: 200 },
                  message: { type: "string", example: "Logged out successfully" },
                  data: {
                    type: "array",
                    example: []
                  }
                }
              }
            }
          }
        },

        500: {
          description: "Internal server error"
        }
      }
    }
  }
};
