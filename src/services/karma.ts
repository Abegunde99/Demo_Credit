import axios, { AxiosError } from 'axios';
import { KResponseData , IKarmaResponse} from '../interface';
import { ErrorResponse } from '../utils/errorResponse';
import environs from '../config/config';

class KarmaService {

    // async getKarma(email: string): Promise<KResponseData | IKarmaResponse> {
    //     try {
    //       const response = await axios.get<KResponseData>(
    //         `https://adjutor.lendsqr.com/v2/verification/karma/${email}`,
    //         {
    //           headers: {
    //             Authorization: `Bearer ${environs.KARMA_SECRET_KEY}`, // Ensure your environment variable is correctly set
    //             'Content-Type': 'application/json',
    //           },
    //         }
    //         );
            
    
    //       // Check the status of the response and return the appropriate data
    //       return response.data;
          
    //     } catch (error) {
    //         if (axios.isAxiosError(error)) {
    //           const axiosError = error as AxiosError;
    //           if (axiosError.response) {
    //             console.error('Response error data:', axiosError.response.data);
    //           } else if (axiosError.request) {
    //             console.error('Request error:', axiosError.request);
    //           } else {
    //             console.error('Unexpected error:', axiosError.message);
    //           }
    //         } else {
    //           console.error('Error getting karma:', error);
    //         }
    //     }
    // }
    
    async checkKarma(email: string): Promise<any> {
        try {
            const response  = await axios.get<KResponseData>(
                `https://adjutor.lendsqr.com/v2/verification/karma/${email}`,
                {
                    headers: {
                        Authorization: `Bearer ${environs.KARMA_SECRET_KEY}`, // Replace with your Karma secret key
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
              const axiosError = error as AxiosError;
              if (axiosError.response) {
                console.error('Response:', axiosError.response.data);
              } else if (axiosError.request) {
                console.error('Request error:', axiosError.request);
              } else {
                console.error('Unexpected error:', axiosError.message);
              }
            } else {
              console.error('Error getting karma:', error);
            }
        }
    }
}

export default new KarmaService();

// import axios, { AxiosError } from 'axios';

// interface IKarmaResponse {
//   status: string;
//   message: string;
//   meta: {
//     balance: number;
//   };
// }

// class ErrorResponse extends Error {
//   statusCode: number;

//   constructor(message: string, statusCode: number) {
//     super(message);
//     this.statusCode = statusCode;
//     Object.setPrototypeOf(this, new.target.prototype);
//   }
// }

// class KarmaService {
//   async checkKarma(): Promise<IKarmaResponse> {
//     try {
//       const response = await axios.get<IKarmaResponse>(
//         `https://adjutor.lendsqr.com/v2/verification/karma/preciousolanrewaju1998@gmail.com`,
//         {
//           headers: {
//             Authorization: `Bearer ${process.env.KARMA_SECRET_KEY}`, // Ensure your environment variable is correctly set
//             'Content-Type': 'application/json',
//           },
//         }
//       );
//       return response.data;
//     } catch (error) {
//       if (axios.isAxiosError(error)) {
//         const axiosError = error as AxiosError;
//         if (axiosError.response) {
//           console.error('Response error data:', axiosError.response.data);
//         } else if (axiosError.request) {
//           console.error('Request error:', axiosError.request);
//         } else {
//           console.error('Unexpected error:', axiosError.message);
//         }
//       } else {
//         console.error('Error getting karma:', error);
//       }
//       throw new ErrorResponse('Failed to get karma', 500);
//     }
//   }
// }

// export default new KarmaService();

