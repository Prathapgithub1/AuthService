import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { userRegisterSwagger,userLoginSwagger,refreshTokenSwagger,showProfileSwagger,logoutSwagger } from "./users.swagger";

export const setupSwagger = (app: Express) => {
  const options: swaggerJSDoc.Options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Healthcare management system auth microservice API",
        version: "1.0.0",
        description: "API documentation",
      },
      servers: [
        {
          url: "http://localhost:5000",
        },
      ],
      paths:{
        ...userRegisterSwagger,...userLoginSwagger,...refreshTokenSwagger,...showProfileSwagger,...logoutSwagger
      }
    },

    // Path to the API docs
    apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
  };

  const swaggerSpec = swaggerJSDoc(options);

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};