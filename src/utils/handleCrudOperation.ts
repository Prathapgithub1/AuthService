import { Model, Document } from "mongoose"
import { modelRegistry } from "../models/modelRigistry"

/**
 * Generic CRUD operation handler for Mongoose models.
 * Designed for reusability and scalability across multiple collections.
 * @param modelName - Name of the model from modelRegistry
 * @param action - Type of CRUD operation (find, insertOne, updateOne, etc.)
 * @param params - Parameters for the given action (filters, data, etc.)
 * @returns Standardized response object with status, message, and data
 */

type CrudAction = | "insertMany" | "insertOne" | "find" | "findOne" | "findById" | "updateOne" | "updateMany" | "findOneAndUpdate" | "findByIdAndUpdate" | "deleteOne" | "deleteMany" | "findOneAndDelete" | "findByIdAndDelete" | "aggregate" | "countDocuments";

interface CrudParams {
    filter?: any;
    updateData?: any;
    id?: string;
    pipeline?: any[];
    [key: string]: any;
}

export const handleCrudOperation = async <T extends Document>(modelName: string, action: CrudAction, params: CrudParams | any[]): Promise<{ success: boolean; status: number; message: string; data: T | T[] }> => {
    const Model: Model<Document> = modelRegistry[modelName];
    if (!Model) {
        return { success: false, status: 400, message: `Model ${modelName} not found in registry`, data: [] };
    }
    try {
        let result: any;
        switch (action) {
            case 'insertMany':
                result = await Model.insertMany(params);
                break;

            case 'insertOne':
                result = await Model.create(params);
                break;
            case 'find':
                result = await Model.find(params);
                break;
            case 'updateOne':
                if (Array.isArray(params)) {
                    throw new Error("Invalid params for updateOne: expected an object with 'filter' and 'updateData' properties.");
                }
                result = await Model.updateOne(params.filter, params.updateData);
                break;
            case 'deleteOne':
                result = await Model.deleteOne(params);
                break;
            case 'deleteMany':
                result = await Model.deleteMany(params);
                break;
            case 'findOne':
                result = await Model.findOne(params);
            case 'updateMany':
                if (Array.isArray(params)) {
                    throw new Error("Invalid params for updateMany: expected an object with 'filter' and 'updateData' properties.");
                }
                result = await Model.updateMany(params.filter, params.updateData);
                break;
            case 'aggregate':
                // accept either a pipeline array or an object with a `pipeline` property
                if (Array.isArray(params)) {
                    result = await Model.aggregate(params as any[]);
                } else if (params && (params as CrudParams).pipeline && Array.isArray((params as CrudParams).pipeline)) {
                    result = await Model.aggregate((params as CrudParams).pipeline as any[]);
                } else {
                    // no valid pipeline provided — run an empty pipeline to avoid type errors
                    result = await Model.aggregate([]);
                }
                break;
            case 'countDocuments':
                result = await Model.countDocuments(params);
                break;
                break;
            case 'findById':
                result = await Model.findById(params);
                break;
            case 'findByIdAndUpdate':
                if (Array.isArray(params)) {
                    throw new Error("Invalid params for findByIdAndUpdate: expected an object with 'id' and 'updateData' properties.");
                }
                result = await Model.findByIdAndUpdate((params as CrudParams).id, (params as CrudParams).updateData, { new: true });
                break;
            case 'findByIdAndDelete':
                result = await Model.findByIdAndDelete(params);
                break;
            case 'findOneAndUpdate':
                if (Array.isArray(params)) {
                    throw new Error("Invalid params for findOneAndUpdate: expected an object with 'filter' and 'updateData' properties.");
                }
                result = await Model.findOneAndUpdate(params.filter, params.updateData, { new: true });
                break;
            case 'findOneAndDelete':
                result = await Model.findOneAndDelete(params);
                break;
            default:
                return { success: false, status: 400, message: `Action ${action} is not supported`, data: [] };
        }
        return { success: true, status: 200, message: 'Operation successful', data: result };

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, status: 500, message, data: [] };
    }


}