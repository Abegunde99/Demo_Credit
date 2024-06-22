declare module 'helmet' {
    import { RequestHandler } from 'express';

    // Define a generic type for the options parameter
    function helmet<T = Record<string, unknown>>(options?: T): RequestHandler;

    export = helmet;
}
