using System;
using RouteOptimizer.Core.Models;
using RouteOptimizer.Core.Services;

namespace RouteOptimizer.Core.Controllers
{
    public class GeolocationController
    {
        private readonly GeolocationService _geolocationService;

        public GeolocationController(GeolocationService geolocation_service)
        {
            _geolocationService = geolocation_service;
        }

        public Location GetLocation(string device_id)
        {
            return _geolocationService.GetLocation(device_id);
        }
    }
}
