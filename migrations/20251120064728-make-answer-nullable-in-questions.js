"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Make `answer` nullable
    await queryInterface.changeColumn("questions", "answer", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert back to NOT NULL (adjust defaultValue if needed)
    await queryInterface.changeColumn("questions", "answer", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "",
    });
  },
};
