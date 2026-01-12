export type JwtPayload = {
  sub: string;
  username: string;
  email: string;
  role: string;
  exp: number;
};

export type Variables = {
  jwtPayload: JwtPayload;
};
