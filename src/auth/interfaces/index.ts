import { ERoles } from 'src/__shared__/enums/enum';

export interface JwtPayload {
  id: number;
  role: ERoles;
  email: string;
}
