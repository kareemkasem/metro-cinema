const pdfKit = require("pdfkit");

function makePdfTicket(res, movieTitle, date, time, ticketId) {
  const pdf = new pdfKit();
  pdf.pipe(res);
  pdf.fontSize(30).fillColor("red").text("METRO CINEMA", { align: "center" });
  pdf.text(" ").fontSize(15);

  pdf
    .fillColor("red")
    .text("Movie: ", { continued: true })
    .fillColor("black")
    .text(movieTitle);
  pdf.text(" ");

  pdf
    .fillColor("red")
    .text("Date: ", { continued: true })
    .fillColor("black")
    .text(date);
  pdf.text(" ");

  pdf
    .fillColor("red")
    .text("Time: ", { continued: true })
    .fillColor("black")
    .text(time);
  pdf.text(" ");

  pdf
    .fillColor("red")
    .text("Id: ", { continued: true })
    .fillColor("black")
    .text(ticketId);

  pdf.end();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline; filename=Metro Ticket.pdf");
}

module.exports = makePdfTicket;
