"""Markerele S5, generate din profilurile agentului (versiunea 515ed82e1815). Nu se editeaza manual."""

MARKERS = {
    'happyPath': 'intent: The criterion is satisfied with valid, expected input under normal conditions.',
    'edgeCase': 'intent: Boundary values, empty and maximal inputs, and states the criterion mentions only implicitly.',
    'errorPath': 'intent: Invalid input or a failing dependency produces the specified failure, not a crash.',
    'security': 'intent: Input that crosses a trust boundary is rejected or neutralised: injection, malformed payloads, missing authorisation.',
    'regression': 'intent: A behaviour the criterion pins down explicitly because it broke before and must stay fixed.',
    'unitTest': 'level: The code under test runs inside the pytest process; collaborators are doubles, not real dependencies.',
    'integrationTest': 'level: The test crosses into a real dependency to observe an internal effect, instead of driving the system through its public interface.',
    'e2e': 'level: The test drives the running system through the same external interface a real caller would use.',
    'cli': 'boundary: reaches a built executable or entry point invoked as a subprocess',
    'dbState': 'boundary: reaches the datastore the module writes to, inspected after an action',
    'httpApi': 'boundary: reaches a running service over HTTP',
    'inProcess': 'boundary: reaches the module directly, imported into the pytest process',
}


def pytest_configure(config):
    for marker, description in MARKERS.items():
        config.addinivalue_line("markers", f"{marker}: {description}")
