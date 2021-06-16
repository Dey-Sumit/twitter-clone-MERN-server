declare namespace Express {
  export interface Request {
    user: {
      _id: string;
    };
    file: any;
  }
  export interface Response {
    user: any;
  }
}
