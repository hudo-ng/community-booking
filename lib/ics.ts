function icsDate(d: Date) {
  const iso = d.toISOString().replace(/[:-]/, "");
  return iso.slice(0, 15) + "Z";
}

export function buildBookingIcs(opts: {
  uid: string;
  start: Date;
  end: Date;
  summary: string;
  description?: string;
  url?: string;
  location?: string;
}) {
  const { uid, start, end, summary, description, url, location } = opts;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Community Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${summary}`,
    ...(location ? [`LOCATION:${location}`] : []),
    ...(url ? [`URL:${url}`] : []),
    ...(description
      ? [`DESCRIPTION:${description.replace(/\r?\n/g, "\\n")}`]
      : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const content = lines.join("\r\n");
  return {
    filename: "booking.ics",
    contentType: "text/calendar",
    contentBase64: Buffer.from(content, "utf8").toString("base64"),
  };
}
