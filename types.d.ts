// TODO is needed? any alternate way?
declare namespace Express {
  export interface Request {
    user: any;
    file: any;
  }
  export interface Response {
    user: any;
  }
}
