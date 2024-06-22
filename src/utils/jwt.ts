import { sign, verify } from "jsonwebtoken";
import environ from "../config/config"
class JwtUtility {
    static generateToken(id: number) {
      return sign({ _id: id }, environ.JWT_SECRET as string, {
        expiresIn: environ.JWT_EXPIRE as string,
      });
    }
  
    static validateToken(token: string, config: string) {
      return verify(token, config);
    }
}
  
export default JwtUtility;