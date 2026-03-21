// Middleware/ErrorHandlerMiddleware.cs
using System.Net;
using System.Text.Json;

namespace Restaurant_Application.Middleware
{
    public class ErrorHandlerMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlerMiddleware> _logger;
        private readonly IHostEnvironment _env;

        public ErrorHandlerMiddleware(RequestDelegate next, ILogger<ErrorHandlerMiddleware> logger, IHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception has occurred.");

                var response = context.Response;
                response.ContentType = "application/json";
                
                // Determinar el código de estado basado en el tipo de excepción
                response.StatusCode = ex switch
                {
                    // Puedes añadir casos para excepciones personalizadas aquí
                    // KeyNotFoundException => (int)HttpStatusCode.NotFound,
                    _ => (int)HttpStatusCode.InternalServerError
                };
                
                // Crear el cuerpo de la respuesta
                var errorResponse = new
                {
                    statusCode = response.StatusCode,
                    message = "An internal server error has occurred. Please try again later."
                };

                // En desarrollo, podemos incluir más detalles para facilitar la depuración.
                if (_env.IsDevelopment())
                {
                    errorResponse = new
                    {
                        statusCode = response.StatusCode,
                        message = ex.Message, // Mensaje de error real
                        stackTrace = ex.StackTrace // Stack trace de la excepción
                    };
                }

                var jsonResponse = JsonSerializer.Serialize(errorResponse);
                await response.WriteAsync(jsonResponse);
            }
        }
    }
}
