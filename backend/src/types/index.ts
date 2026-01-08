export type JwtPayload = {
  sub: string;
  role: string;
  exp: number;
};

export type Variables = {
  jwtPayload: JwtPayload;
};
