import 'reflect-metadata';
/*
// example 1
function MyDecorator(metadata: string) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata("my-decorator", metadata, target, propertyKey);
  };
}

class MyClass {
  @MyDecorator("some metadata")
  myMethod() { }
}

const metadata = Reflect.getMetadata('my-decorator', MyClass.prototype, 'myMethod');
console.log(metadata); // some metadata
*/

// example 2
function Role(role: string, options?: Record<string, any>) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata('role', role, target, propertyKey);
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      console.log('args', args);
      console.log('Expected role', role, options);
      // if (!checkRole(role)) {
      //   throw new Error('Access denied');
      // }

      return originalMethod.apply(this, args);
    }
  }
}

class User {
  private _username: string;
  private _password: string;

  constructor(username: string, password: string) {
    this._username = username;
    this._password = password;
  }

  @Role('admin', { level: 1 })
  getUsername() {
    return this._username;
  }

  @Role('admin')
  setPassword(password: string) {
    this._password = password;
  }

  @Role('user')
  changePassword(oldPassword: string, newPassword: string) {
    if (this._password === oldPassword) {
      this._password = newPassword;
    } else {
      throw new Error("Invalid password");
    }
  }
}

const user = new User('John', 'password@123');
console.log("User:", user); // User: User { _username: 'John', _password: 'password@123' }

const role = Reflect.getMetadata('role', user, 'getUsername');
console.log("role:", role); // role: admin

const role2 = Reflect.getMetadata('role', user, 'setPassword');
console.log("role2:", role2); // role2: admin

const role3 = Reflect.getMetadata('role', user, 'changePassword');
console.log("role3:", role3); // role3: user

console.log('Calling getUsername');
user.getUsername();
/*
args []
Expected role admin { level: 1 }
*/

console.log('Calling changePassword');
user.changePassword('password@123', 'password@1234');
/*
args [ 'password@123', 'password@1234' ]
Expected role user undefined
*/
