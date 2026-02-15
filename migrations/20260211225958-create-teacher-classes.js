"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("teacher_classes", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },

      classId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "classes", // ✅ must match your actual classes TABLE name
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      teacherId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "teachers", // ✅ must match your actual teachers TABLE name
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });

    // ✅ enforce uniqueness per teacher/class
    await queryInterface.addConstraint("teacher_classes", {
      fields: ["teacherId", "classId"],
      type: "unique",
      name: "uniq_teacher_classes_teacherId_classId",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("teacher_classes");
  },
};