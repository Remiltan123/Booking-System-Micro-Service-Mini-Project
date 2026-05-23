const profileUpdatedTemplate = ({ name }) => {
  return `
    <div style="font-family: Arial; padding: 20px;">
      <h2>Profile Updated</h2>
      <p>Hello ${name || "there"},</p>
      <p>Your TicketMaster profile was updated successfully.</p>
      <p>If you did not make this change, please contact support.</p>
    </div>
  `;
};

module.exports = { profileUpdatedTemplate };
