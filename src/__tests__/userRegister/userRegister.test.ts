// src/__tests__/userRegister.test.ts
import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import router from "../../routes/user.auth"; // your router file
import { UserModel } from "../../models/user.model"; // your Mongoose User model
import * as crudService from "../../utils/handleCrudOperation";
import * as passwordUtils from "../../utils/passwordUtils";
import * as validator from "../../utils/userValidation";

const app = express();
app.use(express.json());
app.use("/api/auth", router);

// -------------------- UNIT TEST SETUP --------------------
jest.mock("../../utils/handleCrudOperation");
jest.mock("../../utils/passwordUtils");
jest.mock("../../utils/userValidation");

beforeEach(() => {
    jest.clearAllMocks();
});

// -------------------- INTEGRATION TEST SETUP --------------------
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await UserModel.deleteMany({});
});

// -------------------- UNIT TESTS --------------------
describe("Unit Test - POST /userRegister", () => {
    it("should return 400 if params are empty", async () => {
        const response = await request(app).post("/api/auth/userRegister").send({ params: {} });
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ success: false, status: 400, message: "params are required", data: [] });
    });

    it("should return 400 if validation fails", async () => {
        (validator.validateUser as jest.Mock).mockImplementation(async (req, res, next) => {
            return res.status(400).json({ success: false, status: 400, message: "Validation failed", data: [] });
        });

        const response = await request(app).post("/api/auth/userRegister").send({
            params: { name: "Test", email: "invalid-email", password: "123", role: "user", phoneNumber: 1234567890 }
        });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Validation failed");
    });

    it("should return 400 if user already exists", async () => {
        (crudService.handleCrudOperation as jest.Mock).mockResolvedValue({
            success: true,
            data: [{ name: "Test", email: "test@test.com" }]
        });

        (validator.validateUser as jest.Mock).mockImplementation(async (req, res, next) => next());

        const response = await request(app).post("/api/auth/userRegister").send({
            params: { name: "Test", email: "test@test.com", password: "123", role: "user", phoneNumber: 1234567890 }
        });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("User already exists");
    });

    it("should return 500 if password hashing fails", async () => {
        (crudService.handleCrudOperation as jest.Mock).mockResolvedValue({ success: true, data: [] });
        (passwordUtils.hashPassword as jest.Mock).mockResolvedValue({ success: false, status: 500, message: "Hashing failed", data: [] });
        (validator.validateUser as jest.Mock).mockImplementation(async (req, res, next) => next());

        const response = await request(app).post("/api/auth/userRegister").send({
            params: { name: "New User", email: "new@test.com", password: "123", role: "user", phoneNumber: 1234567890 }
        });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Hashing failed");
    });

    it("should create user successfully (mocked)", async () => {
        (crudService.handleCrudOperation as jest.Mock)
            .mockResolvedValueOnce({ success: true, data: [] }) // check user exists
            .mockResolvedValueOnce({
                success: true,
                status: 201,
                message: "User created",
                data: { _id: "1", name: "New User" }
            });
        (passwordUtils.hashPassword as jest.Mock).mockResolvedValue({ success: true, data: "hashedPassword123" });
        (validator.validateUser as jest.Mock).mockImplementation(async (req, res, next) => next());

        const response = await request(app).post("/api/auth/userRegister").send({
            params: { name: "New User", email: "new@test.com", password: "123", role: "user", phoneNumber: 1234567890 }
        });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe("New User");
    });
});

// -------------------- INTEGRATION TESTS --------------------
describe("Integration Test - POST /userRegister", () => {
    it("should create a user successfully in real DB", async () => {
        const res = await request(app).post("/api/auth/userRegister").send({
            params: {
                name: "Integration User",
                email: "integration@test.com",
                password: "password123",
                address: "testing purpose",
                role: "user",
                phoneNumber: 1234567890
            }
        });
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
    });

    // it("should not allow duplicate user in real DB", async () => {
    //     // Step 1: Create user manually in DB
    //     const hashedPassword = "hashedPassword123";
    //     const createdUser = await UserModel.create({
    //         name: "Duplicate",
    //         email: "dup@test.com",
    //         password: hashedPassword,
    //         role: "user",
    //         address: "testing purpose",
    //         phoneNumber: 1234567890,
    //     });
    //     expect(createdUser).toBeTruthy();
    //     console.log("createdUser", createdUser)

    //     // Step 2: Try to register again (duplicate)
    //     const res = await request(app)
    //         .post("/api/auth/userRegister")
    //         .send({
    //             params: {
    //                 name: "Duplicate",
    //                 email: "dup@test.com",
    //                 password: "password123",
    //                 role: "user",
    //                 address: "testing purpose",
    //                 phoneNumber: 1234567890,
    //             },
    //         });

    //     console.log("Response for duplicate user:", res.data);

    //     // Step 3: Assert the response
    //     expect(res.status).toBe(400);
    //     expect(res.body).toEqual({
    //         success: false,
    //         status: 400,
    //         message: "User already exists",
    //         data: [],
    //     });
    // });

});
