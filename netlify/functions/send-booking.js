exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { name, contact, service, vehicle, message } = JSON.parse(event.body || '{}');

  const services = Array.isArray(service) ? service.join(', ') : service || 'None selected';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Bookings <bookings@braedonscarcare.com>',
      to: 'braedonscarcare@gmail.com',
      subject: `New Booking Request from ${name}`,
      html: `
        <h2>New Booking Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone / Email:</strong> ${contact}</p>
        <p><strong>Services:</strong> ${services}</p>
        <p><strong>Vehicle:</strong> ${vehicle || 'Not provided'}</p>
        <p><strong>Message:</strong> ${message || 'None'}</p>
      `,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    return { statusCode: 500, body: `Email failed: ${error}` };
  }

  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
