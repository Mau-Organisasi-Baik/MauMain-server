import { Db, ObjectId } from "mongodb";
import { Player, User, ValidField, ValidPlayer } from "../../types/user";
import { hashPass } from "../../src/helpers/bcrypt";
import { Reservation, UpcomingReservation } from "../../types/reservation";
import { Schedule } from "../../types/schedule";
import { UserLoginInput } from "../../types/inputs";
import { client } from "../../config/db";
import {
  FIELDS_COLLECTION_NAME,
  PLAYERS_COLLECTION_NAME,
  RESERVATION_COLLECTION_NAME,
  TAGS_COLLECTION_NAME,
  USERS_COLLECTION_NAME,
} from "../../config/names";

var mongoObjectId = function () {
  var timestamp = ((new Date().getTime() / 1000) | 0).toString(16);
  return (
    timestamp +
    "xxxxxxxxxxxxxxxx"
      .replace(/[x]/g, function () {
        return ((Math.random() * 16) | 0).toString(16);
      })
      .toLowerCase()
  );
};

const playerLoginDummy: UserLoginInput[] = [
  { usernameOrMail: "ibra", password: "TestAdmin" },
  { usernameOrMail: "anakbaik", password: "TestAdmin" },
  { usernameOrMail: "temanbaik", password: "TestAdmin" },
  { usernameOrMail: "temanbaik2", password: "TestAdmin" },
  { usernameOrMail: "temanbaik3", password: "TestAdmin" },
  { usernameOrMail: "temanbaik4", password: "TestAdmin" },
  { usernameOrMail: "temanbaik5", password: "TestAdmin" },
  { usernameOrMail: "temanbaik6", password: "TestAdmin" },
  { usernameOrMail: "temanbaik7", password: "TestAdmin" },
  { usernameOrMail: "temanbaik8", password: "TestAdmin" },
  { usernameOrMail: "temanbaik9", password: "TestAdmin" },
];

const fieldLoginDummy: UserLoginInput[] = [
  { usernameOrMail: "testadmin", password: "TestAdmin" },
  { usernameOrMail: "testadmin2", password: "TestAdmin" },
];

const usersDummy: User[] = [
  {
    _id: new ObjectId(mongoObjectId()),
    username: "ibra",
    email: "warissoon@email.com",
    password: hashPass("TestAdmin"),
    role: "player",
    phoneNumber: "+6281570000000",
  },
  {
    _id: new ObjectId(mongoObjectId()),
    username: "anakbaik",
    email: "anakbaik@email.com",
    password: hashPass("TestAdmin"),
    role: "player",
    phoneNumber: "+6281570001000",
  },
  {
    _id: new ObjectId(mongoObjectId()),
    username: "testadmin",
    email: "admin@email.com",
    password: hashPass("TestAdmin"),
    role: "field",
    phoneNumber: "+6281570001329",
  },
  {
    _id: new ObjectId(mongoObjectId()),
    username: "testadmin2",
    email: "admin2@email.com",
    password: hashPass("TestAdmin2"),
    role: "field",
    phoneNumber: "+6281570001329",
  },
  {
    _id: new ObjectId(mongoObjectId()),
    username: "temanbaik",
    email: "temanbaik@email.com",
    password: hashPass("TestAdmin"),
    role: "player",
    phoneNumber: "+6281570001000",
  },
  {
    _id: new ObjectId(mongoObjectId()),
    username: "temanbaik2",
    email: "temanbaik2@email.com",
    password: hashPass("TestAdmin"),
    role: "player",
    phoneNumber: "+6281570001000",
  },
  {
    _id: new ObjectId(mongoObjectId()),
    username: "temanbaik3",
    email: "temanbaik3@email.com",
    password: hashPass("TestAdmin"),
    role: "player",
    phoneNumber: "+6281570001000",
  },
  {
    _id: new ObjectId(mongoObjectId()),
    username: "temanbaik4",
    email: "temanbaik4@email.com",
    password: hashPass("TestAdmin"),
    role: "player",
    phoneNumber: "+6281570001000",
  },
  {
    _id: new ObjectId(mongoObjectId()),
    username: "temanbaik5",
    email: "temanbaik5@email.com",
    password: hashPass("TestAdmin"),
    role: "player",
    phoneNumber: "+6281570001000",
  },
  {
    _id: new ObjectId(mongoObjectId()),
    username: "temanbaik6",
    email: "temanbaik6@email.com",
    password: hashPass("TestAdmin"),
    role: "player",
    phoneNumber: "+6281570001000",
  },
  {
    _id: new ObjectId(mongoObjectId()),
    username: "temanbaik7",
    email: "temanbaik7@email.com",
    password: hashPass("TestAdmin"),
    role: "player",
    phoneNumber: "+6281570001000",
  },
  {
    _id: new ObjectId(mongoObjectId()),
    username: "temanbaik8",
    email: "temanbaik8@email.com",
    password: hashPass("TestAdmin"),
    role: "player",
    phoneNumber: "+6281570001000",
  },
  {
    _id: new ObjectId(mongoObjectId()),
    username: "temanbaik9",
    email: "temanbaik9@email.com",
    password: hashPass("TestAdmin"),
    role: "player",
    phoneNumber: "+6281570001000",
  },
];

const playersDummy: ValidPlayer[] = [
  {
    _id: new ObjectId(mongoObjectId()),
    UserId: usersDummy[0]._id,
    user: usersDummy[0],
    profilePictureUrl: "https://wallpapers-clan.com/wp-content/uploads/2022/08/default-pfp-1.jpg",
    exp: 1000,
    name: "player1",
  },
  {
    _id: new ObjectId(mongoObjectId()),
    UserId: usersDummy[1]._id,
    user: usersDummy[1],
    profilePictureUrl: "https://wallpapers-clan.com/wp-content/uploads/2022/08/default-pfp-1.jpg",
    exp: 1000,
    name: "player2",
  },
  {
    _id: new ObjectId(mongoObjectId()),
    UserId: usersDummy[4]._id,
    user: usersDummy[4],
    profilePictureUrl: "https://wallpapers-clan.com/wp-content/uploads/2022/08/default-pfp-1.jpg",
    exp: 1000,
    name: "player3",
  },
  {
    _id: new ObjectId(mongoObjectId()),
    UserId: usersDummy[5]._id,
    user: usersDummy[5],
    profilePictureUrl: "https://wallpapers-clan.com/wp-content/uploads/2022/08/default-pfp-1.jpg",
    exp: 1000,
    name: "player4",
  },
  {
    _id: new ObjectId(mongoObjectId()),
    UserId: usersDummy[6]._id,
    user: usersDummy[6],
    profilePictureUrl: "https://wallpapers-clan.com/wp-content/uploads/2022/08/default-pfp-1.jpg",
    exp: 1000,
    name: "player5",
  },
  {
    _id: new ObjectId(mongoObjectId()),
    UserId: usersDummy[7]._id,
    user: usersDummy[7],
    profilePictureUrl: "https://wallpapers-clan.com/wp-content/uploads/2022/08/default-pfp-1.jpg",
    exp: 1000,
    name: "player6",
  },
  {
    _id: new ObjectId(mongoObjectId()),
    UserId: usersDummy[8]._id,
    user: usersDummy[8],
    profilePictureUrl: "https://wallpapers-clan.com/wp-content/uploads/2022/08/default-pfp-1.jpg",
    exp: 1000,
    name: "player7",
  },
  {
    _id: new ObjectId(mongoObjectId()),
    UserId: usersDummy[9]._id,
    user: usersDummy[9],
    profilePictureUrl: "https://wallpapers-clan.com/wp-content/uploads/2022/08/default-pfp-1.jpg",
    exp: 1000,
    name: "player8",
  },
  {
    _id: new ObjectId(mongoObjectId()),
    UserId: usersDummy[10]._id,
    user: usersDummy[10],
    profilePictureUrl: "https://wallpapers-clan.com/wp-content/uploads/2022/08/default-pfp-1.jpg",
    exp: 1000,
    name: "player9",
  },
  {
    _id: new ObjectId(mongoObjectId()),
    UserId: usersDummy[11]._id,
    user: usersDummy[11],
    profilePictureUrl: "https://wallpapers-clan.com/wp-content/uploads/2022/08/default-pfp-1.jpg",
    exp: 1000,
    name: "player10",
  },
  {
    _id: new ObjectId(mongoObjectId()),
    UserId: usersDummy[12]._id,
    user: usersDummy[12],
    profilePictureUrl: "https://wallpapers-clan.com/wp-content/uploads/2022/08/default-pfp-1.jpg",
    exp: 1000,
    name: "player11",
  },
];

interface tag {
  _id: ObjectId;
  name: string;
  limit: number;
}

const tagsDummy: tag[] = [
  {
    _id: new ObjectId(mongoObjectId()),
    name: "Basketball",
    limit: 10,
  },
  {
    _id: new ObjectId(mongoObjectId()),
    name: "Futsal",
    limit: 10,
  },
  {
    _id: new ObjectId(mongoObjectId()),
    name: "Volley",
    limit: 12,
  },
];

const schedulesDummyField1: Schedule[] = [
  {
    _id: new ObjectId(mongoObjectId()),
    TimeStart: "T18:00:00.000Z",
    TimeEnd: "T19:00:00.000Z",
    repeat: true,
  },
  {
    _id: new ObjectId(mongoObjectId()),
    TimeStart: "T19:30:00.000Z",
    TimeEnd: "T20:30:00.000Z",
    repeat: false,
  },
  {
    _id: new ObjectId(mongoObjectId()),
    TimeStart: "T21:00:00.000Z",
    TimeEnd: "T22:30:00.000Z",
    repeat: true,
  },
];

const schedulesDummyField2: Schedule[] = [
  {
    _id: new ObjectId(mongoObjectId()),
    TimeStart: "T18:00:00.000Z",
    TimeEnd: "T19:00:00.000Z",
    repeat: true,
  },
  {
    _id: new ObjectId(mongoObjectId()),
    TimeStart: "T19:30:00.000Z",
    TimeEnd: "T20:30:00.000Z",
    repeat: false,
  },
  {
    _id: new ObjectId(mongoObjectId()),
    TimeStart: "T21:00:00.000Z",
    TimeEnd: "T22:30:00.000Z",
    repeat: false,
  },
];

const fieldsDummy: ValidField[] = [
  {
    _id: new ObjectId(mongoObjectId()),
    UserId: usersDummy[2]._id,
    user: usersDummy[2],
    name: "Futsal Court Cilandak Sport Centre",
    address: "Jl. TB Simatupang No.Kav. 17, Cilandak Bar., Kec. Cilandak, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12430",
    coordinates: [-6.2898551, 106.8002198],
    photoUrls: [
      "https://lh5.googleusercontent.com/p/AF1QipOkLXBTYhhcJKa16WiQWBi298DLWAR2bZugeGzk=s644-k-no",
      "https://lh5.googleusercontent.com/p/AF1QipNJnCqmN9pad85KsQDGc0oFVcmiWBV_KMHmUE5f=w203-h152-k-no",
      "https://lh5.googleusercontent.com/p/AF1QipPxgj-PlQzCNcanXn2a83qUIqfOivXUqM8Itvs=s483-k-no",
    ],
    tags: [tagsDummy[1]],
    schedules: schedulesDummyField1,
  },
  {
    _id: new ObjectId(mongoObjectId()),
    UserId: usersDummy[3]._id,
    user: usersDummy[3],
    name: "Basket Court Lapangan Banteng",
    address: "Jl. Lap. Banteng Barat No.3, RW.4, Ps. Baru, Kecamatan Sawah Besar, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10710",
    coordinates: [-6.1703204, 106.8309775],
    photoUrls: [
      "https://lh5.googleusercontent.com/p/AF1QipOkLXBTYhhcJKa16WiQWBi298DLWAR2bZugeGzk=s644-k-no",
      "https://lh5.googleusercontent.com/p/AF1QipNJnCqmN9pad85KsQDGc0oFVcmiWBV_KMHmUE5f=w203-h152-k-no",
      "https://lh5.googleusercontent.com/p/AF1QipPxgj-PlQzCNcanXn2a83qUIqfOivXUqM8Itvs=s483-k-no",
    ],
    tags: [tagsDummy[0], tagsDummy[1]],
    schedules: schedulesDummyField2,
  },
];

const normalReservations: Reservation[] = [
  {
    _id: new ObjectId(mongoObjectId()),
    fieldId: fieldsDummy[0]._id,
    tag: tagsDummy[1],
    type: "competitive",
    score: "33-2",
    status: "ended",
    schedule: fieldsDummy[0].schedules[0],
    date: "2023-12-18",
    players: [...playersDummy.slice(0, 8)],
  },
  {
    _id: new ObjectId(mongoObjectId()),
    fieldId: fieldsDummy[1]._id,
    tag: tagsDummy[1],
    type: "casual",
    status: "upcoming",
    schedule: fieldsDummy[1].schedules[2],
    date: "2023-12-18",
    players: [...playersDummy.slice(1, 3), ...playersDummy.slice(5, 7), playersDummy[4]],
  },
];

const fullReservation: UpcomingReservation = {
  _id: new ObjectId(mongoObjectId()),
  fieldId: fieldsDummy[1]._id,
  tag: tagsDummy[0],
  type: "casual",
  status: "upcoming",
  schedule: fieldsDummy[1].schedules[1],
  date: "2023-12-18",
  players: [...playersDummy.slice(0, 10)],
};

const reservationsDummy: Reservation[] = [...normalReservations, fullReservation];

let DATABASE_NAME = process.env.DATABASE_NAME;
if (process.env.NODE_ENV) {
  DATABASE_NAME = process.env.DATABASE_NAME_TEST;
}
const db: Db = client.db(DATABASE_NAME);

export async function setDummy(req, res, next) {
  await db.collection(TAGS_COLLECTION_NAME).deleteMany({});
  await db.collection(USERS_COLLECTION_NAME).deleteMany({});
  await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
  await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
  await db.collection(RESERVATION_COLLECTION_NAME).deleteMany({});

  await db.collection(TAGS_COLLECTION_NAME).insertMany(tagsDummy);
  await db.collection(USERS_COLLECTION_NAME).insertMany(usersDummy);
  await db.collection(PLAYERS_COLLECTION_NAME).insertMany(playersDummy);
  await db.collection(FIELDS_COLLECTION_NAME).insertMany(fieldsDummy);
  await db.collection(RESERVATION_COLLECTION_NAME).insertMany(reservationsDummy);

  res.status(200).json({ message: "Dummy created successfully" });
}
