import { ObjectId } from "mongodb";
import { Player, User, ValidField, ValidPlayer } from "types/user";

export const usersDummy: User[] = [
  {
    _id: new ObjectId("1"),
    username: "ibra",
    email: "warissoon@email.com",
    password: "TestAdmin",
    role: "player",
    phoneNumber: "+6281570000000",
  },
  {
    _id: new ObjectId("2"),
    username: "anakbaik",
    email: "anakbaik@email.com",
    password: "TestAdmin",
    role: "player",
    phoneNumber: "+6281570001000",
  },
  {
    _id: new ObjectId("3"),
    username: "testadmin",
    email: "admin@email.com",
    password: "TestAdmin",
    role: "field",
    phoneNumber: "+6281570001329",
  },
  {
    _id: new ObjectId("4"),
    username: "testadmin2",
    email: "admin2@email.com",
    password: "TestAdmin2",
    role: "field",
    phoneNumber: "+6281570001329",
  },
  {
    _id: new ObjectId("5"),
    username: "temanbaik",
    email: "temanbaik@email.com",
    password: "TestAdmin",
    role: "player",
    phoneNumber: "+6281570001000",
  },
  {
    _id: new ObjectId("6"),
    username: "temanbaik2",
    email: "temanbaik2@email.com",
    password: "TestAdmin",
    role: "player",
    phoneNumber: "+6281570001000",
  },
  {
    _id: new ObjectId("7"),
    username: "temanbaik3",
    email: "temanbaik3@email.com",
    password: "TestAdmin",
    role: "player",
    phoneNumber: "+6281570001000",
  },
  {
    _id: new ObjectId("8"),
    username: "temanbaik4",
    email: "temanbaik4@email.com",
    password: "TestAdmin",
    role: "player",
    phoneNumber: "+6281570001000",
  },
  {
    _id: new ObjectId("9"),
    username: "temanbaik5",
    email: "temanbaik5@email.com",
    password: "TestAdmin",
    role: "player",
    phoneNumber: "+6281570001000",
  },
  {
    _id: new ObjectId("10"),
    username: "temanbaik6",
    email: "temanbaik6@email.com",
    password: "TestAdmin",
    role: "player",
    phoneNumber: "+6281570001000",
  },
  {
    _id: new ObjectId("11"),
    username: "temanbaik7",
    email: "temanbaik7@email.com",
    password: "TestAdmin",
    role: "player",
    phoneNumber: "+6281570001000",
  },
  {
    _id: new ObjectId("12"),
    username: "temanbaik8",
    email: "temanbaik8@email.com",
    password: "TestAdmin",
    role: "player",
    phoneNumber: "+6281570001000",
  },
  {
    _id: new ObjectId("13"),
    username: "temanbaik9",
    email: "temanbaik9@email.com",
    password: "TestAdmin",
    role: "player",
    phoneNumber: "+6281570001000",
  },
];

export const playersDummy: ValidPlayer[] = [
  {
    _id: new ObjectId(1),
    UserId: new ObjectId(1),
    user: usersDummy[0],
    profilePictureUrl: "https://wallpapers-clan.com/wp-content/uploads/2022/08/default-pfp-1.jpg",
    exp: 1000,
    name: "player1",
  },
  {
    _id: new ObjectId(2),
    UserId: new ObjectId(2),
    user: usersDummy[1],
    profilePictureUrl: "https://wallpapers-clan.com/wp-content/uploads/2022/08/default-pfp-1.jpg",
    exp: 1000,
    name: "player2",
  },
  {
    _id: new ObjectId(3),
    UserId: new ObjectId(5),
    user: usersDummy[4],
    profilePictureUrl: "https://wallpapers-clan.com/wp-content/uploads/2022/08/default-pfp-1.jpg",
    exp: 1000,
    name: "player3",
  },
  {
    _id: new ObjectId(4),
    UserId: new ObjectId(6),
    user: usersDummy[1],
    profilePictureUrl: "https://wallpapers-clan.com/wp-content/uploads/2022/08/default-pfp-1.jpg",
    exp: 1000,
    name: "player4",
  },
  {
    _id: new ObjectId(5),
    UserId: new ObjectId(7),
    user: usersDummy[1],
    profilePictureUrl: "https://wallpapers-clan.com/wp-content/uploads/2022/08/default-pfp-1.jpg",
    exp: 1000,
    name: "player5",
  },
  {
    _id: new ObjectId(6),
    UserId: new ObjectId(8),
    user: usersDummy[1],
    profilePictureUrl: "https://wallpapers-clan.com/wp-content/uploads/2022/08/default-pfp-1.jpg",
    exp: 1000,
    name: "player6",
  },
  {
    _id: new ObjectId(7),
    UserId: new ObjectId(9),
    user: usersDummy[1],
    profilePictureUrl: "https://wallpapers-clan.com/wp-content/uploads/2022/08/default-pfp-1.jpg",
    exp: 1000,
    name: "player7",
  },
  {
    _id: new ObjectId(8),
    UserId: new ObjectId(10),
    user: usersDummy[1],
    profilePictureUrl: "https://wallpapers-clan.com/wp-content/uploads/2022/08/default-pfp-1.jpg",
    exp: 1000,
    name: "player8",
  },
  {
    _id: new ObjectId(9),
    UserId: new ObjectId(11),
    user: usersDummy[1],
    profilePictureUrl: "https://wallpapers-clan.com/wp-content/uploads/2022/08/default-pfp-1.jpg",
    exp: 1000,
    name: "player9",
  },
  {
    _id: new ObjectId(10),
    UserId: new ObjectId(12),
    user: usersDummy[1],
    profilePictureUrl: "https://wallpapers-clan.com/wp-content/uploads/2022/08/default-pfp-1.jpg",
    exp: 1000,
    name: "player10",
  },
  {
    _id: new ObjectId(11),
    UserId: new ObjectId(13),
    user: usersDummy[1],
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

export const tagsDummy: tag[] = [
  {
    _id: new ObjectId(1),
    name: "Basketball",
    limit: 10,
  },
  {
    _id: new ObjectId(2),
    name: "Futsal",
    limit: 10,
  },
  {
    _id: new ObjectId(3),
    name: "Volley",
    limit: 12,
  },
];

export const fieldsDummy: ValidField[] = [
  {
    _id: new ObjectId(1),
    UserId: new ObjectId(3),
    user: usersDummy[2],
    name: "Futsal Court Cilandak Sport Centre",
    address: "Jl. TB Simatupang No.Kav. 17, Cilandak Bar., Kec. Cilandak, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12430",
    coordinates: [-6.2898551, 106.8002198],
    photoUrls: [
      "https://lh5.googleusercontent.com/p/AF1QipOkLXBTYhhcJKa16WiQWBi298DLWAR2bZugeGzk=s644-k-no",
      "https://lh5.googleusercontent.com/p/AF1QipNJnCqmN9pad85KsQDGc0oFVcmiWBV_KMHmUE5f=w203-h152-k-no",
      "https://lh5.googleusercontent.com/p/AF1QipPxgj-PlQzCNcanXn2a83qUIqfOivXUqM8Itvs=s483-k-no",
    ],
    tags: [
      // tags[1]
    ],
  },
  {
    _id: new ObjectId(2),
    UserId: new ObjectId(4),
    user: usersDummy[3],
    name: "Basket Court Lapangan Banteng",
    address: "Jl. Lap. Banteng Barat No.3, RW.4, Ps. Baru, Kecamatan Sawah Besar, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10710",
    coordinates: [-6.1703204, 106.8309775],
    photoUrls: [
      "https://lh5.googleusercontent.com/p/AF1QipOkLXBTYhhcJKa16WiQWBi298DLWAR2bZugeGzk=s644-k-no",
      "https://lh5.googleusercontent.com/p/AF1QipNJnCqmN9pad85KsQDGc0oFVcmiWBV_KMHmUE5f=w203-h152-k-no",
      "https://lh5.googleusercontent.com/p/AF1QipPxgj-PlQzCNcanXn2a83qUIqfOivXUqM8Itvs=s483-k-no",
    ],
    tags: [
      // todo: perbaiki ini
      // tags[0],
      // tags[1]
    ],
  },
];

interface Schedule {
  _id: ObjectId;
  TimeStart: string;
  TimeEnd: string;
  repeat: boolean;
}

export const schedulesDummy: Schedule[] = [
  {
    _id: new ObjectId(1),
    TimeStart: "T18:00:00.000Z",
    TimeEnd: "T19:00:00.000Z",
    repeat: true,
  },
  {
    _id: new ObjectId(2),
    TimeStart: "T19:30:00.000Z",
    TimeEnd: "T20:30:00.000Z",
    repeat: false,
  },
  {
    _id: new ObjectId(3),
    TimeStart: "T21:00:00.000Z",
    TimeEnd: "T22:30:00.000Z",
    repeat: false,
  },
];

interface Reservation {
  _id: ObjectId;
  fieldId: ObjectId;
  tag?: tag;
  type?: "competitive" | "casual" | "";
  score?: string;
  status?: "upcoming" | "playing" | "ended";
  schedule: Schedule;
  date: string;
  players: Omit<ValidPlayer, "user">[];
}

export const reservations: Reservation[] = [
  {
    _id: new ObjectId(1),
    fieldId: new ObjectId(1),
    tag: tagsDummy[1],
    type: "competitive",
    score: "33-2",
    status: "ended",
    schedule: schedulesDummy[0],
    date: "2023-12-18",
    players: [...playersDummy.slice(0, 8)],
  },
  {
    _id: new ObjectId(2),
    fieldId: new ObjectId(2),
    tag: tagsDummy[0],
    type: "casual",
    score: "",
    status: "playing",
    schedule: schedulesDummy[1],
    date: "2023-12-18",
    players: [...playersDummy.slice(0, 3), playersDummy[8], ...playersDummy.slice(5, 7), playersDummy[4]],
  },
  {
    _id: new ObjectId(3),
    fieldId: new ObjectId(1),
    tag: tagsDummy[0],
    status: "upcoming",
    schedule: schedulesDummy[2],
    date: "2023-12-18",
    players: [],
  },
];
