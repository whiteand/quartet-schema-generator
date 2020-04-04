import { v } from "quartet";

export const checkPerson = v<Person>({
  id: v.string,
  name: v.string,
  age: v.number,
  friendsIds: v.arrayOf(v.string),
  isFrontend: v.boolean,
  phoneNumber: [null, v.string],
  gender: ["Male", "Female"],
});
