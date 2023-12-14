import { client } from "../../config/db";
import { Db, ObjectId } from "mongodb";
import { NextFunction, Response } from "express";
import { ServerResponse, UserRequest } from "../../types/response";
import { FIELDS_COLLECTION_NAME, PLAYERS_COLLECTION_NAME, RESERVATION_COLLECTION_NAME } from "../../config/names";
import { Player, PlayerProfile, User, ValidField } from "../../types/user";
import { Reservation } from "types/reservation";

let DATABASE_NAME = process.env.DATABASE_NAME;
if(process.env.NODE_ENV) {
    DATABASE_NAME = process.env.DATABASE_NAME_TEST;
}
const db: Db = client.db(DATABASE_NAME);

export default class ReservationController {
    static async getFieldReservations(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const { fieldId } = req.params;
            
            const field = await db.collection(FIELDS_COLLECTION_NAME).findOne({ _id: new ObjectId(fieldId) }) as ValidField;

            if(!field) {
                throw { name: "DataNotFound", field: "Field" };
            }

            const reservations = await db.collection(RESERVATION_COLLECTION_NAME).find({ fieldId: field._id }).toArray() as Reservation[];

            return res.status(200).json({
                statusCode: 200,
                message: "Field reservations retrieved successfully",
                data: {
                    reservations: reservations
                }
            } as ServerResponse);
        }
        catch(error) {
            next(error);
        }
    }
    static async getReservationById(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const { reservationId } = req.params;
            const reservation = await db.collection(RESERVATION_COLLECTION_NAME).findOne({ _id: new ObjectId(reservationId) }) as Reservation;

            if(!reservation) {
                throw { name: "DataNotFound", field: "Reservation" };
            }

            return res.status(200).json({
                statusCode: 200,
                message: "Field reservations retrieved successfully",
                data: {
                    reservations: reservation
                }
            } as ServerResponse);
        }
        catch(error) {
            next(error);
        }
    }
}