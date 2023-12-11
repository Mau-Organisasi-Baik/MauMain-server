import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_CONNECTION_URI;
if (!uri) throw Error("invalid URI!");

export const client = new MongoClient(uri);
