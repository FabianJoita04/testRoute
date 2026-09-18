import pytest
import time
from datetime import datetime, timedelta

@pytest.mark.happyPath
@pytest.mark.httpApi
@pytest.mark.e2e
@pytest.mark.ac_index(1)
def test_enable_location_tracking_success(http_client, base_url):
    """
    Test that enabling location tracking via HTTP returns success and sets tracking state.
    """
    # vault_ref: realtime_tracking/start_endpoint/1
    response = http_client.post(f"{base_url}/api/tracking/start")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "active"
    assert "X-Tracking-ID" in response.headers

@pytest.mark.edgeCase
@pytest.mark.httpApi
@pytest.mark.e2e
@pytest.mark.ac_index(1)
def test_disable_location_tracking_success(http_client, base_url):
    """
    Test that disabling location tracking via HTTP returns success and clears tracking state.
    """
    # vault_ref: realtime_tracking/stop_endpoint/1
    # First enable tracking
    http_client.post(f"{base_url}/api/tracking/start")
    # Then disable tracking
    response = http_client.post(f"{base_url}/api/tracking/stop")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "inactive"

@pytest.mark.happyPath
@pytest.mark.httpApi
@pytest.mark.e2e
@pytest.mark.ac_index(2)
def test_stream_location_updates(http_client, base_url):
    """
    Test that location updates are streamed with valid payloads and correct frequency.
    """
    # vault_ref: realtime_tracking/stream_endpoint/1
    # Enable tracking first
    http_client.post(f"{base_url}/api/tracking/start")

    # Stream location updates
    response = http_client.get(f"{base_url}/api/location/stream")
    assert response.status_code == 200

    data = response.json()
    assert "lat" in data and "lng" in data
    assert "timestamp" in data

    # Verify timestamp is recent (within last 5 seconds)
    timestamp = datetime.fromisoformat(data["timestamp"].replace('Z', '+00:00'))
    assert timestamp > datetime.now() - timedelta(seconds=5)

@pytest.mark.edgeCase
@pytest.mark.httpApi
@pytest.mark.e2e
@pytest.mark.ac_index(3)
def test_fetch_current_location_boundary_values(http_client, base_url):
    """
    Test that current location returns valid boundary values for lat/lng.
    """
    # vault_ref: realtime_tracking/location_boundaries/1
    response = http_client.get(f"{base_url}/api/location/current")
    assert response.status_code == 200
    data = response.json()
    assert -90 <= data["lat"] <= 90
    assert -180 <= data["lng"] <= 180

@pytest.mark.happyPath
@pytest.mark.httpApi
@pytest.mark.e2e
@pytest.mark.ac_index(4)
def test_consent_location_tracking(http_client, base_url):
    """
    Test that location tracking requires explicit consent.
    """
    # vault_ref: realtime_tracking/consent_validation/1
    # Test with valid consent
    consent_response = http_client.post(
        f"{base_url}/api/consent/location",
        json={"consent": True},
        headers={"Authorization": "Bearer valid_token"}
    )
    assert consent_response.status_code == 200

    # Test with invalid consent (should be rejected)
    invalid_consent_response = http_client.post(
        f"{base_url}/api/consent/location",
        json={"consent": False},
        headers={"Authorization": "Bearer valid_token"}
    )
    assert invalid_consent_response.status_code == 403

@pytest.mark.errorPath
@pytest.mark.httpApi
@pytest.mark.e2e
@pytest.mark.ac_index(5)
def test_unauthorized_location_requests(http_client, base_url):
    """
    Test that unauthorized requests to fetch location are rejected.
    """
    # vault_ref: realtime_tracking/auth_validation/1
    # Test without authorization
    unauthorized_response = http_client.get(f"{base_url}/api/location/current")
    assert unauthorized_response.status_code == 401

    # Test with invalid token
    invalid_token_response = http_client.get(
        f"{base_url}/api/location/current",
        headers={"Authorization": "Bearer invalid_token"}
    )
    assert invalid_token_response.status_code == 403

@pytest.mark.edgeCase
@pytest.mark.httpApi
@pytest.mark.e2e
@pytest.mark.ac_index(6)
def test_malformed_gps_coordinates(http_client, base_url):
    """
    Test that malformed GPS coordinates are rejected with a descriptive error.
    """
    # vault_ref: realtime_tracking/validation/1
    malformed_response = http_client.post(
        f"{base_url}/api/tracking/start",
        json={"lat": "invalid", "lng": "invalid"}
    )
    assert malformed_response.status_code == 400
    assert "Invalid coordinates" in malformed_response.json()["error"]

@pytest.mark.edgeCase
@pytest.mark.httpApi
@pytest.mark.e2e
@pytest.mark.ac_index(7)
def test_throttle_location_updates(http_client, base_url):
    """
    Test that location updates are throttled to avoid excessive API calls.
    """
    # vault_ref: realtime_tracking/throttling/1
    # Enable tracking
    http_client.post(f"{base_url}/api/tracking/start")

    # Send rapid successive requests
    for _ in range(10):
        response = http_client.get(f"{base_url}/api/location/stream")
        assert response.status_code == 200
        assert "X-Rate-Limit-Remaining" in response.headers

    # After threshold, should return 429
    throttled_response = http_client.get(f"{base_url}/api/location/stream")
    assert throttled_response.status_code == 429

@pytest.mark.happyPath
@pytest.mark.httpApi
@pytest.mark.e2e
@pytest.mark.ac_index(8)
def test_clear_location_on_disable(http_client, base_url):
    """
    Test that location is cleared from the map when tracking is disabled.
    """
    # vault_ref: realtime_tracking/state_management/1
    # Enable tracking
    http_client.post(f"{base_url}/api/tracking/start")

    # Verify location is available
    location_response = http_client.get(f"{base_url}/api/location/current")
    assert location_response.status_code == 200
    assert location_response.json()["lat"] is not None

    # Disable tracking
    http_client.post(f"{base_url}/api/tracking/stop")

    # Verify location is cleared
    cleared_response = http_client.get(f"{base_url}/api/location/current")
    assert cleared_response.status_code == 200
    assert cleared_response.json()["lat"] is None
