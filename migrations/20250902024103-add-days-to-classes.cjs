'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('classes', 'days', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: false,
      defaultValue: [], // empty array by default
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('classes', 'days');
  },
};
