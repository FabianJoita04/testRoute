using System;
using System.Collections.Generic;

namespace RouteOptimizer.Core.Controllers
{
    public class EmpTcm319Controller
    {
        private readonly EmpTcm319Service _service;

        public EmpTcm319Controller(EmpTcm319Service service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service), "Service cannot be null.");
        }

        public Response HandleRequest(Request request)
        {
            if (request == null)
            {
                throw new ArgumentNullException(nameof(request), "Request cannot be null.");
            }

            var responseData = _service.ProcessRequest(request.Data);
            return new Response
            {
                Data = responseData,
                StatusCode = 200
            };
        }
    }
}
