
enum Gender {
  Male = 'Male',
  Female = 'Female',
}

export interface Person {
  id: string
  name: string
  age: number
  friendsIds: string[]
  isFrontend: boolean
  phoneNumber: null | string
  // gender: 'male' | 'female'
  gender: Gender
// }
}
// validate: IOptionChainSubscribedMessage
