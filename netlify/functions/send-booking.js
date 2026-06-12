exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const {
    name, phone, email,
    year, make, model, color, condition,
    service,
    date, time, location, address,
    referral, message
  } = JSON.parse(event.body || '{}');

  const services = Array.isArray(service) ? service.join('<br>&bull; ') : service || 'None selected';
  const vehicle = [year, make, model, color].filter(Boolean).join(' ') || 'Not provided';

  const row = (label, value) => value
    ? `<tr>
        <td style="padding:6px 14px 6px 0;color:#888;font-size:13px;white-space:nowrap;vertical-align:top;width:140px;">${label}</td>
        <td style="padding:6px 0;font-size:13px;color:#18181B;">${value}</td>
       </tr>`
    : '';

  const section = (title, content) => `
    <tr><td colspan="2" style="padding:22px 0 8px 0;">
      <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#D4A84B;border-bottom:1.5px solid #E4E4E7;padding-bottom:7px;">${title}</p>
    </td></tr>
    ${content}
  `;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #E4E4E7;border-radius:12px;overflow:hidden;">

      <div style="background:#18181B;padding:28px 32px;">
        <p style="margin:0 0 4px;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#D4A84B;">New Booking Request</p>
        <h1 style="margin:0;font-size:24px;color:#ffffff;font-weight:600;">${name || 'Unknown Client'}</h1>
      </div>

      <div style="padding:8px 32px 28px;">
        <table style="width:100%;border-collapse:collapse;">

          ${section('Contact Info', `
            ${row('Phone', phone)}
            ${row('Email', email ? `<a href="mailto:${email}" style="color:#D4A84B;">${email}</a>` : '')}
          `)}

          ${section('Vehicle', `
            ${row('Vehicle', vehicle)}
            ${row('Condition', condition)}
          `)}

          ${section('Services Requested', `
            <tr><td colspan="2" style="padding:6px 0;font-size:13px;color:#18181B;">&bull; ${services}</td></tr>
          `)}

          ${section('Appointment', `
            ${row('Date', date)}
            ${row('Time', time)}
            ${row('Service Type', location)}
            ${row('Address', address)}
          `)}

          ${section('Other Details', `
            ${row('Heard About Us', referral)}
            ${row('Notes', message)}
          `)}

        </table>
      </div>

      <div style="background:#FAFAFA;padding:14px 32px;border-top:1px solid #E4E4E7;">
        <p style="margin:0;font-size:11px;color:#A1A1AA;">Submitted via braedonscarcare.com</p>
      </div>

    </div>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Bookings <bookings@braedonscarcare.com>',
      to: 'braedonscarcare@gmail.com',
      reply_to: email || undefined,
      subject: `New Booking - ${name} | ${vehicle}`,
      html,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    return { statusCode: 500, body: `Email failed: ${error}` };
  }

  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
