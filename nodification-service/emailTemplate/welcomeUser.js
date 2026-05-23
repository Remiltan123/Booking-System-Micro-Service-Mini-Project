const welcomeUserTemplate = ({ name }) => {
  return `
    <div style="font-family: Arial; padding: 20px;">
      <h2>Welcome to TicketMaster</h2>
      <p>Hello ${name || "there"},</p>
      <p>Your account has been created successfully.</p>
      <p>You can now browse movies and book your seats.</p>
    </div>
  `;
};

module.exports = { welcomeUserTemplate };
