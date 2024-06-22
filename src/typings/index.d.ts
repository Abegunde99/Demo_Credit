declare module 'xss-clean' {
    import { RequestHandler } from 'express';

    // Define a generic type for the options parameter
    function xssClean<T = Record<string, unknown>>(options?: T): RequestHandler;

    export = xssClean;
}
