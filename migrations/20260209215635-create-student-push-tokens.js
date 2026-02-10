"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("student_push_tokens", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "students", // <-- change if your table name differs
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      push_token: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true, // prevent duplicates across students/devices
      },

      platform: {
        type: Sequelize.STRING, // "ios" | "android" | "web"
        allowNull: true,
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    // Helpful index: quickly fetch active tokens by student
    await queryInterface.addIndex("student_push_tokens", ["student_id"]);
    await queryInterface.addIndex("student_push_tokens", ["is_active"]);
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable("student_push_tokens");
  },
};
