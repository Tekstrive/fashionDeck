/**
 * Global Exception Filter
 * 
 * Catches all unhandled exceptions and returns consistent error responses.
 * Never exposes internal error details to clients in production.
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Determine status code
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Determine error message
    let message: string | object = 'Internal server error';
    let error = 'InternalServerError';

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        error = (exceptionResponse as any).error || error;
      }
    } else if (exception instanceof Error) {
      // Log full error stack for debugging
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
      );
      
      // Don't expose error details in production
      if (process.env.NODE_ENV === 'production') {
        message = 'An unexpected error occurred';
      } else {
        message = exception.message;
      }
    }

    // Construct error response
    const errorResponse = {
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // Log error details
    this.logger.error(
      `HTTP ${status} Error - ${request.method} ${request.url}`,
      JSON.stringify(errorResponse),
    );

    // Send response
    response.status(status).json(errorResponse);
  }
}
