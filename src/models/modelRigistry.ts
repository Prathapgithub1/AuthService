import { UserModel } from "./user.model";

export const modelRegistry: { [key: string]: any } = {
    'User': UserModel
}