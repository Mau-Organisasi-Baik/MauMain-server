import bcrypt from "bcryptjs";

export function hashPass(plainPass: string):string {
    return bcrypt.hashSync(plainPass, bcrypt.genSaltSync(10));
}

export function comparePass(plainPass: string, hashedPass: string):boolean {
    return bcrypt.compareSync(plainPass, hashedPass);
}