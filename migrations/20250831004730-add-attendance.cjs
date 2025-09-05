'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('attendance', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      online: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      in_person: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      recording: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      absent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'students', // matches StudentModel table name
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      class_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'classes', // matches ClassModel table name
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('attendance');
  },
};
