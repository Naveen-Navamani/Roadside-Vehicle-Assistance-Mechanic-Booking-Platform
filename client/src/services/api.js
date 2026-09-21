const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
export async function fetchCatalog() {
    const res = await fetch(`${API_BASE}/catalog`);
    return res.json();
}
export async function fetchPriceEstimate(params) {
    const res = await fetch(`${API_BASE}/pricing/estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
    });
    return res.json();
}
export async function createBooking(data) {
    const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok)
        throw new Error('Failed to create booking');
    return res.json();
}
export async function fetchBookings() {
    const res = await fetch(`${API_BASE}/bookings`);
    return res.json();
}
export async function fetchBooking(id) {
    const res = await fetch(`${API_BASE}/bookings/${id}`);
    if (!res.ok)
        throw new Error('Booking not found');
    return res.json();
}
export async function acceptBooking(id, mechanicId) {
    const res = await fetch(`${API_BASE}/bookings/${id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mechanicId })
    });
    return res.json();
}
export async function updateBookingStatus(id, status, note) {
    const res = await fetch(`${API_BASE}/bookings/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note })
    });
    return res.json();
}
export async function addPartToBooking(id, name, price, quantity = 1) {
    const res = await fetch(`${API_BASE}/bookings/${id}/parts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price, quantity })
    });
    return res.json();
}
export async function submitBookingReview(id, stars, feedback) {
    const res = await fetch(`${API_BASE}/bookings/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stars, feedback })
    });
    return res.json();
}
export async function fetchMechanics() {
    const res = await fetch(`${API_BASE}/mechanics`);
    return res.json();
}
export async function updateMechanicStatus(id, status) {
    const res = await fetch(`${API_BASE}/mechanics/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
    return res.json();
}
export async function toggleMechanicVerification(id, verified) {
    const res = await fetch(`${API_BASE}/mechanics/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified })
    });
    return res.json();
}
export async function fetchAnalytics() {
    const res = await fetch(`${API_BASE}/analytics`);
    return res.json();
}
export async function resetDemoState() {
    await fetch(`${API_BASE}/reset-demo`, { method: 'POST' });
}
