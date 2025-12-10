using System.Net;

namespace Login.DTO.Result
{
    public class BaseResult
    {
        public bool Ok { get; set; } = true;
        public string MensajeError { get; set; } = "";
        public HttpStatusCode StatusCode { get; set; } = HttpStatusCode.OK;

        public void SetError(string mensajeError, HttpStatusCode statusCode = HttpStatusCode.InternalServerError)
        {
            Ok = false;
            MensajeError = mensajeError;
            StatusCode = statusCode;
        }
    }
}